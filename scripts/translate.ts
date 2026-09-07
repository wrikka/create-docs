#!/usr/bin/env bun
/**
 * create-docs translate — CI-friendly AI translation pipeline.
 *
 * Scans a docs directory, computes which (document, locale) pairs are missing
 * translations, and writes a `translation-plan.json`. With `--apply` and a
 * configured provider, it translates the pending tasks through an
 * OpenAI-compatible chat-completions endpoint.
 *
 * Usage:
 *   bun scripts/translate.ts --docs docs --locales th,ja [--out translation-plan.json]
 *   bun scripts/translate.ts --docs docs/docs/bun-packages --i18n i18n/bun-packages --locales th --apply [--limit 20]
 *
 * --i18n <dir>  Write translations to <dir>/<locale>/<file> instead of
 *               <docs>/<locale>/<file>. Use this when the docs directory is
 *               generated (e.g. pulled from GitHub and gitignored) so the
 *               translations live in a tracked folder that survives re-pulls.
 *
 * Environment:
 *   TRANSLATE_PROVIDER   e.g. "openai" (any OpenAI-compatible endpoint works)
 *   TRANSLATE_API_KEY    API key (falls back to OPENAI_API_KEY)
 *   TRANSLATE_BASE_URL   default https://api.openai.com/v1
 *   TRANSLATE_MODEL      default gpt-4o-mini
 *   TRANSLATE_CONCURRENCY default 3
 *   SOURCE_LOCALE        default en
 */

import {
	mkdirSync,
	readdirSync,
	readFileSync,
	statSync,
	writeFileSync,
} from "node:fs";
import * as path from "node:path";

interface CliArgs {
	docs: string;
	i18n: string;
	locales: string[];
	out: string;
	apply: boolean;
	limit: number;
}

function parseArgs(argv: string[]): CliArgs {
	const args: CliArgs = {
		docs: "docs",
		i18n: "",
		locales: [],
		out: "translation-plan.json",
		apply: false,
		limit: Number.POSITIVE_INFINITY,
	};
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		if (a === "--docs") args.docs = argv[++i] ?? args.docs;
		else if (a === "--i18n") args.i18n = argv[++i] ?? "";
		else if (a === "--apply") args.apply = true;
		else if (a === "--limit") args.limit = Number(argv[++i] ?? "0") || args.limit;
		else if (a === "--locales")
			args.locales = (argv[++i] ?? "")
				.split(",")
				.map((s) => s.trim())
				.filter(Boolean);
		else if (a === "--out") args.out = argv[++i] ?? args.out;
	}
	if (args.locales.length === 0) {
		console.error("Missing --locales (comma separated, e.g. --locales th,ja)");
		process.exit(1);
	}
	return args;
}

function walk(dir: string, prefix = ""): string[] {
	const out: string[] = [];
	for (const name of readdirSync(dir)) {
		if (name.startsWith(".") || name === "node_modules") continue;
		const abs = path.join(dir, name);
		const rel = prefix ? `${prefix}/${name}` : name;
		if (statSync(abs).isDirectory()) out.push(...walk(abs, rel));
		else if (/\.(md|mdx)$/i.test(name)) out.push(rel);
	}
	return out;
}

interface TranslateTask {
	source: string;
	target: string;
	locale: string;
	sourcePath: string;
	targetPath: string;
	status: "pending" | "translated" | "failed";
	error?: string;
}

const SYSTEM_PROMPT = `You are a technical documentation translator.
Translate the markdown document the user sends into the target language.

Rules:
- Keep YAML frontmatter keys unchanged; translate only human-readable string
  values (title, description, section, etc.). Keep the keys themselves in English.
- Do not translate: code blocks, inline code, URLs, import paths, identifiers,
  component names, or frontmatter keys.
- Preserve all markdown structure, heading levels, links, images, and
  frontmatter delimiters exactly.
- Output ONLY the translated document. No commentary, no wrapping fences.`;

async function translateFile(
	task: TranslateTask,
	localeName: string,
): Promise<void> {
	const baseUrl = (
		process.env.TRANSLATE_BASE_URL ?? "https://api.openai.com/v1"
	).replace(/\/$/, "");
	const apiKey = process.env.TRANSLATE_API_KEY ?? process.env.OPENAI_API_KEY;
	const model = process.env.TRANSLATE_MODEL ?? "gpt-4o-mini";
	if (!apiKey) throw new Error("TRANSLATE_API_KEY / OPENAI_API_KEY not set");

	const content = readFileSync(task.sourcePath, "utf8");
	const res = await fetch(`${baseUrl}/chat/completions`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`,
		},
		body: JSON.stringify({
			model,
			temperature: 0.2,
			messages: [
				{ role: "system", content: SYSTEM_PROMPT },
				{
					role: "user",
					content: `Target language: ${localeName}\n\n${content}`,
				},
			],
		}),
	});
	if (!res.ok) {
		throw new Error(`Provider ${res.status}: ${(await res.text()).slice(0, 300)}`);
	}
	const json = (await res.json()) as {
		choices?: { message?: { content?: string } }[];
	};
	const translated = json.choices?.[0]?.message?.content;
	if (!translated) throw new Error("Empty translation response");

	mkdirSync(path.dirname(task.targetPath), { recursive: true });
	writeFileSync(task.targetPath, translated, "utf8");
	task.status = "translated";
}

const LOCALE_NAMES: Record<string, string> = {
	th: "Thai",
	ja: "Japanese",
	zh: "Simplified Chinese",
	ko: "Korean",
	vi: "Vietnamese",
	id: "Indonesian",
	fr: "French",
	de: "German",
	es: "Spanish",
	pt: "Portuguese",
	hi: "Hindi",
};

async function main() {
	const args = parseArgs(process.argv.slice(2));
	const docsDir = path.resolve(args.docs);
	if (!statSync(docsDir, { throwIfNoEntry: false })?.isDirectory()) {
		console.error(`Docs directory not found: ${docsDir}`);
		process.exit(1);
	}

	const files = walk(docsDir).filter(
		// Never treat already-translated files (<dir>/<locale>/...) as sources.
		(f) => !args.locales.includes(f.split("/")[0] ?? ""),
	);
	const provider = process.env.TRANSLATE_PROVIDER;
	// Translations go to --i18n/<locale>/... when set, else <docs>/<locale>/...
	const targetRoot = args.i18n ? path.resolve(args.i18n) : docsDir;

	const plan = {
		generatedAt: new Date().toISOString(),
		provider: provider ?? "none",
		sourceLocale: process.env.SOURCE_LOCALE ?? "en",
		targetLocales: args.locales,
		docsDir: args.docs,
		tasks: [] as TranslateTask[],
	};

	let pending = 0;
	let done = 0;
	for (const file of files) {
		for (const locale of args.locales) {
			const targetPath = path.join(targetRoot, locale, file);
			const exists =
				statSync(targetPath, { throwIfNoEntry: false })?.isFile() ?? false;
			plan.tasks.push({
				source: file,
				target: `${locale}/${file}`,
				locale,
				sourcePath: path.join(docsDir, file),
				targetPath,
				status: exists ? "translated" : "pending",
			});
			if (exists) done++;
			else pending++;
		}
	}

	let applied = 0;
	let failed = 0;
	if (args.apply && provider) {
		const queue = plan.tasks
			.filter((t) => t.status === "pending")
			.slice(0, args.limit);
		const concurrency = Math.max(
			1,
			Number(process.env.TRANSLATE_CONCURRENCY ?? "3") || 3,
		);
		console.log(
			`[create-docs translate] applying ${queue.length} task(s) via ${provider} (concurrency ${concurrency})`,
		);
		let cursor = 0;
		const worker = async () => {
			while (cursor < queue.length) {
				const task = queue[cursor++];
				try {
					await translateFile(task, LOCALE_NAMES[task.locale] ?? task.locale);
					applied++;
					console.log(`  translated ${task.target}`);
				} catch (err) {
					failed++;
					task.status = "failed";
					task.error = err instanceof Error ? err.message : String(err);
					console.error(`  FAILED ${task.target}: ${task.error}`);
				}
			}
		};
		await Promise.all(
			Array.from({ length: Math.min(concurrency, queue.length) }, worker),
		);
		pending = plan.tasks.filter((t) => t.status === "pending").length;
		done = plan.tasks.filter((t) => t.status === "translated").length;
	}

	mkdirSync(path.dirname(path.resolve(args.out)), { recursive: true });
	writeFileSync(args.out, JSON.stringify(plan, null, 2), "utf8");

	console.log(
		`[create-docs translate] ${files.length} docs x ${args.locales.length} locales -> ${done} translated, ${pending} pending${applied ? `, ${applied} applied` : ""}${failed ? `, ${failed} failed` : ""}`,
	);
	console.log(`Plan written to ${path.resolve(args.out)}`);
	if (pending > 0 && !provider) {
		console.log(
			"No TRANSLATE_PROVIDER configured — plan emitted for review; set a provider + TRANSLATE_API_KEY and pass --apply to translate.",
		);
	}
	if (failed > 0) process.exit(1);
}

await main();

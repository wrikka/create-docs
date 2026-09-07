#!/usr/bin/env bun
/**
 * create-docs translate — CI-friendly AI translation planner.
 *
 * Scans a docs directory, computes which (document, locale) pairs are missing
 * translations, and writes a `translation-plan.json` that a CI workflow (or an
 * AI provider integration) can consume.
 *
 * Usage:
 *   bun scripts/translate.ts --docs docs --locales th,ja [--out translation-plan.json]
 *
 * The script is intentionally a planner: it does not call an AI provider yet.
 * To wire a real provider, set TRANSLATE_PROVIDER plus the provider's API key
 * (e.g. OPENAI_API_KEY) and pipe the emitted plan into your translation step.
 */

import {
	mkdirSync,
	readdirSync,
	statSync,
	writeFileSync,
} from "node:fs";
import * as path from "node:path";

interface CliArgs {
	docs: string;
	locales: string[];
	out: string;
}

function parseArgs(argv: string[]): CliArgs {
	const args: CliArgs = {
		docs: "docs",
		locales: [],
		out: "translation-plan.json",
	};
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		if (a === "--docs") args.docs = argv[++i] ?? args.docs;
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

function main() {
	const args = parseArgs(process.argv.slice(2));
	const docsDir = path.resolve(args.docs);
	if (!statSync(docsDir, { throwIfNoEntry: false })?.isDirectory()) {
		console.error(`Docs directory not found: ${docsDir}`);
		process.exit(1);
	}

	const files = walk(docsDir);
	const provider = process.env.TRANSLATE_PROVIDER ?? "ai";

	const plan = {
		generatedAt: new Date().toISOString(),
		provider,
		sourceLocale: process.env.SOURCE_LOCALE ?? "en",
		targetLocales: args.locales,
		docsDir: args.docs,
		tasks: [] as Array<{
			source: string;
			target: string;
			locale: string;
			sourcePath: string;
			targetPath: string;
			status: "pending" | "translated";
		}>,
	};

	let pending = 0;
	let done = 0;
	for (const file of files) {
		for (const locale of args.locales) {
			const targetPath = path.join(docsDir, locale, file);
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

	mkdirSync(path.dirname(path.resolve(args.out)), { recursive: true });
	writeFileSync(args.out, JSON.stringify(plan, null, 2), "utf8");

	console.log(
		`[create-docs translate] ${files.length} docs x ${args.locales.length} locales -> ${done} translated, ${pending} pending`,
	);
	console.log(`Plan written to ${path.resolve(args.out)}`);
	if (pending > 0 && !process.env.TRANSLATE_PROVIDER) {
		console.log(
			"No TRANSLATE_PROVIDER configured — plan emitted for review; set a provider + API key to run real translations.",
		);
	}
}

main();

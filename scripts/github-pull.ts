#!/usr/bin/env bun
/**
 * Build-time helper: pull markdown docs from one or more GitHub repositories.
 *
 * Usage:
 *   bun scripts/github-pull.ts --config create-docs.config.ts
 *
 * Config file (create-docs.config.ts):
 *   export default {
 *     outDir: "./docs-remote",
 *     sources: [
 *       { id: "rust-packages", repo: "wrikka/rust-packages", branch: "main", docsDir: "docs" },
 *     ],
 *   };
 */

import { existsSync } from "node:fs";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import { pullFromGitHub } from "../src/adapters/github/github-pull";

function parseArgs(argv: string[]) {
	const args: Record<string, string | undefined> = {};
	let i = 0;
	while (i < argv.length) {
		const a = argv[i];
		if (a === "--config" || a === "-c") {
			args.config = argv[++i];
		} else if (a.startsWith("--config=")) {
			args.config = a.slice("--config=".length);
		} else if (a === "--out" || a === "-o") {
			args.out = argv[++i];
		} else if (a.startsWith("--out=")) {
			args.out = a.slice("--out=".length);
		} else if (a === "--token" || a === "-t") {
			args.token = argv[++i];
		} else if (a.startsWith("--token=")) {
			args.token = a.slice("--token=".length);
		} else if (a === "--help" || a === "-h") {
			args.help = "1";
		}
		i++;
	}
	return args;
}

function usage() {
	console.log(`
Usage: bun scripts/github-pull.ts --config <create-docs.config.ts>

Options:
  -c, --config    Path to the pull config file (default: create-docs.config.ts)
  -o, --out       Override output directory from the config
  -t, --token     GitHub token (or set GITHUB_TOKEN)
  -h, --help      Show this message

Config example:
  export default {
    outDir: "./docs-remote",
    sources: [
      { id: "rust-packages", repo: "wrikka/rust-packages", branch: "main", docsDir: "docs" },
    ],
  };
`);
}

interface PullConfig {
	outDir?: string;
	sources: Array<{
		id: string;
		repo: string;
		branch?: string;
		docsDir?: string;
		label?: string;
		description?: string;
		icon?: string;
	}>;
}

async function loadConfig(configPath: string): Promise<PullConfig> {
	const abs = path.isAbsolute(configPath)
		? configPath
		: path.resolve(process.cwd(), configPath);
	if (!existsSync(abs)) {
		throw new Error(`Config not found: ${abs}`);
	}
	const mod = (await import(pathToFileURL(abs).href)) as {
		default?: PullConfig;
	};
	if (!mod.default) {
		throw new Error(`Config must have a default export: ${abs}`);
	}
	return mod.default;
}

async function main() {
	const args = parseArgs(process.argv.slice(2));
	if (args.help) {
		usage();
		process.exit(0);
	}

	const configPath = args.config ?? "create-docs.config.ts";
	const config = await loadConfig(configPath);
	const outDir = args.out ?? config.outDir ?? "docs-remote";

	const result = await pullFromGitHub({
		outDir,
		sources: config.sources,
		token: args.token ?? process.env.GITHUB_TOKEN,
	});

	console.log(
		`Pulled ${result.filesWritten} files for ${result.collections.length} collection(s) to ${result.outDir}`,
	);
	for (const c of result.collections) {
		console.log(`  - ${c.id}: ${c.label}`);
	}
}

main().catch((err) => {
	console.error(err instanceof Error ? err.message : err);
	process.exit(1);
});

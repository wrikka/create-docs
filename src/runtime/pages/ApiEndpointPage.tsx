import { useParams } from "@tanstack/solid-router";
import { createMemo, Show } from "solid-js";
import { ApiPlayground } from "../components/ApiPlayground";
import { DocMarkdown } from "../components/DocMarkdown";
import { DocPrevNext } from "../components/DocPrevNext";
import { findApiCollection, useDocs } from "../context";
import type { ApiEndpoint, DocEntry } from "../types";

const METHOD_BADGE: Record<string, string> = {
	GET: "bg-accent/15 text-accent border-accent/30",
	POST: "bg-success/15 text-success border-success/30",
	PUT: "bg-warning/15 text-warning border-warning/30",
	PATCH: "bg-warning/15 text-warning border-warning/30",
	DELETE: "bg-destructive/15 text-destructive border-destructive/30",
};

const STYLE_ICON: Record<string, string> = {
	rest: "i-mdi:earth",
	graphql: "i-mdi:graphql",
	cli: "i-mdi:console",
	rpc: "i-mdi:api",
};

function endpointMarkdown(ep: ApiEndpoint, style: string): string {
	const lines: string[] = [];

	if (style === "cli") {
		if (ep.description) lines.push(ep.description, "");
		const cmd = ep.cli
			? [ep.cli.command, ep.cli.subcommand, ...(ep.cli.args?.map((a) =>
					a.required ? `<${a.name}>` : `[${a.name}]`,
				) ?? []),
			].join(" ")
			: `${ep.method} ${ep.path}`;
		lines.push("## Usage", "", "```bash", cmd, "```", "");
		if (ep.cli?.args?.length) {
			lines.push(
				"## Arguments",
				"",
				"| Name | Required | Description |",
				"| --- | --- | --- |",
			);
			for (const a of ep.cli.args) {
				lines.push(
					`| \`${a.name}\` | ${a.required ? "yes" : "no"} | ${a.description ?? ""} |`,
				);
			}
			lines.push("");
		}
		if (ep.requestBody?.example != null) {
			lines.push("## Options", "");
			lines.push(
				"```json",
				JSON.stringify(ep.requestBody.example, null, 2),
				"```",
				"",
			);
		}
	} else if (style === "graphql") {
		if (ep.description) lines.push(ep.description, "");
		if (ep.graphql?.query) {
			lines.push("## Query", "", "```graphql", ep.graphql.query, "```", "");
		}
		if (ep.graphql?.variables != null) {
			lines.push("## Variables", "");
			lines.push(
				"```json",
				JSON.stringify(ep.graphql.variables, null, 2),
				"```",
				"",
			);
		}
	} else {
		if (ep.description) lines.push(ep.description, "");
		if (ep.parameters.length > 0) {
			lines.push(
				"## Parameters",
				"",
				"| Name | In | Required | Description |",
				"| --- | --- | --- | --- |",
			);
			for (const p of ep.parameters) {
				lines.push(
					`| \`${p.name}\` | ${p.in} | ${p.required ? "yes" : "no"} | ${p.description ?? ""} |`,
				);
			}
			lines.push("");
		}
		if (ep.requestBody) {
			lines.push("## Request Body", "");
			if (ep.requestBody.description) lines.push(ep.requestBody.description, "");
			if (ep.requestBody.example != null) {
				lines.push(
					"```json",
					JSON.stringify(ep.requestBody.example, null, 2),
					"```",
					"",
				);
			}
		}
	}

	const codes = Object.keys(ep.responses);
	if (codes.length > 0) {
		lines.push(style === "cli" ? "## Exit codes" : "## Responses", "");
		for (const code of codes) {
			const r = ep.responses[code]!;
			lines.push(`### ${code} — ${r.description}`);
			if (r.example != null) {
				lines.push(
					"",
					"```json",
					JSON.stringify(r.example, null, 2),
					"```",
					"",
				);
			}
		}
	}
	return lines.join("\n");
}

function endpointHeader(ep: ApiEndpoint, style: string) {
	if (style === "cli") {
		const cmd = ep.cli
			? [ep.cli.command, ep.cli.subcommand].filter(Boolean).join(" ")
			: `${ep.method} ${ep.path}`;
		return { label: cmd, icon: "i-mdi:console-line" };
	}
	if (style === "graphql") {
		return {
			label: ep.graphql?.operation ?? ep.summary ?? "GraphQL",
			icon: "i-mdi:graphql",
		};
	}
	return { label: `${ep.method} ${ep.path}`, icon: "" };
}

export function ApiEndpointPage() {
	const params = useParams({ strict: false });
	const collection = () => params().collection ?? "";
	const docId = () => params().docId ?? "";
	const config = useDocs();

	const api = createMemo(() => findApiCollection(config, collection()));
	const style = () => api()?.style ?? "rest";
	const endpoint = () => api()?.endpoints.find((e) => e.id === docId());
	const entries = createMemo<DocEntry[]>(() =>
		(api()?.endpoints ?? []).map((e) => ({
			id: e.id,
			label:
				e.summary ??
				e.graphql?.operation ??
				e.cli?.subcommand ??
				e.cli?.command ??
				`${e.method} ${e.path}`,
			category: e.tag ?? style() ?? "Endpoints",
			description: e.description ?? "",
			path: e.path,
			type: "api" as const,
		})),
	);

	const header = () => {
		const ep = endpoint();
		if (!ep) return { label: "", icon: "" };
		return endpointHeader(ep, style());
	};

	return (
		<div class="flex gap-8 max-w-7xl mx-auto px-6 py-8">
			<article class="flex-1 min-w-0">
				<Show
					when={endpoint()}
					fallback={<p class="text-muted text-sm">Endpoint not found.</p>}
				>
					{(ep) => (
						<>
							<div class="flex flex-wrap items-center gap-2 pb-4 mb-4 border-b border-border">
								<Show when={style() === "rest" || style() === "rpc"}>
									<span
										class={`inline-flex items-center px-2.5 py-1 rounded-md border text-xs font-bold ${METHOD_BADGE[ep().method] ?? ""}`}
									>
										{ep().method}
									</span>
									<code class="text-sm font-mono text-foreground">
										{ep().path}
									</code>
								</Show>

								<Show when={style() === "graphql" || style() === "cli"}>
									<span class="inline-flex items-center gap-1.5 text-sm font-mono text-foreground">
										<span
											class={`${header().icon} text-primary`}
											aria-hidden="true"
										/>
										{header().label}
									</span>
								</Show>

								<span
									class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-border bg-surface text-[10px] uppercase tracking-wide font-semibold text-muted"
								>
									<span
										class={`${STYLE_ICON[style()] ?? "i-mdi:api"} text-xs`}
										aria-hidden="true"
									/>
									{style()}
								</span>

								<Show when={ep().tag}>
									<span class="ml-auto text-[11px] uppercase tracking-wide text-muted">
										{ep().tag}
									</span>
								</Show>
							</div>

							<Show when={ep().summary}>
								<h1 class="text-2xl font-bold text-foreground mt-0 mb-4">
									{ep().summary}
								</h1>
							</Show>

							<DocMarkdown source={endpointMarkdown(ep(), style())} />
						</>
					)}
				</Show>
				<DocPrevNext
					collection={collection()}
					docs={entries()}
					currentId={docId()}
				/>
			</article>
			<aside class="hidden lg:block w-96 shrink-0">
				<div class="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
					<p class="text-[11px] font-semibold uppercase tracking-wide text-muted m-0 mb-2">
						Try it
					</p>
					<Show when={endpoint()}>
						{(ep) => (
							<ApiPlayground
								endpoint={ep()}
								style={style()}
							/>
						)}
					</Show>
				</div>
			</aside>
		</div>
	);
}

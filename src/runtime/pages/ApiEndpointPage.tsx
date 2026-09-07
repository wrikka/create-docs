import { useParams } from "@tanstack/solid-router";
import { createMemo, createSignal, Show } from "solid-js";
import { ApiPlayground } from "../components/ApiPlayground";
import { ApiReference } from "../components/ApiReference";
import { DocPrevNext } from "../components/DocPrevNext";
import { findApiCollection, useDocs } from "../context";
import type { DocEntry } from "../types";

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

function CopyInline(props: { text: () => string }) {
	const [copied, setCopied] = createSignal(false);
	return (
		<button
			type="button"
			aria-label="Copy"
			onClick={() => {
				navigator.clipboard.writeText(props.text()).catch(() => {});
				setCopied(true);
				setTimeout(() => setCopied(false), 1500);
			}}
			class="w-7 h-7 inline-flex items-center justify-center rounded-md border border-border text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
		>
			<span
				class={copied() ? "i-mdi:check text-success" : "i-mdi:content-copy"}
				aria-hidden="true"
			/>
		</button>
	);
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

	const cliLabel = () => {
		const ep = endpoint();
		if (!ep) return "";
		if (style() === "cli") {
			return ep.cli
				? [ep.cli.command, ep.cli.subcommand].filter(Boolean).join(" ")
				: `${ep.method} ${ep.path}`;
		}
		return ep.graphql?.operation ?? ep.summary ?? "GraphQL";
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
							<Show when={ep().tag}>
								<div class="text-[11px] uppercase tracking-wide text-muted mb-2">
									{ep().tag}
								</div>
							</Show>
							<Show when={ep().summary}>
								<h1 class="text-2xl font-bold text-foreground mt-0 mb-3">
									{ep().summary}
								</h1>
							</Show>

							<div class="flex flex-wrap items-center gap-2 p-3 mb-6 rounded-xl border border-border bg-surface/50">
								<Show when={style() === "rest" || style() === "rpc"}>
									<span
										class={`inline-flex items-center px-2.5 py-1 rounded-md border text-xs font-bold ${METHOD_BADGE[ep().method] ?? ""}`}
									>
										{ep().method}
									</span>
									<code class="text-sm font-mono text-foreground break-all">
										{ep().server ? `${ep().server}` : ""}
										{ep().path}
									</code>
									<CopyInline text={() => `${ep().server ?? ""}${ep().path}`} />
								</Show>

								<Show when={style() === "graphql" || style() === "cli"}>
									<span class="inline-flex items-center gap-1.5 text-sm font-mono text-foreground min-w-0">
										<span
											class={`${style() === "cli" ? "i-mdi:console-line" : "i-mdi:graphql"} text-primary shrink-0`}
											aria-hidden="true"
										/>
										<span class="truncate">{cliLabel()}</span>
									</span>
									<CopyInline text={cliLabel} />
								</Show>

								<span class="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-border bg-background text-[10px] uppercase tracking-wide font-semibold text-muted shrink-0">
									<span
										class={`${STYLE_ICON[style()] ?? "i-mdi:api"} text-xs`}
										aria-hidden="true"
									/>
									{style()}
								</span>
							</div>

							<ApiReference endpoint={ep()} style={style()} />

							<div class="lg:hidden">
								<ApiPlayground endpoint={ep()} style={style()} />
							</div>
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
						{(ep) => <ApiPlayground endpoint={ep()} style={style()} />}
					</Show>
				</div>
			</aside>
		</div>
	);
}

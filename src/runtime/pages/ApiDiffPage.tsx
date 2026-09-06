import { createMemo, For, Show } from "solid-js";
import { diffApiCollections, type EndpointChange } from "../api-diff";
import { useDocs } from "../context";

const badgeClass: Record<EndpointChange["type"], string> = {
	added: "bg-emerald-500/15 text-emerald-500",
	removed: "bg-red-500/15 text-red-500",
	changed: "bg-amber-500/15 text-amber-500",
};

const methodClass: Record<string, string> = {
	GET: "text-emerald-500",
	POST: "text-blue-500",
	PUT: "text-amber-500",
	DELETE: "text-red-500",
	PATCH: "text-violet-500",
};

export function ApiDiffPage() {
	const config = useDocs();

	const changes = createMemo(() =>
		diffApiCollections(
			config.apiDiff?.previous ?? [],
			config.apiCollections ?? [],
		),
	);

	const counts = createMemo(() => ({
		added: changes().filter((c) => c.type === "added").length,
		removed: changes().filter((c) => c.type === "removed").length,
		changed: changes().filter((c) => c.type === "changed").length,
	}));

	return (
		<div class="max-w-3xl mx-auto px-6 py-8">
			<h1 class="text-3xl font-bold mb-2">API Changelog</h1>
			<p class="text-muted mb-8">
				Endpoint changes between the previous and current API snapshot
			</p>

			<div class="flex gap-4 mb-8 text-sm">
				<span class="text-emerald-500">+{counts().added} added</span>
				<span class="text-amber-500">~{counts().changed} changed</span>
				<span class="text-red-500">−{counts().removed} removed</span>
			</div>

			<Show when={changes().length === 0}>
				<p class="text-muted">No API changes detected.</p>
			</Show>

			<div class="space-y-3">
				<For each={changes()}>
					{(change) => (
						<article class="border border-border rounded-lg p-4">
							<div class="flex items-center gap-2 flex-wrap">
								<span
									class={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase ${badgeClass[change.type]}`}
								>
									{change.type}
								</span>
								<code
									class={`text-xs font-bold ${methodClass[change.endpoint.method] ?? ""}`}
								>
									{change.endpoint.method}
								</code>
								<code class="text-sm">{change.endpoint.path}</code>
								<span class="text-xs text-muted ml-auto">
									{change.collection}
								</span>
							</div>
							<Show when={change.endpoint.summary}>
								<p class="text-sm text-muted mt-1">{change.endpoint.summary}</p>
							</Show>
							<Show when={change.changes.length > 0}>
								<ul class="mt-2 text-sm list-disc pl-5 space-y-0.5 text-muted">
									<For each={change.changes}>{(c) => <li>{c}</li>}</For>
								</ul>
							</Show>
						</article>
					)}
				</For>
			</div>
		</div>
	);
}

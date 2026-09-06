import { createMemo, createSignal, For, Show } from "solid-js";
import { getPageViews, resetPageViews } from "../analytics";

function formatDate(iso: string) {
	try {
		return new Date(iso).toLocaleString(undefined, {
			dateStyle: "medium",
			timeStyle: "short",
		});
	} catch {
		return iso;
	}
}

export function AnalyticsPage() {
	const [records, setRecords] = createSignal(getPageViews());

	const totalViews = createMemo(() =>
		records().reduce((sum, r) => sum + r.views, 0),
	);
	const sorted = createMemo(() =>
		[...records()].sort((a, b) => b.views - a.views),
	);
	const maxViews = createMemo(() => sorted()[0]?.views ?? 1);

	return (
		<div class="max-w-3xl mx-auto px-6 py-8">
			<h1 class="text-3xl font-bold mb-2">Analytics</h1>
			<p class="text-muted mb-8">Page views tracked locally in this browser</p>

			<div class="grid grid-cols-2 gap-4 mb-8">
				<div class="border border-border rounded-lg p-4">
					<div class="text-2xl font-bold">{totalViews()}</div>
					<div class="text-xs text-muted">Total page views</div>
				</div>
				<div class="border border-border rounded-lg p-4">
					<div class="text-2xl font-bold">{records().length}</div>
					<div class="text-xs text-muted">Pages visited</div>
				</div>
			</div>

			<Show when={records().length === 0}>
				<p class="text-muted">
					No page views yet — browse the docs to see stats here.
				</p>
			</Show>

			<Show when={records().length > 0}>
				<div class="space-y-3 mb-8">
					<For each={sorted()}>
						{(r) => (
							<div>
								<div class="flex items-baseline justify-between gap-3 mb-1">
									<code class="text-sm truncate">{r.path}</code>
									<span class="text-xs text-muted shrink-0">
										{r.views} views · {formatDate(r.lastVisit)}
									</span>
								</div>
								<div
									class="h-2 rounded-full bg-muted/20 overflow-hidden"
									role="progressbar"
									aria-valuenow={r.views}
									aria-valuemin={0}
									aria-valuemax={maxViews()}
								>
									<div
										class="h-full bg-primary transition-all"
										style={{
											width: `${Math.max((r.views / maxViews()) * 100, 2)}%`,
										}}
									/>
								</div>
							</div>
						)}
					</For>
				</div>
				<button
					type="button"
					onClick={() => {
						resetPageViews();
						setRecords([]);
					}}
					class="px-3 h-9 rounded-md border border-border text-sm text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
				>
					Reset stats
				</button>
			</Show>
		</div>
	);
}

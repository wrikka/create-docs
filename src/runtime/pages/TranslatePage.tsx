import { Link } from "@tanstack/solid-router";
import { createMemo, createResource, createSignal, For, Show } from "solid-js";
import type { LocaleInfo } from "../config";
import { useDocs } from "../context";
import { useCollections } from "../data";
import type { DocEntry } from "../types";

interface DocRow {
	collection: string;
	collectionLabel: string;
	entry: DocEntry;
}

export function TranslatePage() {
	const config = useDocs();
	const collections = useCollections();
	const [copied, setCopied] = createSignal<string | null>(null);
	const [collectionFilter, setCollectionFilter] = createSignal<string | null>(
		null,
	);

	const locales = createMemo((): LocaleInfo[] => {
		const fromI18n = config.i18n?.list ?? [];
		const extra = config.translate?.locales ?? [];
		const seen = new Set(fromI18n.map((l) => l.id));
		return [...fromI18n, ...extra.filter((l) => !seen.has(l.id))];
	});
	const currentLocale = () => config.i18n?.current ?? "en";
	const targets = () => locales().filter((l) => l.id !== currentLocale());
	const workflow = () => config.translate?.workflow ?? "translate.yml";
	const provider = () => config.translate?.provider ?? "ai";

	const [docs] = createResource(
		() => collections()?.map((c) => c.id) ?? [],
		async (ids) => {
			const rows: DocRow[] = [];
			for (const id of ids) {
				try {
					const list = await config.dataSource.list(id);
					const label = collections()?.find((c) => c.id === id)?.label ?? id;
					for (const entry of list) {
						rows.push({ collection: id, collectionLabel: label, entry });
					}
				} catch {
					// skip collections that fail to list
				}
			}
			return rows;
		},
	);

	const rows = createMemo(() => {
		const f = collectionFilter();
		const all = docs() ?? [];
		return f ? all.filter((r) => r.collection === f) : all;
	});

	/** A doc counts as translated for a locale when its id carries the locale marker. */
	const isTranslated = (row: DocRow, locale: string) =>
		row.entry.id.includes(`.${locale}`) ||
		row.entry.id.includes(`--${locale}`) ||
		(row.entry.tags ?? []).includes(`lang:${locale}`) ||
		(row.entry.tags ?? []).includes(`locale:${locale}`);

	const coverage = (locale: string) => {
		const all = docs() ?? [];
		if (!all.length) return 0;
		const done = all.filter((r) => isTranslated(r, locale)).length;
		return Math.round((done / all.length) * 100);
	};

	const ciCommand = () =>
		`gh workflow run ${workflow()} -f provider=${provider()} -f locale=${targets()[0]?.id ?? "th"}`;

	const cliCommand = () =>
		`bunx @wrikka/create-docs translate --provider ${provider()} --locales ${targets()
			.map((l) => l.id)
			.join(",")}`;

	const copy = (key: string, text: string) => {
		navigator.clipboard.writeText(text).catch(() => {});
		setCopied(key);
		setTimeout(() => setCopied(null), 1500);
	};

	return (
		<div class="max-w-5xl mx-auto px-6 py-10 pb-24">
			<div class="flex items-start gap-3 mb-2">
				<span
					class="i-mdi:translate text-3xl text-primary"
					aria-hidden="true"
				/>
				<div>
					<h1 class="text-3xl font-bold m-0">Translations</h1>
					<p class="text-muted m-0">
						AI-powered documentation translation, generated in CI.
					</p>
				</div>
				<span class="ml-auto text-[10px] px-2 py-1 rounded-full border border-border bg-surface text-muted uppercase tracking-wide">
					Preview
				</span>
			</div>

			{/* Locale coverage cards */}
			<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
				<For each={locales()}>
					{(locale) => {
						const isSource = () => locale.id === currentLocale();
						const pct = () => (isSource() ? 100 : coverage(locale.id));
						return (
							<div class="border border-border rounded-xl p-5 bg-surface/30 flex flex-col gap-3">
								<div class="flex items-center gap-2">
									<span
										class={`${
											isSource()
												? "i-mdi:check-decagram text-success"
												: "i-mdi:translate text-primary"
										} text-xl`}
										aria-hidden="true"
									/>
									<div class="min-w-0 flex-1">
										<div class="font-semibold text-sm text-foreground truncate">
											{locale.label}
										</div>
										<div class="text-[10px] text-muted font-mono">
											{locale.id}
										</div>
									</div>
									<Show when={isSource()}>
										<span class="text-[10px] px-1.5 py-0.5 rounded bg-success/10 text-success">
											Source
										</span>
									</Show>
								</div>
								<div>
									<div class="flex items-center justify-between text-xs mb-1.5">
										<span class="text-muted">Coverage</span>
										<span class="font-medium text-foreground">{pct()}%</span>
									</div>
									<div class="h-2 rounded-full bg-background border border-border overflow-hidden">
										<div
											class={`h-full transition-all ${pct() === 100 ? "bg-success" : "bg-primary"}`}
											style={{ width: `${pct()}%` }}
										/>
									</div>
								</div>
								<Show when={!isSource()}>
									<p class="text-xs text-muted m-0">
										{pct() === 0
											? "No translations yet — generated by AI in CI."
											: `${pct()}% of docs translated.`}
									</p>
								</Show>
							</div>
						);
					}}
				</For>
			</div>

			{/* How AI translation works */}
			<section class="mt-10 border border-border rounded-xl bg-surface/30 p-6">
				<h2 class="text-lg font-semibold m-0 mb-1 flex items-center gap-2">
					<span class="i-mdi:robot-outline text-primary" aria-hidden="true" />
					How AI translation works
				</h2>
				<p class="text-sm text-muted m-0 mb-4 leading-relaxed">
					Translations are produced by an AI provider inside CI — not in the
					browser. The workflow scans every collection, writes translated
					markdown under a locale directory (e.g.{" "}
					<code class="font-mono text-xs bg-background border border-border rounded px-1 py-0.5">
						docs/{targets()[0]?.id ?? "th"}/…
					</code>
					) and commits the result.
				</p>
				<ol class="m-0 p-0 list-none flex flex-col gap-2 text-sm text-foreground/90">
					<For
						each={[
							"Run the translate command locally or trigger the CI workflow below.",
							`The AI provider (${provider()}) translates each doc while preserving markdown, frontmatter, and code blocks.`,
							"CI commits translated files and rebuilds — the locale switcher picks them up automatically.",
						]}
					>
						{(step, i) => (
							<li class="flex items-start gap-2.5">
								<span class="w-5 h-5 rounded-full bg-primary/15 text-primary text-[11px] font-semibold inline-flex items-center justify-center shrink-0 mt-0.5">
									{i() + 1}
								</span>
								<span class="leading-relaxed">{step}</span>
							</li>
						)}
					</For>
				</ol>
				<div class="grid sm:grid-cols-2 gap-3 mt-5">
					<div class="border border-border rounded-lg bg-background p-3">
						<div class="text-[10px] uppercase tracking-wide text-muted mb-1.5">
							CI dispatch
						</div>
						<code class="block text-xs font-mono text-foreground break-all">
							{ciCommand()}
						</code>
						<button
							type="button"
							onClick={() => copy("ci", ciCommand())}
							class="mt-2 px-2.5 h-7 rounded-md border border-border text-xs text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
						>
							{copied() === "ci" ? "Copied!" : "Copy"}
						</button>
					</div>
					<div class="border border-border rounded-lg bg-background p-3">
						<div class="text-[10px] uppercase tracking-wide text-muted mb-1.5">
							Local CLI
						</div>
						<code class="block text-xs font-mono text-foreground break-all">
							{cliCommand()}
						</code>
						<button
							type="button"
							onClick={() => copy("cli", cliCommand())}
							class="mt-2 px-2.5 h-7 rounded-md border border-border text-xs text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
						>
							{copied() === "cli" ? "Copied!" : "Copy"}
						</button>
					</div>
				</div>
			</section>

			{/* Per-doc status matrix */}
			<section class="mt-10">
				<div class="flex items-center gap-2 mb-4 flex-wrap">
					<h2 class="text-lg font-semibold m-0 mr-2">Docs status</h2>
					<button
						type="button"
						onClick={() => setCollectionFilter(null)}
						class={`px-3 h-7 rounded-full text-xs border transition-colors cursor-pointer ${
							collectionFilter() === null
								? "bg-primary text-primary-foreground border-primary"
								: "bg-surface text-muted border-border hover:border-focus"
						}`}
					>
						All
					</button>
					<For each={collections() ?? []}>
						{(c) => (
							<button
								type="button"
								onClick={() => setCollectionFilter(c.id)}
								class={`px-3 h-7 rounded-full text-xs border transition-colors cursor-pointer ${
									collectionFilter() === c.id
										? "bg-primary text-primary-foreground border-primary"
										: "bg-surface text-muted border-border hover:border-focus"
								}`}
							>
								{c.label}
							</button>
						)}
					</For>
				</div>
				<Show
					when={!docs.loading}
					fallback={<p class="text-sm text-muted">Loading docs…</p>}
				>
					<div class="border border-border rounded-xl overflow-hidden">
						<table class="w-full text-sm">
							<thead>
								<tr class="bg-background/60 border-b border-border">
									<th class="text-left px-4 py-2.5 font-medium text-muted text-xs uppercase tracking-wide">
										Document
									</th>
									<th class="text-left px-4 py-2.5 font-medium text-muted text-xs uppercase tracking-wide hidden sm:table-cell">
										Collection
									</th>
									<For each={targets()}>
										{(l) => (
											<th class="px-4 py-2.5 font-medium text-muted text-xs uppercase tracking-wide text-center">
												{l.id}
											</th>
										)}
									</For>
								</tr>
							</thead>
							<tbody>
								<For each={rows()}>
									{(row) => (
										<tr class="border-b border-border/60 last:border-0 hover:bg-surface/40 transition-colors">
											<td class="px-4 py-2.5">
												<Link
													to="/$collection/$docId"
													params={{
														collection: row.collection,
														docId: row.entry.id,
													}}
													class="text-foreground no-underline hover:text-primary transition-colors font-medium"
												>
													{row.entry.label}
												</Link>
											</td>
											<td class="px-4 py-2.5 text-muted hidden sm:table-cell">
												{row.collectionLabel}
											</td>
											<For each={targets()}>
												{(l) => (
													<td class="px-4 py-2.5 text-center">
														<Show
															when={isTranslated(row, l.id)}
															fallback={
																<span class="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-warning/10 text-warning">
																	<span
																		class="i-mdi:clock-outline"
																		aria-hidden="true"
																	/>
																	Pending
																</span>
															}
														>
															<span class="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-success/10 text-success">
																<span class="i-mdi:check" aria-hidden="true" />
																Done
															</span>
														</Show>
													</td>
												)}
											</For>
										</tr>
									)}
								</For>
							</tbody>
						</table>
						<Show when={rows().length === 0}>
							<p class="p-6 text-sm text-muted text-center m-0">
								No documents found.
							</p>
						</Show>
					</div>
				</Show>
			</section>
		</div>
	);
}

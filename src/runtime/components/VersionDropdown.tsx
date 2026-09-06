import {
	createMemo,
	createSignal,
	For,
	onCleanup,
	onMount,
	Show,
} from "solid-js";
import { useDocs } from "../context";
import {
	fetchBranches,
	fetchLatestCommit,
	fetchTags,
	type BranchInfo,
	type CommitInfo,
	type TagInfo,
} from "../github";

interface VersionItem {
	id: string;
	label: string;
	url?: string;
	html_url?: string;
	type: "tag" | "branch" | "commit" | "version";
}

export function VersionDropdown() {
	const [open, setOpen] = createSignal(false);
	const config = useDocs();
	let rootEl: HTMLDivElement | undefined;

	const [tags, setTags] = createSignal<TagInfo[]>([]);
	const [branches, setBranches] = createSignal<BranchInfo[]>([]);
	const [latest, setLatest] = createSignal<CommitInfo | null>(null);
	const [loading, setLoading] = createSignal(false);
	const [errored, setErrored] = createSignal(false);

	onMount(async () => {
		if (!config.github || config.versions) return;
		setLoading(true);
		try {
			const [t, b, c] = await Promise.all([
				fetchTags(config.github),
				fetchBranches(config.github),
				fetchLatestCommit(config.github, config.github.branch),
			]);
			setTags(t);
			setBranches(b);
			setLatest(c);
		} catch {
			setErrored(true);
		} finally {
			setLoading(false);
		}
	});

	const currentLabel = () =>
		config.versions?.current ??
		config.github?.branch ??
		latest()?.sha ??
		"main";

	const items = createMemo<VersionItem[]>(() => {
		if (config.versions?.list.length) {
			return config.versions.list.map((v) => ({
				...v,
				type: "version" as const,
			}));
		}
		const github = config.github;
		if (!github) return [];

		const list: VersionItem[] = [];
		if (latest()) {
			list.push({
				id: latest()!.sha,
				label: `${latest()!.sha} — ${latest()!.message}`,
				html_url: latest()!.html_url,
				type: "commit",
			});
		}
		for (const b of branches()) {
			list.push({
				id: b.name,
				label: b.name,
				html_url: `https://github.com/${github.owner}/${github.repo}/tree/${b.name}`,
				type: "branch",
			});
		}
		for (const t of tags()) {
			list.push({
				id: t.name,
				label: t.name,
				html_url: `https://github.com/${github.owner}/${github.repo}/releases/tag/${t.name}`,
				type: "tag",
			});
		}
		return list;
	});

	const hasData = () =>
		(config.versions?.list.length ?? 0) > 1 ||
		items().length > 0 ||
		loading();

	const onDocClick = (e: MouseEvent) => {
		if (rootEl && !rootEl.contains(e.target as Node)) setOpen(false);
	};
	const onKey = (e: KeyboardEvent) => {
		if (e.key === "Escape") setOpen(false);
	};

	onMount(() => {
		document.addEventListener("click", onDocClick);
		document.addEventListener("keydown", onKey);
	});
	onCleanup(() => {
		document.removeEventListener("click", onDocClick);
		document.removeEventListener("keydown", onKey);
	});

	return (
		<Show when={hasData()}>
			<div ref={rootEl} class="relative">
				<button
					type="button"
					onClick={() => setOpen(!open())}
					aria-expanded={open()}
					aria-haspopup="listbox"
					class="inline-flex items-center gap-1.5 px-2.5 h-9 rounded-md border border-border bg-surface text-xs font-medium text-foreground hover:border-focus transition-colors cursor-pointer"
				>
					<span class="i-mdi:tag-outline text-muted" aria-hidden="true" />
					<span class="max-w-32 truncate">{currentLabel()}</span>
					<span
						class={`i-mdi:chevron-down text-muted transition-transform ${open() ? "rotate-180" : ""}`}
						aria-hidden="true"
					/>
				</button>
				<Show when={open()}>
					<ul
						role="listbox"
						aria-label="Versions"
						class="absolute right-0 top-full mt-2 min-w-52 max-h-72 overflow-auto rounded-lg border border-border bg-surface shadow-lg py-1 z-50 list-none m-0"
					>
						<Show when={loading()}>
							<li class="px-3 py-2 text-xs text-muted">Loading…</li>
						</Show>
						<Show when={errored() && !loading()}>
							<li class="px-3 py-2 text-xs text-destructive">
								Could not load versions.
							</li>
						</Show>
						<For each={items()}>
							{(v) => (
								<li role="option" aria-selected={v.id === currentLabel()}>
									<a
										href={v.url ?? v.html_url ?? "/"}
										target={v.html_url ? "_blank" : undefined}
										rel={v.html_url ? "noreferrer" : undefined}
										onClick={() => setOpen(false)}
										class={`block px-3 py-2 text-sm no-underline transition-colors hover:bg-background ${
											v.id === currentLabel()
												? "text-primary font-medium"
												: "text-foreground"
										}`}
									>
										<div class="flex items-center gap-2">
											<span
												class={`${
													v.type === "commit"
														? "i-mdi:source-commit"
														: v.type === "tag"
															? "i-mdi:tag"
															: v.type === "branch"
																? "i-mdi:source-branch"
																: "i-mdi:source-branch"
												} text-muted`}
												aria-hidden="true"
											/>
											<span class="truncate">{v.label}</span>
										</div>
									</a>
								</li>
							)}
						</For>
					</ul>
				</Show>
			</div>
		</Show>
	);
}

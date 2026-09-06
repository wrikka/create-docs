import { createSignal, For, onCleanup, onMount, Show } from "solid-js";
import { useDocs } from "../context";

export function VersionDropdown() {
	const [open, setOpen] = createSignal(false);
	const config = useDocs();
	let rootEl: HTMLDivElement | undefined;

	const versions = () => config.versions;
	const current = () =>
		versions()?.list.find((v) => v.id === versions()?.current);

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
		<Show when={(versions()?.list.length ?? 0) > 1}>
			<div ref={rootEl} class="relative">
				<button
					type="button"
					onClick={() => setOpen(!open())}
					aria-expanded={open()}
					aria-haspopup="listbox"
					class="inline-flex items-center gap-1.5 px-2.5 h-9 rounded-md border border-border bg-surface text-xs font-medium text-foreground hover:border-focus transition-colors cursor-pointer"
				>
					<span class="i-mdi:tag-outline text-muted" aria-hidden="true" />
					{current()?.label ?? versions()?.current}
					<span
						class={`i-mdi:chevron-down text-muted transition-transform ${open() ? "rotate-180" : ""}`}
						aria-hidden="true"
					/>
				</button>
				<Show when={open()}>
					<ul
						role="listbox"
						aria-label="Documentation versions"
						class="absolute left-0 top-full mt-2 min-w-40 rounded-lg border border-border bg-surface shadow-lg py-1 z-50 list-none m-0"
					>
						<For each={versions()?.list ?? []}>
							{(v) => (
								<li role="option" aria-selected={v.id === versions()?.current}>
									<a
										href={v.url ?? "/"}
										onClick={() => setOpen(false)}
										class={`block px-3 py-2 text-sm no-underline transition-colors hover:bg-background ${
											v.id === versions()?.current
												? "text-primary font-medium"
												: "text-foreground"
										}`}
									>
										{v.label}
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

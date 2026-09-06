import { createSignal, For, onCleanup, onMount, Show } from "solid-js";
import { useDocs } from "../context";

export function LocaleDropdown() {
	const [open, setOpen] = createSignal(false);
	const config = useDocs();
	let rootEl: HTMLDivElement | undefined;

	const i18n = () => config.i18n;
	const current = () => i18n()?.list.find((l) => l.id === i18n()?.current);

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
		<Show when={(i18n()?.list.length ?? 0) > 1}>
			<div ref={rootEl} class="relative">
				<button
					type="button"
					onClick={() => setOpen(!open())}
					aria-expanded={open()}
					aria-haspopup="listbox"
					aria-label="Select language"
					class="inline-flex items-center gap-1.5 px-2.5 h-9 rounded-md border border-border bg-surface text-xs font-medium text-foreground hover:border-focus transition-colors cursor-pointer"
				>
					<span class="i-mdi:translate text-muted" aria-hidden="true" />
					{current()?.label ?? i18n()?.current}
					<span
						class={`i-mdi:chevron-down text-muted transition-transform ${open() ? "rotate-180" : ""}`}
						aria-hidden="true"
					/>
				</button>
				<Show when={open()}>
					<ul
						role="listbox"
						aria-label="Languages"
						class="absolute right-0 top-full mt-2 min-w-36 rounded-lg border border-border bg-surface shadow-lg py-1 z-50 list-none m-0"
					>
						<For each={i18n()?.list ?? []}>
							{(l) => (
								<li role="option" aria-selected={l.id === i18n()?.current}>
									<a
										href={l.url ?? "/"}
										hreflang={l.id}
										onClick={() => setOpen(false)}
										class={`block px-3 py-2 text-sm no-underline transition-colors hover:bg-background ${
											l.id === i18n()?.current
												? "text-primary font-medium"
												: "text-foreground"
										}`}
									>
										{l.label}
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

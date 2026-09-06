import { createSignal, For, onCleanup, onMount, Show } from "solid-js";
import { useAccent } from "../theme";

export function AccentPicker() {
	const { accent, accentIndex, accents, setAccent } = useAccent();
	const [open, setOpen] = createSignal(false);
	let rootEl: HTMLDivElement | undefined;

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
		<div ref={rootEl} class="relative">
			<button
				type="button"
				onClick={() => setOpen(!open())}
				aria-expanded={open()}
				aria-haspopup="listbox"
				aria-label="Accent color"
				title={`Accent: ${accents[accentIndex()].name}`}
				class="w-9 h-9 inline-flex items-center justify-center rounded-md border border-border text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
			>
				<span
					class="w-4 h-4 rounded-full border border-border"
					style={{
						"background-color": accents[accentIndex()].swatch,
					}}
					aria-hidden="true"
				/>
			</button>
			<Show when={open()}>
				<div
					role="listbox"
					aria-label="Accent color"
					class="absolute right-0 top-full mt-2 w-56 rounded-lg border border-border bg-surface shadow-lg p-2 z-50"
				>
					<div class="px-2 pb-1.5 text-[10px] uppercase tracking-wider font-semibold text-muted">
						Daily accent
					</div>
					<button
						type="button"
						role="option"
						aria-selected={accent() === "auto"}
						onClick={() => {
							setAccent("auto");
							setOpen(false);
						}}
						class={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors cursor-pointer border-none ${
							accent() === "auto"
								? "bg-primary/10 text-primary"
								: "bg-transparent text-foreground hover:bg-background"
						}`}
					>
						<span class="i-mdi:calendar-sync text-base" aria-hidden="true" />
						<span class="flex-1 text-left">Auto — daily</span>
						<Show when={accent() === "auto"}>
							<span class="i-mdi:check text-primary" aria-hidden="true" />
						</Show>
					</button>
					<div class="my-1.5 h-px bg-border" aria-hidden="true" />
					<ul class="list-none m-0 p-0 grid grid-cols-1">
						<For each={accents}>
							{(a, i) => (
								<li>
									<button
										type="button"
										role="option"
										aria-selected={accent() === i()}
										onClick={() => {
											setAccent(i());
											setOpen(false);
										}}
										class={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors cursor-pointer border-none ${
											accent() === i()
												? "bg-primary/10 text-primary"
												: "bg-transparent text-foreground hover:bg-background"
										}`}
									>
										<span
											class="w-4 h-4 rounded-full border border-border shrink-0"
											style={{ "background-color": a.swatch }}
											aria-hidden="true"
										/>
										<span class="flex-1 text-left truncate">{a.name}</span>
										<span class="text-[10px] text-muted">{a.day}</span>
										<Show when={accent() === i()}>
											<span
												class="i-mdi:check text-primary"
												aria-hidden="true"
											/>
										</Show>
									</button>
								</li>
							)}
						</For>
					</ul>
				</div>
			</Show>
		</div>
	);
}

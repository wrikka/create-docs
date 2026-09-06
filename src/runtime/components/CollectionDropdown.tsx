import { Link } from "@tanstack/solid-router";
import { createSignal, For, onCleanup, onMount, Show } from "solid-js";
import { useCollections } from "../data";

export function CollectionDropdown(props: { current: string | undefined }) {
	const [open, setOpen] = createSignal(false);
	const collections = useCollections();
	let rootEl: HTMLDivElement | undefined;

	const currentMeta = () => collections()?.find((c) => c.id === props.current);

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
				class="inline-flex items-center gap-2 px-3 h-9 rounded-md border border-border bg-surface text-sm text-foreground hover:border-focus transition-colors cursor-pointer"
			>
				<Show when={currentMeta()}>
					<span class={currentMeta()!.icon} aria-hidden="true" />
				</Show>
				<span class="font-medium">
					{currentMeta()?.label ?? "Select collection"}
				</span>
				<span
					class={`i-mdi:chevron-down text-muted transition-transform ${open() ? "rotate-180" : ""}`}
					aria-hidden="true"
				/>
			</button>
			<Show when={open()}>
				<ul
					role="listbox"
					aria-label="Documentation collections"
					class="absolute left-0 top-full mt-2 min-w-56 rounded-lg border border-border bg-surface shadow-lg py-1 z-50 list-none m-0"
				>
					<For each={collections()}>
						{(c) => (
							<li role="option" aria-selected={c.id === props.current}>
								<Link
									to="/$collection"
									params={{ collection: c.id }}
									onClick={() => setOpen(false)}
									class="flex items-start gap-3 px-3 py-2 text-sm no-underline transition-colors hover:bg-background"
								>
									<span
										class={`${c.icon} mt-0.5 text-primary`}
										aria-hidden="true"
									/>
									<span class="min-w-0">
										<span
											class={`block font-medium ${c.id === props.current ? "text-primary" : "text-foreground"}`}
										>
											{c.label}
										</span>
										<span class="block text-xs text-muted leading-snug">
											{c.description}
										</span>
									</span>
								</Link>
							</li>
						)}
					</For>
				</ul>
			</Show>
		</div>
	);
}

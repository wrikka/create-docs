import { For, onCleanup, onMount, Show } from "solid-js";

export interface ContextMenuItem {
	label: string;
	icon: string;
	action: () => void;
	/** Render a divider above this item. */
	divider?: boolean;
	danger?: boolean;
}

export function ContextMenu(props: {
	open: boolean;
	x: number;
	y: number;
	items: ContextMenuItem[];
	onClose: () => void;
}) {
	let rootEl: HTMLDivElement | undefined;

	const onDocClick = (e: MouseEvent) => {
		if (rootEl && !rootEl.contains(e.target as Node)) props.onClose();
	};
	const onKey = (e: KeyboardEvent) => {
		if (e.key === "Escape") props.onClose();
	};
	const onScroll = () => props.onClose();

	onMount(() => {
		document.addEventListener("click", onDocClick, true);
		document.addEventListener("keydown", onKey);
		document.addEventListener("scroll", onScroll, true);
	});
	onCleanup(() => {
		document.removeEventListener("click", onDocClick, true);
		document.removeEventListener("keydown", onKey);
		document.removeEventListener("scroll", onScroll, true);
	});

	const pos = () => {
		const w = 200;
		const h = props.items.length * 36 + 12;
		const x = Math.min(props.x, window.innerWidth - w - 8);
		const y =
			props.y + h > window.innerHeight
				? Math.max(8, window.innerHeight - h - 8)
				: props.y;
		return { x: Math.max(8, x), y };
	};

	return (
		<Show when={props.open}>
			<div
				ref={rootEl}
				class="fixed z-50 min-w-48 rounded-lg border border-border bg-surface shadow-xl py-1"
				style={{ left: `${pos().x}px`, top: `${pos().y}px` }}
				role="menu"
			>
				<For each={props.items}>
					{(item) => (
						<>
							<Show when={item.divider}>
								<div class="my-1 border-t border-border" aria-hidden="true" />
							</Show>
							<button
								type="button"
								role="menuitem"
								class={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors cursor-pointer border-none bg-transparent hover:bg-background ${
									item.danger ? "text-destructive" : "text-foreground"
								}`}
								onClick={() => {
									item.action();
									props.onClose();
								}}
							>
								<span
									class={`${item.icon} shrink-0 ${item.danger ? "" : "text-muted"}`}
									aria-hidden="true"
								/>
								{item.label}
							</button>
						</>
					)}
				</For>
			</div>
		</Show>
	);
}

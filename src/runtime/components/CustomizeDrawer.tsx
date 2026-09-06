import { createSignal, For, Show } from "solid-js";
import type { SiteLink } from "../config";

interface CustomizeItem extends SiteLink {
	checked: boolean;
}

const STORAGE_KEY = "create-docs:nav";

export function CustomizeDrawer(props: {
	open: boolean;
	available: SiteLink[];
	current: SiteLink[];
	onSave: (items: SiteLink[] | null) => void;
	onClose: () => void;
}) {
	const [items, setItems] = createSignal<CustomizeItem[]>([]);
	const [copied, setCopied] = createSignal(false);

	const open = () => props.open;
	const available = () => props.available ?? [];
	const current = () => props.current ?? [];

	const sync = () => {
		const selected = new Set(current().map((i) => i.to));
		setItems(available().map((i) => ({ ...i, checked: selected.has(i.to) })));
	};

	// Sync when drawer opens.
	if (open()) {
		sync();
	}

	const move = (idx: number, dir: -1 | 1) => {
		const arr = items().slice();
		const next = idx + dir;
		if (next < 0 || next >= arr.length) return;
		[arr[idx], arr[next]] = [arr[next], arr[idx]];
		setItems(arr);
	};

	const toggle = (idx: number) => {
		setItems(
			items().map((it, i) =>
				i === idx ? { ...it, checked: !it.checked } : it,
			),
		);
	};

	const save = () => {
		const out = items()
			.filter((it) => it.checked)
			.map(({ checked: _, ...it }) => it);
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(out));
		} catch {
			// ignore storage errors
		}
		props.onSave(out);
	};

	const reset = () => {
		try {
			localStorage.removeItem(STORAGE_KEY);
		} catch {
			// ignore
		}
		props.onSave(null);
	};

	const copyConfig = async () => {
		const json = JSON.stringify(current(), null, 2);
		try {
			await navigator.clipboard.writeText(json);
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		} catch {
			// ignore
		}
	};

	return (
		<Show when={open()}>
			<div
				class="fixed inset-0 z-50 bg-overlay lg:hidden"
				aria-hidden="true"
				onClick={props.onClose}
			/>
			<aside
				class="fixed top-0 bottom-0 right-0 z-50 w-80 max-w-[85vw] bg-background border-l border-border shadow-xl flex flex-col"
				role="dialog"
				aria-label="Customize navigation"
			>
				<div class="flex items-center gap-2 p-4 border-b border-border">
					<span class="i-mdi:tune text-xl text-primary" aria-hidden="true" />
					<h2 class="font-semibold text-sm">Customize navigation</h2>
					<button
						type="button"
						aria-label="Close customize"
						class="ml-auto w-8 h-8 inline-flex items-center justify-center rounded-md text-muted hover:text-foreground hover:bg-surface transition-colors"
						onClick={props.onClose}
					>
						<span class="i-mdi:close" aria-hidden="true" />
					</button>
				</div>
				<div class="flex-1 overflow-y-auto p-4 space-y-3">
					<p class="text-xs text-muted">
						Choose which top nav links to show and reorder them. Changes are
						saved locally.
					</p>
					<ul class="space-y-2">
						<For each={items()}>
							{(item, i) => (
								<li class="flex items-center gap-2 border border-border rounded-lg p-2 bg-surface/30">
									<button
										type="button"
										aria-label={item.checked ? "Hide" : "Show"}
										class={`w-8 h-8 inline-flex items-center justify-center rounded-md border transition-colors ${
											item.checked
												? "border-primary bg-primary/10 text-primary"
												: "border-border text-muted hover:text-foreground"
										}`}
										onClick={() => toggle(i())}
									>
										<span
											class={item.checked ? "i-mdi:eye" : "i-mdi:eye-off"}
											aria-hidden="true"
										/>
									</button>
									<div class="min-w-0 flex-1">
										<div class="text-sm font-medium text-foreground truncate">
											{item.label}
										</div>
										<div class="text-xs text-muted truncate">{item.to}</div>
									</div>
									<div class="flex flex-col gap-1">
										<button
											type="button"
											aria-label="Move up"
											class="w-7 h-7 inline-flex items-center justify-center rounded-md border border-border text-muted hover:text-foreground hover:bg-surface transition-colors"
											onClick={() => move(i(), -1)}
										>
											<span class="i-mdi:arrow-up" aria-hidden="true" />
										</button>
										<button
											type="button"
											aria-label="Move down"
											class="w-7 h-7 inline-flex items-center justify-center rounded-md border border-border text-muted hover:text-foreground hover:bg-surface transition-colors"
											onClick={() => move(i(), 1)}
										>
											<span class="i-mdi:arrow-down" aria-hidden="true" />
										</button>
									</div>
								</li>
							)}
						</For>
					</ul>

					<div class="pt-4 border-t border-border">
						<div class="flex items-center gap-2 mb-2">
							<span class="i-mdi:code-json" aria-hidden="true" />
							<h3 class="text-xs font-semibold">Config</h3>
							<button
								type="button"
								class="ml-auto text-xs text-primary hover:underline"
								onClick={copyConfig}
							>
								{copied() ? "Copied!" : "Copy"}
							</button>
						</div>
						<pre class="text-[11px] bg-surface border border-border rounded-md p-2 overflow-x-auto max-h-40 whitespace-pre-wrap font-mono">
							{JSON.stringify(current(), null, 2)}
						</pre>
					</div>
				</div>
				<div class="p-4 border-t border-border flex gap-2">
					<button
						type="button"
						onClick={reset}
						class="flex-1 px-4 h-10 rounded-md border border-border text-foreground hover:bg-surface transition-colors"
					>
						Reset
					</button>
					<button
						type="button"
						onClick={save}
						class="flex-1 px-4 h-10 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary-hover transition-colors"
					>
						Save
					</button>
				</div>
			</aside>
		</Show>
	);
}

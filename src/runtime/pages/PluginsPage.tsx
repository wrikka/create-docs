import { createSignal, For, Show } from "solid-js";
import { useDocs } from "../context";

export function PluginsPage() {
	const config = useDocs();
	const [copied, setCopied] = createSignal<string | null>(null);

	const copyInstall = (name: string, cmd: string) => {
		navigator.clipboard.writeText(cmd).catch(() => {});
		setCopied(name);
		setTimeout(() => setCopied(null), 1500);
	};

	return (
		<div class="max-w-4xl mx-auto px-6 py-8">
			<h1 class="text-3xl font-bold mb-2">Plugins</h1>
			<p class="text-muted mb-8">
				Integrations and extensions for this documentation site
			</p>
			<Show when={(config.plugins ?? []).length === 0}>
				<p class="text-muted">No plugins configured.</p>
			</Show>
			<div class="grid sm:grid-cols-2 gap-4">
				<For each={config.plugins ?? []}>
					{(p) => (
						<article class="border border-border rounded-lg p-5 flex flex-col gap-2">
							<div class="flex items-center gap-2">
								<Show when={p.icon}>
									<span
										class={`${p.icon} text-xl text-primary`}
										aria-hidden="true"
									/>
								</Show>
								<h2 class="font-semibold text-sm m-0 truncate">{p.name}</h2>
								<Show when={p.version}>
									<span class="text-xs text-muted ml-auto shrink-0">
										v{p.version}
									</span>
								</Show>
							</div>
							<p class="text-sm text-muted m-0 flex-1">{p.description}</p>
							<div class="flex items-center gap-2 mt-1">
								<Show when={p.install}>
									<code class="text-xs bg-surface border border-border rounded px-2 py-1 flex-1 truncate">
										{p.install}
									</code>
									<button
										type="button"
										onClick={() => copyInstall(p.name, p.install!)}
										class="px-2.5 h-7 rounded-md border border-border text-xs text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer shrink-0"
									>
										{copied() === p.name ? "Copied!" : "Copy"}
									</button>
								</Show>
								<Show when={!p.install}>
									<span class="flex-1" />
								</Show>
								<Show when={p.url}>
									<a
										href={p.url}
										target="_blank"
										rel="noreferrer"
										aria-label={`${p.name} docs`}
										class="w-7 h-7 inline-flex items-center justify-center rounded-md border border-border text-muted hover:text-foreground hover:bg-surface transition-colors"
									>
										<span class="i-mdi:open-in-new" aria-hidden="true" />
									</a>
								</Show>
							</div>
						</article>
					)}
				</For>
			</div>
		</div>
	);
}

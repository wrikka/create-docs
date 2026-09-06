import { createSignal, For, Show } from "solid-js";
import type { PluginInfo } from "../config";
import { useDocs } from "../context";

const builtIn: PluginInfo[] = [
	{
		name: "@wrikka/create-docs",
		description: "The core docs runtime with SolidJS and TanStack Router.",
		icon: "i-mdi:book-open-page-variant",
		version: "built-in",
	},
	{
		name: "OpenAPI adapter",
		description: "Render OpenAPI specs as interactive API references.",
		icon: "i-mdi:api",
		version: "built-in",
	},
	{
		name: "oRPC adapter",
		description: "Generate docs from oRPC router definitions.",
		icon: "i-mdi:lan-connect",
		version: "built-in",
	},
	{
		name: "Elysia adapter",
		description: "Auto-generate docs from Elysia Eden treaties.",
		icon: "i-mdi:server",
		version: "built-in",
	},
	{
		name: "Nitro adapter",
		description: "Reference Nitro server handlers and API routes.",
		icon: "i-mdi:fire",
		version: "built-in",
	},
];

export function PluginsPage() {
	const config = useDocs();
	const [copied, setCopied] = createSignal<string | null>(null);

	const copyInstall = (name: string, cmd: string) => {
		navigator.clipboard.writeText(cmd).catch(() => {});
		setCopied(name);
		setTimeout(() => setCopied(null), 1500);
	};

	const plugins = () =>
		(config.plugins ?? []).length > 0
			? config.plugins
			: builtIn.map((p) => ({
					...p,
					install:
						p.version === "built-in"
							? undefined
							: `bun add ${p.name
									.toLowerCase()
									.replace(/\s+adapter$/, "")
									.replace(/\s/g, "-")}`,
				}));

	const categories = () => {
		const list = plugins() ?? [];
		const groups = new Map<string, typeof list>();
		for (const p of list) {
			const cat = p.name.startsWith("@")
				? "Packages"
				: p.name.includes("adapter")
					? "Adapters"
					: "Integrations";
			const g = groups.get(cat) ?? [];
			g.push(p);
			groups.set(cat, g);
		}
		return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
	};

	return (
		<div class="max-w-5xl mx-auto px-6 py-10 pb-24">
			<div class="flex items-start gap-3 mb-2">
				<span class="i-mdi:puzzle text-3xl text-primary" aria-hidden="true" />
				<div>
					<h1 class="text-3xl font-bold m-0">Plugins</h1>
					<p class="text-muted m-0">
						Integrations, adapters, and extensions for this docs site.
					</p>
				</div>
			</div>

			<Show when={(config.plugins ?? []).length === 0}>
				<div class="border border-border rounded-lg p-4 bg-surface/30 mb-8">
					<p class="text-sm text-muted m-0">
						No custom plugins configured yet. These are built-in integrations
						you can enable from your config.
					</p>
				</div>
			</Show>

			<For each={categories()}>
				{([category, items]) => (
					<section class="mb-10">
						<h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
							<span class="i-mdi:folder-open-outline" aria-hidden="true" />
							{category}
							<span class="ml-auto text-xs font-normal text-muted">
								{items.length}
							</span>
						</h2>
						<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
							<For each={items}>
								{(p) => (
									<article class="border border-border rounded-xl p-5 flex flex-col gap-3 bg-surface/30 hover:border-focus transition-colors">
										<div class="flex items-center gap-3">
											<Show when={p.icon}>
												<span
													class={`${p.icon} text-2xl text-primary`}
													aria-hidden="true"
												/>
											</Show>
											<div class="min-w-0 flex-1">
												<h3 class="font-semibold text-sm m-0 truncate">
													{p.name}
												</h3>
												<Show when={p.version}>
													<span class="text-[10px] text-muted">
														{p.version}
													</span>
												</Show>
											</div>
										</div>
										<p class="text-sm text-muted m-0 flex-1 leading-relaxed">
											{p.description}
										</p>
										<div class="flex items-center gap-2 pt-2 border-t border-border">
											<Show when={p.install}>
												<code class="text-[11px] bg-background border border-border rounded px-2 py-1 flex-1 truncate font-mono">
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
												<span class="text-xs text-muted">
													No install needed
												</span>
											</Show>
											<Show when={p.url}>
												<a
													href={p.url}
													target="_blank"
													rel="noreferrer"
													aria-label={`${p.name} docs`}
													class="ml-auto w-7 h-7 inline-flex items-center justify-center rounded-md border border-border text-muted hover:text-foreground hover:bg-surface transition-colors"
												>
													<span class="i-mdi:open-in-new" aria-hidden="true" />
												</a>
											</Show>
										</div>
									</article>
								)}
							</For>
						</div>
					</section>
				)}
			</For>
		</div>
	);
}

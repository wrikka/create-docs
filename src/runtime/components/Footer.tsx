import { For, Show } from "solid-js";
import { useDocs } from "../context";

export function Footer() {
	const config = useDocs();
	const year = new Date().getFullYear();
	const links = () => config.footer?.links ?? [];

	return (
		<footer class="border-t border-border bg-surface py-10 px-6 text-sm text-muted">
			<div class="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 md:items-center justify-between">
				<div class="space-y-1">
					<div class="font-medium text-foreground">{config.site.title}</div>
					<Show when={config.site.description}>
						{(d) => <p class="text-xs max-w-md">{d()}</p>}
					</Show>
					<div class="text-xs">
						© {year} {config.footer?.copyright ?? config.site.title}
					</div>
				</div>
				<Show when={links().length}>
					<nav class="flex flex-wrap gap-4" aria-label="Footer">
						<For each={links()}>
							{(link) => (
								<a
									href={link.to}
									class="text-muted hover:text-foreground transition-colors no-underline"
								>
									{link.label}
								</a>
							)}
						</For>
					</nav>
				</Show>
			</div>
		</footer>
	);
}

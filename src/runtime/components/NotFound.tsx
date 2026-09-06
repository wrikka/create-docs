import { Link } from "@tanstack/solid-router";
import { Show } from "solid-js";
import { useDocs } from "../context";

export function NotFound() {
	const config = useDocs();
	return (
		<div class="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 py-20">
			<div class="text-6xl mb-4" aria-hidden="true">
				🚀
			</div>
			<h1 class="text-4xl font-bold text-foreground mb-2">404</h1>
			<p class="text-lg text-muted mb-6">
				We couldn't find the page you were looking for.
			</p>
			<div class="flex flex-wrap gap-3 justify-center">
				<Link
					to="/"
					class="px-4 h-10 inline-flex items-center rounded-md bg-primary text-primary-foreground no-underline font-medium hover:bg-primary-hover transition-colors"
				>
					Back home
				</Link>
				<Show when={config.site.repoUrl}>
					<a
						href={`${config.site.repoUrl}/issues`}
						target="_blank"
						rel="noreferrer"
						class="px-4 h-10 inline-flex items-center rounded-md border border-border text-foreground no-underline hover:bg-surface transition-colors"
					>
						Report an issue
					</a>
				</Show>
			</div>
		</div>
	);
}

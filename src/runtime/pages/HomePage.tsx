import { Link } from "@tanstack/solid-router";
import { For, Show } from "solid-js";
import { useDocs } from "../context";

/** VitePress-style home layout: hero + actions + feature cards. */
export function HomePage() {
	const config = useDocs();
	const home = () => config.home;

	return (
		<div class="flex-1">
			<Show when={home()?.hero}>
				{(hero) => (
					<section class="max-w-4xl mx-auto px-6 pt-20 pb-12 text-center">
						<Show when={hero().name}>
							<p class="text-sm font-semibold tracking-widest uppercase text-primary m-0 mb-3">
								{hero().name}
							</p>
						</Show>
						<h1 class="text-4xl md:text-5xl font-bold text-foreground m-0 mb-4 leading-tight">
							{hero().text ?? config.site.title}
						</h1>
						<Show when={hero().tagline}>
							<p class="text-lg text-muted m-0 mb-8 max-w-2xl mx-auto">
								{hero().tagline}
							</p>
						</Show>
						<Show when={hero().actions?.length}>
							<div class="flex items-center justify-center gap-3 flex-wrap">
								<For each={hero().actions}>
									{(a) => (
										<Link
											to={a.link}
											class={`inline-flex items-center px-5 h-11 rounded-lg text-sm font-medium no-underline transition-colors ${
												a.theme === "alt"
													? "border border-border text-foreground hover:bg-surface"
													: "bg-primary text-primary-foreground hover:bg-primary-hover"
											}`}
										>
											{a.text}
										</Link>
									)}
								</For>
							</div>
						</Show>
					</section>
				)}
			</Show>
			<Show when={home()?.features?.length}>
				<section class="max-w-5xl mx-auto px-6 pb-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<For each={home()?.features}>
						{(f) => {
							const inner = (
								<>
									<Show when={f.icon}>
										<span
											class={`${f.icon} text-2xl text-primary`}
											aria-hidden="true"
										/>
									</Show>
									<h2 class="text-base font-semibold text-foreground m-0">
										{f.title}
									</h2>
									<Show when={f.details}>
										<p class="text-sm text-muted m-0 leading-relaxed">
											{f.details}
										</p>
									</Show>
								</>
							);
							return f.link ? (
								<Link
									to={f.link}
									class="flex flex-col gap-2 p-5 rounded-xl border border-border bg-surface no-underline hover:border-focus transition-colors"
								>
									{inner}
								</Link>
							) : (
								<div class="flex flex-col gap-2 p-5 rounded-xl border border-border bg-surface">
									{inner}
								</div>
							);
						}}
					</For>
				</section>
			</Show>
		</div>
	);
}

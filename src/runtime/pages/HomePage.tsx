import { Link } from "@tanstack/solid-router";
import { createSignal, For, onCleanup, onMount, Show } from "solid-js";
import { GitHubStats } from "../components/GitHubStats";
import type { HomeFeature } from "../config";
import { useDocs } from "../context";

function FeatureCard(props: { f: HomeFeature; class?: string }) {
	const f = () => props.f;
	const inner = (
		<>
			<Show when={f().icon}>
				<span class={`${f().icon} text-2xl text-primary`} aria-hidden="true" />
			</Show>
			<h2 class="text-base font-semibold text-foreground m-0">{f().title}</h2>
			<Show when={f().details}>
				<p class="text-sm text-muted m-0 leading-relaxed">{f().details}</p>
			</Show>
		</>
	);
	const cls = `flex flex-col gap-2 p-5 rounded-xl border border-border bg-surface no-underline hover:border-focus hover:-translate-y-0.5 hover:shadow-lg transition-all ${props.class ?? ""}`;
	return f().link ? (
		<Link to={f().link ?? "/"} class={cls}>
			{inner}
		</Link>
	) : (
		<div class={cls}>{inner}</div>
	);
}

function FeatureSlider(props: { items: HomeFeature[] }) {
	const [index, setIndex] = createSignal(0);
	const [paused, setPaused] = createSignal(false);
	let track: HTMLDivElement | undefined;

	const go = (i: number) => {
		const n = props.items.length;
		if (!n) return;
		const next = ((i % n) + n) % n;
		setIndex(next);
		const child = track?.children[next] as HTMLElement | undefined;
		child?.scrollIntoView({
			behavior: "smooth",
			inline: "nearest",
			block: "nearest",
		});
	};

	onMount(() => {
		const t = setInterval(() => {
			if (!paused()) go(index() + 1);
		}, 5000);
		onCleanup(() => clearInterval(t));
	});

	return (
		<section
			class="max-w-5xl mx-auto px-6 pb-16"
			aria-label="Feature highlights"
			onMouseEnter={() => setPaused(true)}
			onMouseLeave={() => setPaused(false)}
		>
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-lg font-semibold text-foreground m-0">Highlights</h2>
				<div class="flex items-center gap-1">
					<button
						type="button"
						onClick={() => go(index() - 1)}
						aria-label="Previous slide"
						class="w-8 h-8 inline-flex items-center justify-center rounded-md border border-border text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer bg-transparent"
					>
						<span class="i-mdi:chevron-left" aria-hidden="true" />
					</button>
					<button
						type="button"
						onClick={() => go(index() + 1)}
						aria-label="Next slide"
						class="w-8 h-8 inline-flex items-center justify-center rounded-md border border-border text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer bg-transparent"
					>
						<span class="i-mdi:chevron-right" aria-hidden="true" />
					</button>
				</div>
			</div>
			<div
				ref={track}
				class="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 [scrollbar-width:thin]"
			>
				<For each={props.items}>
					{(f) => (
						<div class="snap-start shrink-0 w-72">
							<FeatureCard f={f} class="h-full" />
						</div>
					)}
				</For>
			</div>
			<div class="flex justify-center gap-1.5 mt-3">
				<For each={props.items}>
					{(_, i) => (
						<button
							type="button"
							onClick={() => go(i())}
							aria-label={`Go to slide ${i() + 1}`}
							class={`h-1.5 rounded-full transition-all cursor-pointer border-none p-0 ${
								index() === i()
									? "w-5 bg-primary"
									: "w-1.5 bg-border hover:bg-muted"
							}`}
						/>
					)}
				</For>
			</div>
		</section>
	);
}

/** VitePress-style home layout: hero + actions + feature cards + slider. */
export function HomePage() {
	const config = useDocs();
	const home = () => config.home;
	const slides = () => home()?.slides ?? home()?.features ?? [];

	return (
		<div class="flex-1">
			<Show when={home()?.hero}>
				{(hero) => (
					<section class="relative max-w-4xl mx-auto px-6 pt-20 pb-12 text-center overflow-hidden">
						<div
							class="absolute inset-0 -z-10 pointer-events-none"
							aria-hidden="true"
							style={{
								background:
									"radial-gradient(ellipse 60% 50% at 50% 0%, hsl(var(--color-primary) / 0.12), transparent 70%)",
							}}
						/>
						<Show when={hero().badge}>
							<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-surface text-xs text-muted mb-4">
								<span class="i-mdi:sparkles text-primary" aria-hidden="true" />
								{hero().badge}
							</span>
						</Show>
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
						<div class="mt-8 flex justify-center">
							<GitHubStats />
						</div>
					</section>
				)}
			</Show>
			<Show when={slides().length > 0}>
				<FeatureSlider items={slides()} />
			</Show>
			<Show when={home()?.features?.length}>
				<section class="max-w-5xl mx-auto px-6 pb-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<For each={home()?.features}>{(f) => <FeatureCard f={f} />}</For>
				</section>
			</Show>
		</div>
	);
}

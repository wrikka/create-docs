import { createEffect, createSignal, onCleanup, Show } from "solid-js";

export function BackToTop() {
	const [visible, setVisible] = createSignal(false);

	createEffect(() => {
		const onScroll = () => {
			setVisible(window.scrollY > 400);
		};

		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		onCleanup(() => window.removeEventListener("scroll", onScroll));
	});

	const scrollToTop = () =>
		window.scrollTo({
			top: 0,
			behavior: prefersReducedMotion() ? "auto" : "smooth",
		});

	return (
		<Show when={visible()}>
			<button
				type="button"
				onClick={scrollToTop}
				class="fixed bottom-6 right-6 z-50 flex items-center justify-center w-10 h-10 rounded-full border border-border bg-surface text-foreground shadow-md hover:bg-primary hover:text-primary-foreground transition-colors"
				aria-label="Back to top"
			>
				<span class="i-mdi:chevron-up" aria-hidden="true" />
			</button>
		</Show>
	);
}

function prefersReducedMotion() {
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

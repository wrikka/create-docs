import { createEffect, createSignal, onCleanup } from "solid-js";

export function ScrollProgress() {
	const [progress, setProgress] = createSignal(0);

	createEffect(() => {
		const onScroll = () => {
			const h = document.documentElement;
			const scrollTop = h.scrollTop || document.body.scrollTop;
			const scrollHeight = h.scrollHeight - h.clientHeight;
			setProgress(
				scrollHeight > 0 ? Math.min(100, (scrollTop / scrollHeight) * 100) : 0,
			);
		};

		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		onCleanup(() => window.removeEventListener("scroll", onScroll));
	});

	return (
		<div
			class="fixed top-0 left-0 right-0 h-0.5 z-[60] bg-transparent"
			aria-hidden="true"
		>
			<div
				class="h-full bg-primary transition-[width] duration-150"
				style={{ width: `${progress()}%` }}
			/>
		</div>
	);
}

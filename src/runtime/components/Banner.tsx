import { createSignal, onMount, Show } from "solid-js";
import { useDocs } from "../context";

const BANNER_HEIGHT_VAR = "--docs-banner-height";

function setBannerHeight(height: number) {
	document.documentElement.style.setProperty(BANNER_HEIGHT_VAR, `${height}px`);
}

export function Banner() {
	const config = useDocs();
	const banner = () => config.announcement;
	const storageKey = "docs-banner-dismissed";
	const [dismissed, setDismissed] = createSignal(false);

	const isVisible = () => {
		if (!banner()?.text) return false;
		if (dismissed()) return false;
		if (
			banner()?.closable !== false &&
			localStorage.getItem(storageKey) === "1"
		) {
			return false;
		}
		return true;
	};

	const dismiss = () => {
		setDismissed(true);
		setBannerHeight(0);
		if (banner()?.closable !== false) {
			localStorage.setItem(storageKey, "1");
		}
	};

	onMount(() => {
		if (!isVisible()) setBannerHeight(0);
	});

	return (
		<Show when={isVisible()}>
			<div
				class="sticky top-0 z-50 w-full bg-primary text-primary-foreground text-sm"
				ref={(el) => {
					queueMicrotask(() => {
						if (isVisible()) setBannerHeight(el.getBoundingClientRect().height);
					});
				}}
			>
				<div class="max-w-6xl mx-auto px-4 py-2 flex items-center justify-center gap-2">
					<Show when={banner()?.to} fallback={<span>{banner()?.text}</span>}>
						{(to) => (
							<a
								href={to()}
								class="underline hover:no-underline text-primary-foreground"
							>
								{banner()?.text}
							</a>
						)}
					</Show>
					<Show when={banner()?.closable !== false}>
						<button
							type="button"
							onClick={dismiss}
							class="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full hover:bg-primary-foreground/20"
							aria-label="Dismiss announcement"
						>
							<span class="i-mdi:close" aria-hidden="true" />
						</button>
					</Show>
				</div>
			</div>
		</Show>
	);
}

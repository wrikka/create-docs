import { Link } from "@tanstack/solid-router";
import { createSignal, For, Show } from "solid-js";
import { useDocs } from "../context";
import { useCollections } from "../data";
import { setSearchOpen } from "./SearchPalette";

export function NotFound() {
	const config = useDocs();
	const [search, setSearch] = createSignal("");
	const collections = useCollections();

	const features = () =>
		(config.home?.features ?? []).map((f) => ({
			label: f.title,
			to: f.link,
			icon: f.icon ?? "i-mdi:arrow-right",
		}));

	const extra = () => [
		...(config.github?.releases
			? [{ label: "Release", to: "/changelog", icon: "i-mdi:tag" }]
			: []),
		...(config.github?.contributors
			? [{ label: "Community", to: "/community", icon: "i-mdi:account-group" }]
			: []),
		...(config.plugins?.length
			? [{ label: "Plugins", to: "/plugins", icon: "i-mdi:puzzle" }]
			: []),
		...(config.showcase?.length
			? [{ label: "Showcase", to: "/showcase", icon: "i-mdi:view-dashboard" }]
			: []),
	];

	const quick = () => {
		const first = collections()?.[0]?.id;
		const docsLink = first ? `/${first}` : "/";
		return [
			{ label: "Home", to: "/", icon: "i-mdi:home" },
			{ label: "Documentation", to: docsLink, icon: "i-mdi:book-open-page-variant" },
			...(config.apiCollections?.[0]
				? [
						{
							label: "API reference",
							to: `/${config.apiCollections[0].id}`,
							icon: "i-mdi:api",
						},
					]
				: []),
			...features(),
			...extra(),
		];
	};

	const onSearch = (e: Event) => {
		e.preventDefault();
		if (search().trim()) {
			setSearchOpen(true);
			// Populate search input if possible through global signal would need wiring;
			// the palette will show with the current query typed by the user in separate state.
		} else {
			setSearchOpen(true);
		}
	};

	return (
		<div class="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 py-20">
			<span
				class="i-mdi:robot-confused text-7xl text-primary/80 mb-6"
				aria-hidden="true"
			/>
			<h1 class="text-5xl font-bold text-foreground mb-3">404</h1>
			<p class="text-lg text-muted mb-2">This page is lost in hyperspace.</p>
			<p class="text-sm text-muted mb-8 max-w-md">
				The page you are looking for does not exist or has been moved.
			</p>

			<form
				onSubmit={onSearch}
				class="w-full max-w-sm flex items-center gap-2 px-3 h-11 rounded-lg border border-border bg-surface mb-8 focus-within:border-focus"
			>
				<span class="i-mdi:magnify text-muted" aria-hidden="true" />
				<input
					type="search"
					value={search()}
					onInput={(e) => setSearch(e.currentTarget.value)}
					placeholder="Search docs…"
					class="bg-transparent outline-none border-none flex-1 text-sm text-foreground placeholder:text-muted"
				/>
				<button
					type="submit"
					class="text-sm text-primary font-medium hover:underline"
				>
					Search
				</button>
			</form>

			<div class="flex flex-wrap gap-3 justify-center mb-8">
				<For each={quick()}>
					{(item) => (
						<Link
							to={item.to}
							class="px-4 h-10 inline-flex items-center gap-2 rounded-lg border border-border text-foreground no-underline hover:bg-surface transition-colors"
						>
							<span class={item.icon} aria-hidden="true" />
							{item.label}
						</Link>
					)}
				</For>
			</div>

			<div class="flex flex-wrap gap-3 justify-center">
				<Link
					to="/"
					class="px-5 h-11 inline-flex items-center rounded-lg bg-primary text-primary-foreground no-underline font-medium hover:bg-primary-hover transition-colors"
				>
					Back home
				</Link>
				<Show when={config.site.repoUrl}>
					<a
						href={`${config.site.repoUrl}/issues`}
						target="_blank"
						rel="noreferrer"
						class="px-5 h-11 inline-flex items-center gap-2 rounded-lg border border-border text-foreground no-underline hover:bg-surface transition-colors"
					>
						<span class="i-mdi:github" aria-hidden="true" />
						Report an issue
					</a>
				</Show>
			</div>
		</div>
	);
}

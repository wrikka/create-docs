import { Link, useNavigate, useParams } from "@tanstack/solid-router";
import { createSignal, For, onMount, Show } from "solid-js";
import type { SiteLink } from "../config";
import { useDocs } from "../context";
import { searchDocs } from "../data";
import { setTheme, useTheme } from "../theme";
import type { SearchResult } from "../types";
import { AccentPicker } from "./AccentPicker";
import { CollectionDropdown } from "./CollectionDropdown";
import { ContextMenu } from "./ContextMenu";
import { CustomizeDrawer } from "./CustomizeDrawer";
import { DocsDropdown } from "./DocsDropdown";
import { LocaleDropdown } from "./LocaleDropdown";
import { setSearchOpen } from "./SearchPalette";
import { ThemeToggle } from "./ThemeToggle";
import { VersionDropdown } from "./VersionDropdown";

const socialIcons: Record<
	keyof NonNullable<import("../config").SiteConfig["social"]>,
	string
> = {
	npm: "i-mdi:npm",
	twitter: "i-mdi:twitter",
	discord: "i-mdi:discord",
	youtube: "i-mdi:youtube",
	mastodon: "i-mdi:mastodon",
};

function LogoContextMenu(props: {
	open: boolean;
	x: number;
	y: number;
	onClose: () => void;
}) {
	const { theme } = useTheme();

	const items = () => [
		{
			label: "Copy page URL",
			icon: "i-mdi:link",
			action: () => navigator.clipboard.writeText(location.href),
		},
		{
			label: "Open home",
			icon: "i-mdi:home",
			action: () => (location.href = "/"),
		},
		{
			label: `Theme: ${theme()}`,
			icon: "i-mdi:theme-light-dark",
			action: () => setTheme(theme() === "dark" ? "light" : "dark"),
		},
		{
			label: "Back to top",
			icon: "i-mdi:arrow-up",
			action: () => window.scrollTo({ top: 0, behavior: "smooth" }),
		},
		{ label: "Reload", icon: "i-mdi:refresh", action: () => location.reload() },
	];

	return (
		<ContextMenu
			open={props.open}
			x={props.x}
			y={props.y}
			items={items()}
			onClose={props.onClose}
		/>
	);
}

export function TopNav(props: {
	onMenuToggle: () => void;
	onCreateClick?: () => void;
}) {
	const params = useParams({ strict: false });
	const config = useDocs();
	const [menu, setMenu] = createSignal<{ open: boolean; x: number; y: number }>(
		{ open: false, x: 0, y: 0 },
	);
	const [customizeOpen, setCustomizeOpen] = createSignal(false);
	const [customNav, setCustomNav] = createSignal<SiteLink[] | null>(null);
	const [navSearch, setNavSearch] = createSignal(false);
	const [navQuery, setNavQuery] = createSignal("");
	const [navResults, setNavResults] = createSignal<SearchResult[]>([]);
	const navigate = useNavigate();
	let navSearchEl: HTMLInputElement | undefined;

	const openNavSearch = () => {
		setNavSearch(true);
		setNavQuery("");
		setNavResults([]);
		queueMicrotask(() => navSearchEl?.focus());
	};

	const closeNavSearch = () => {
		setNavSearch(false);
		setNavQuery("");
		setNavResults([]);
	};

	const onNavSearchInput = async (value: string) => {
		setNavQuery(value);
		const term = value.trim();
		if (term.length < 2) {
			setNavResults([]);
			return;
		}
		try {
			setNavResults((await searchDocs(config, term)).slice(0, 8));
		} catch {
			setNavResults([]);
		}
	};

	const goSearchPage = () => {
		const q = navQuery().trim();
		closeNavSearch();
		navigate({ to: "/search", search: q ? { q } : {} });
	};

	onMount(() => {
		try {
			const raw = localStorage.getItem("create-docs:nav");
			if (raw) setCustomNav(JSON.parse(raw) as SiteLink[]);
		} catch {
			// ignore
		}
	});

	const socials = () =>
		Object.entries(config.site.social ?? {}).filter(([, v]) => v) as [
			keyof typeof socialIcons,
			string,
		][];
	const topNav = () => config.topNav ?? [];
	const extraNav = () => [
		...(config.github?.issues
			? [{ label: "Issues", to: "/issues", icon: "i-mdi:alert-circle-outline" }]
			: []),
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
		...(config.features?.translate || config.translate
			? [{ label: "Translate", to: "/translate", icon: "i-mdi:translate" }]
			: []),
	];

	const defaultAllNav = () => [...topNav(), ...extraNav()];
	const allNav = () => customNav() ?? defaultAllNav();

	const handleCustomizeSave = (items: SiteLink[] | null) => {
		setCustomNav(items);
		setCustomizeOpen(false);
	};

	const logoIcon = () => config.site.logo ?? "i-mdi:book-open-page-variant";

	return (
		<>
			<header class="sticky top-[var(--docs-banner-height,0px)] z-40 h-14 hidden lg:flex items-center gap-3 px-4 border-b border-border bg-background/95 backdrop-blur">
				<button
					type="button"
					onClick={props.onMenuToggle}
					aria-label="Toggle sidebar"
					class="lg:hidden w-9 h-9 inline-flex items-center justify-center rounded-md text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
				>
					<span class="i-mdi:menu" aria-hidden="true" />
				</button>
				<Link
					to="/"
					class="inline-flex items-center gap-2 no-underline text-foreground font-semibold text-sm shrink-0"
					onContextMenu={(e) => {
						e.preventDefault();
						setMenu({ open: true, x: e.clientX, y: e.clientY });
					}}
				>
					<span
						class={`${logoIcon()} text-primary text-lg`}
						aria-hidden="true"
					/>
					{config.site.title}
				</Link>
				<div
					class="w-px h-6 bg-border hidden sm:block shrink-0"
					aria-hidden="true"
				/>
				<CollectionDropdown current={params().collection} />

				<Show
					when={navSearch()}
					fallback={
						<nav
							class="hidden md:flex flex-1 items-center justify-center gap-1"
							aria-label="Site"
						>
							<DocsDropdown />
							<For each={allNav()}>
								{(link) => (
									<Link
										to={link.to}
										class="px-3 h-9 inline-flex items-center gap-1.5 rounded-md text-sm text-muted no-underline hover:text-foreground hover:bg-surface transition-colors"
									>
										<Show when={link.icon}>
											<span class={link.icon} aria-hidden="true" />
										</Show>
										{link.label}
									</Link>
								)}
							</For>
							<Link
								to="/create"
								class="ml-2 px-3 h-9 inline-flex items-center gap-1.5 rounded-md text-sm font-medium bg-primary text-primary-foreground no-underline hover:bg-primary-hover transition-colors"
							>
								<span class="i-mdi:plus" aria-hidden="true" />
								Create docs
							</Link>
						</nav>
					}
				>
					<div class="hidden md:flex flex-1 items-center justify-center relative">
						<div class="w-full max-w-xl flex items-center gap-2 px-3 h-10 rounded-lg border border-focus bg-surface shadow-sm">
							<span
								class="i-mdi:magnify text-muted shrink-0"
								aria-hidden="true"
							/>
							<input
								ref={navSearchEl}
								type="search"
								value={navQuery()}
								onInput={(e) => onNavSearchInput(e.currentTarget.value)}
								onKeyDown={(e) => {
									if (e.key === "Escape") closeNavSearch();
									if (e.key === "Enter") {
										e.preventDefault();
										const first = navResults()[0];
										if (first && navQuery().trim()) {
											closeNavSearch();
											navigate({
												to: "/$collection/$docId",
												params: {
													collection: first.collection,
													docId: first.id,
												},
											});
										} else {
											goSearchPage();
										}
									}
								}}
								placeholder="Search docs… (Enter for full search)"
								aria-label="Search documentation"
								class="flex-1 bg-transparent outline-none border-none text-sm text-foreground placeholder:text-muted"
							/>
							<button
								type="button"
								onClick={closeNavSearch}
								aria-label="Close search"
								class="w-6 h-6 inline-flex items-center justify-center rounded text-muted hover:text-foreground cursor-pointer border-none bg-transparent"
							>
								<span class="i-mdi:close" aria-hidden="true" />
							</button>
						</div>
						<Show when={navResults().length > 0}>
							<div class="absolute top-full mt-2 w-full max-w-xl rounded-lg border border-border bg-surface shadow-xl py-1 z-50 max-h-80 overflow-y-auto">
								<For each={navResults()}>
									{(r) => (
										<button
											type="button"
											class="w-full text-left px-3 py-2 hover:bg-background transition-colors cursor-pointer border-none bg-transparent"
											onClick={() => {
												closeNavSearch();
												navigate({
													to: "/$collection/$docId",
													params: { collection: r.collection, docId: r.id },
												});
											}}
										>
											<div class="text-sm font-medium text-foreground truncate">
												{r.title}
											</div>
											<div class="text-xs text-muted truncate">{r.snippet}</div>
										</button>
									)}
								</For>
								<button
									type="button"
									onClick={goSearchPage}
									class="w-full text-left px-3 py-2 text-xs text-primary hover:bg-background transition-colors cursor-pointer border-t border-border border-none bg-transparent"
								>
									View all results →
								</button>
							</div>
						</Show>
					</div>
				</Show>

				<div class="flex items-center gap-1 shrink-0">
					<Show when={config.features?.search !== false}>
						<button
							type="button"
							onClick={() => {
								if (config.features?.searchPage !== false) {
									openNavSearch();
								} else {
									setSearchOpen(true);
								}
							}}
							aria-label="Search documentation"
							class="inline-flex items-center gap-2 px-3 h-9 rounded-md border border-border bg-surface text-sm text-muted hover:text-foreground hover:border-focus transition-colors cursor-pointer"
						>
							<span class="i-mdi:magnify" aria-hidden="true" />
							<span class="hidden sm:inline">Search…</span>
							<kbd class="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded border border-border">
								Ctrl K
							</kbd>
						</button>
					</Show>
					<For each={socials()}>
						{([key, href]) => (
							<a
								href={href}
								target="_blank"
								rel="noreferrer"
								aria-label={key}
								title={key}
								class="w-9 h-9 hidden sm:inline-flex items-center justify-center rounded-md border border-border text-muted hover:text-foreground hover:bg-surface transition-colors"
							>
								<span class={socialIcons[key]} aria-hidden="true" />
							</a>
						)}
					</For>
					<Show when={config.site.repoUrl}>
						<a
							href={config.site.repoUrl}
							target="_blank"
							rel="noreferrer"
							aria-label="GitHub repository"
							title="GitHub repository"
							class="w-9 h-9 inline-flex items-center justify-center rounded-md border border-border text-muted hover:text-foreground hover:bg-surface transition-colors"
						>
							<span class="i-mdi:github" aria-hidden="true" />
						</a>
					</Show>
					<button
						type="button"
						onClick={() => setCustomizeOpen(true)}
						aria-label="Customize navigation"
						title="Customize navigation"
						class="w-9 h-9 inline-flex items-center justify-center rounded-md border border-border text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
					>
						<span class="i-mdi:tune" aria-hidden="true" />
					</button>
					<LocaleDropdown />
					<VersionDropdown />
					<AccentPicker />
					<ThemeToggle />
				</div>
				<LogoContextMenu
					open={menu().open}
					x={menu().x}
					y={menu().y}
					onClose={() => setMenu({ open: false, x: 0, y: 0 })}
				/>
			</header>
			<CustomizeDrawer
				open={customizeOpen()}
				available={defaultAllNav()}
				current={allNav()}
				onSave={handleCustomizeSave}
				onClose={() => setCustomizeOpen(false)}
			/>
		</>
	);
}

import { Outlet, useParams } from "@tanstack/solid-router";
import { createSignal, onCleanup, onMount, Show } from "solid-js";
import { Head } from "../components/Head";
import { SearchPalette, setSearchOpen } from "../components/SearchPalette";
import { SidebarNav } from "../components/SidebarNav";
import { TopNav } from "../components/TopNav";

export function DocsLayout() {
	const [navOpen, setNavOpen] = createSignal(false);
	const params = useParams({ strict: false });
	const inCollection = () => !!params().collection;

	const onKey = (e: KeyboardEvent) => {
		if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
			e.preventDefault();
			setSearchOpen((v) => !v);
		}
	};

	onMount(() => document.addEventListener("keydown", onKey));
	onCleanup(() => document.removeEventListener("keydown", onKey));

	return (
		<div class="min-h-screen flex flex-col bg-background text-foreground">
			<Head />
			<TopNav onMenuToggle={() => setNavOpen(!navOpen())} />
			<div class="flex flex-1 min-h-0">
				<Show when={inCollection()}>
					<SidebarNav open={navOpen()} onNavigate={() => setNavOpen(false)} />
				</Show>
				<Show when={navOpen()}>
					<button
						type="button"
						aria-label="Close sidebar"
						class="fixed inset-0 top-14 z-20 bg-overlay lg:hidden cursor-default"
						onClick={() => setNavOpen(false)}
					/>
				</Show>
				<main class="flex-1 min-w-0">
					<Outlet />
				</main>
			</div>
			<SearchPalette />
		</div>
	);
}

import { Outlet, useNavigate, useParams } from "@tanstack/solid-router";
import { createSignal, onCleanup, onMount, Show } from "solid-js";
import { BackToTop } from "../components/BackToTop";
import { Banner } from "../components/Banner";
import { Footer } from "../components/Footer";
import { Head } from "../components/Head";
import { ScrollProgress } from "../components/ScrollProgress";
import { SearchPalette, setSearchOpen } from "../components/SearchPalette";
import { SidebarNav } from "../components/SidebarNav";
import { TopNav } from "../components/TopNav";
import { createDocsList } from "../data";

export function DocsLayout() {
	const [navOpen, setNavOpen] = createSignal(false);
	const params = useParams({ strict: false });
	const inCollection = () => !!params().collection;
	const navigate = useNavigate();
	const [docs] = createDocsList(() => params().collection ?? "");

	const focusable = (target: EventTarget | null) => {
		if (!(target instanceof HTMLElement)) return false;
		const tag = target.tagName.toLowerCase();
		return (
			tag === "input" ||
			tag === "textarea" ||
			tag === "select" ||
			target.isContentEditable
		);
	};

	const docsPath = () => {
		const list = docs() ?? [];
		const id = params().docId;
		if (!id) return null;
		const idx = list.findIndex((d) => d.id === id);
		if (idx < 0) return null;
		return { list, idx };
	};

	const goDoc = (nextIdx: number) => {
		const p = docsPath();
		const collection = params().collection;
		if (!p || !collection) return;
		const next = p.list[nextIdx];
		if (!next) return;
		navigate({
			to: "/$collection/$docId",
			params: { collection, docId: next.id },
		});
	};

	const onKey = (e: KeyboardEvent) => {
		if (focusable(e.target)) {
			if (e.key === "Escape") {
				(e.target as HTMLElement).blur();
			}
			return;
		}

		if (e.key === "/") {
			e.preventDefault();
			setSearchOpen(true);
			return;
		}

		if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
			e.preventDefault();
			setSearchOpen((v) => !v);
			return;
		}

		if (e.key === "j" || e.key === "J") {
			e.preventDefault();
			const p = docsPath();
			if (p) goDoc(Math.min(p.idx + 1, p.list.length - 1));
			return;
		}

		if (e.key === "k" || e.key === "K") {
			e.preventDefault();
			const p = docsPath();
			if (p) goDoc(Math.max(p.idx - 1, 0));
			return;
		}

		if (e.key === "Escape") {
			setSearchOpen(false);
		}
	};

	onMount(() => document.addEventListener("keydown", onKey));
	onCleanup(() => document.removeEventListener("keydown", onKey));

	return (
		<div class="min-h-screen flex flex-col bg-background text-foreground">
			<Head />
			<ScrollProgress />
			<Banner />
			<TopNav onMenuToggle={() => setNavOpen(!navOpen())} />
			<div class="flex flex-1 min-h-0">
				<Show when={inCollection()}>
					<SidebarNav open={navOpen()} onNavigate={() => setNavOpen(false)} />
				</Show>
				<Show when={navOpen()}>
					<button
						type="button"
						aria-label="Close sidebar"
						class="fixed inset-0 top-[calc(3.5rem+var(--docs-banner-height,0px))] z-20 bg-overlay lg:hidden cursor-default"
						onClick={() => setNavOpen(false)}
					/>
				</Show>
				<main class={`flex-1 min-w-0 ${inCollection() ? "lg:pl-72" : ""}`}>
					<Outlet />
				</main>
			</div>
			<Footer />
			<SearchPalette />
			<BackToTop />
		</div>
	);
}

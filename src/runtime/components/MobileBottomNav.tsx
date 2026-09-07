import { Link, useNavigate, useParams } from "@tanstack/solid-router";
import { For } from "solid-js";
import { createDocsList, useCollections } from "../data";

export function MobileBottomNav(props: { onMenuToggle: () => void }) {
	const collections = useCollections();
	const params = useParams({ strict: false });
	const navigate = useNavigate();

	const [docsList] = createDocsList(() => "docs");
	const [apiList] = createDocsList(() => "api");
	const [showcaseList] = createDocsList(() => "showcase");

	const firstDoc = (list: import("../types").DocEntry[]) => {
		const idx = list.find((d) => d.id === "index");
		return idx ? idx.id : list[0]?.id;
	};

	const items = () => {
		const c = collections() ?? [];
		const docsMeta = c.find((x) => x.id === "docs");
		const apiMeta = c.find((x) => x.id === "api");
		const showcaseMeta = c.find((x) => x.id === "showcase");
		const out = [] as {
			to: string;
			icon: string;
			label: string;
			active?: boolean;
		}[];
		out.push({ to: "/", icon: "i-mdi:home", label: "Home" });
		if (docsMeta) {
			const docId = firstDoc(docsList() ?? []);
			out.push({
				to: docId ? `/${docsMeta.id}/${docId}` : `/${docsMeta.id}`,
				icon: "i-mdi:book-open-page-variant",
				label: "Docs",
			});
		}
		if (apiMeta) {
			const docId = firstDoc(apiList() ?? []);
			out.push({
				to: docId ? `/${apiMeta.id}/${docId}` : `/${apiMeta.id}`,
				icon: "i-mdi:code-json",
				label: "API",
			});
		}
		if (showcaseMeta) {
			const docId = firstDoc(showcaseList() ?? []);
			out.push({
				to: docId ? `/${showcaseMeta.id}/${docId}` : `/${showcaseMeta.id}`,
				icon: "i-mdi:view-dashboard",
				label: "Showcase",
			});
		}
		return out;
	};

	const active = (to: string) => {
		const p = params();
		if (to === "/") return p.collection == null;
		return p.collection === to.split("/")[1];
	};

	return (
		<nav
			aria-label="Mobile bottom navigation"
			class="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t border-border lg:hidden pb-[env(safe-area-inset-bottom)]"
		>
			<div
				class="h-16 min-h-16 grid items-center"
				style={{
					"grid-template-columns": `repeat(${items().length + 2}, minmax(0, 1fr))`,
				}}
			>
				<For each={items()}>
					{(item) => (
						<Link
							to={item.to}
							class={`flex flex-col items-center justify-center h-full gap-0.5 text-xs no-underline transition-colors ${
								active(item.to)
									? "text-primary"
									: "text-muted hover:text-foreground"
							}`}
						>
							<span class={`${item.icon} text-xl`} aria-hidden="true" />
							<span class="scale-90">{item.label}</span>
						</Link>
					)}
				</For>
				<button
					type="button"
					aria-label="Search"
					class="flex flex-col items-center justify-center h-full gap-0.5 text-xs text-muted hover:text-foreground transition-colors"
					onClick={() => navigate({ to: "/search" })}
				>
					<span class="i-mdi:magnify text-xl" aria-hidden="true" />
					<span class="scale-90">Search</span>
				</button>
				<button
					type="button"
					aria-label="Menu"
					class="flex flex-col items-center justify-center h-full gap-0.5 text-xs text-muted hover:text-foreground transition-colors"
					onClick={props.onMenuToggle}
				>
					<span class="i-mdi:menu text-xl" aria-hidden="true" />
					<span class="scale-90">Menu</span>
				</button>
			</div>
		</nav>
	);
}

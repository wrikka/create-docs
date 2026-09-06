import {
	createEffect,
	createResource,
	createSignal,
	For,
	onCleanup,
	Show,
} from "solid-js";

interface TocLink {
	id: string;
	text: string;
	depth: number;
	children?: TocLink[];
}

async function parseToc(source: string): Promise<TocLink[]> {
	const [{ parseMarkdown }, { default: toc }] = await Promise.all([
		import("comark"),
		import("@comark/html/plugins/toc"),
	]);
	const result = await parseMarkdown(source, {
		plugins: [toc({ depth: 3, searchDepth: 3 })],
	});
	return result.meta?.toc?.links ?? [];
}

function collectIds(links: TocLink[]): string[] {
	const out: string[] = [];
	for (const l of links) {
		out.push(l.id);
		if (l.children) out.push(...collectIds(l.children));
	}
	return out;
}

function TocLinkItem(props: { link: TocLink; activeId?: string }) {
	const scrollTo = (id: string) => {
		document
			.getElementById(id)
			?.scrollIntoView({ behavior: "smooth", block: "start" });
	};
	const isActive = () => props.activeId === props.link.id;
	return (
		<li class={`rt-toc__item rt-toc__item--depth-${props.link.depth}`}>
			<button
				type="button"
				class={`rt-toc__link ${isActive() ? "rt-toc__link--active" : ""}`}
				onClick={() => scrollTo(props.link.id)}
				aria-label={`Jump to ${props.link.text}`}
				aria-current={isActive() ? "location" : undefined}
			>
				{props.link.text}
			</button>
			<Show when={props.link.children?.length}>
				<ul class="rt-toc__list">
					<For each={props.link.children}>
						{(child) => <TocLinkItem link={child} activeId={props.activeId} />}
					</For>
				</ul>
			</Show>
		</li>
	);
}

export function DocToc(props: { source: string }) {
	const [toc] = createResource(() => props.source, parseToc);
	const [activeId, setActiveId] = createSignal<string | undefined>();

	createEffect(() => {
		const ids = collectIds(toc() ?? []);
		if (ids.length === 0) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((e) => e.isIntersecting)
					.map((e) => e.target.id);
				if (visible.length) setActiveId(visible[0]);
			},
			{ rootMargin: "-15% 0px -60% 0px", threshold: 0 },
		);

		for (const id of ids) {
			const el = document.getElementById(id);
			if (el) observer.observe(el);
		}

		onCleanup(() => observer.disconnect());
	});

	return (
		<nav aria-label="On this page" class="rt-toc">
			<div class="rt-toc__title">On this page</div>
			<Show
				when={!toc.loading && (toc() ?? []).length > 0}
				fallback={<div class="rt-toc__empty">No headings</div>}
			>
				<ul class="rt-toc__list">
					<For each={toc()}>
						{(link) => <TocLinkItem link={link} activeId={activeId()} />}
					</For>
				</ul>
			</Show>
		</nav>
	);
}

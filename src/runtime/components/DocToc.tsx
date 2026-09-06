import { createResource, For, Show } from "solid-js";

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

function TocLinkItem(props: { link: TocLink }) {
	const scrollTo = (id: string) => {
		document
			.getElementById(id)
			?.scrollIntoView({ behavior: "smooth", block: "start" });
	};
	return (
		<li class={`rt-toc__item rt-toc__item--depth-${props.link.depth}`}>
			<button
				type="button"
				class="rt-toc__link"
				onClick={() => scrollTo(props.link.id)}
				aria-label={`Jump to ${props.link.text}`}
			>
				{props.link.text}
			</button>
			<Show when={props.link.children?.length}>
				<ul class="rt-toc__list">
					<For each={props.link.children}>
						{(child) => <TocLinkItem link={child} />}
					</For>
				</ul>
			</Show>
		</li>
	);
}

export function DocToc(props: { source: string }) {
	const [toc] = createResource(() => props.source, parseToc);

	return (
		<nav aria-label="On this page" class="rt-toc">
			<div class="rt-toc__title">On this page</div>
			<Show
				when={!toc.loading && (toc() ?? []).length > 0}
				fallback={<div class="rt-toc__empty">No headings</div>}
			>
				<ul class="rt-toc__list">
					<For each={toc()}>{(link) => <TocLinkItem link={link} />}</For>
				</ul>
			</Show>
		</nav>
	);
}

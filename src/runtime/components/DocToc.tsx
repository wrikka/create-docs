import { createMemo, For, Show } from "solid-js";
import { slugify } from "./DocMarkdown";

export function DocToc(props: { source: string }) {
	const headings = createMemo(() => {
		const list: { depth: number; text: string; id: string }[] = [];
		const regex = /^(#{1,6})\s+(.+)$/gm;
		let match = regex.exec(props.source);
		while (match !== null) {
			const depth = (match[1] ?? "").length;
			const raw = (match[2] ?? "").trim().replace(/`/g, "");
			const id = slugify(raw);
			if (id) list.push({ depth, text: raw, id });
			match = regex.exec(props.source);
		}
		return list;
	});

	const scrollTo = (id: string) => {
		document
			.getElementById(id)
			?.scrollIntoView({ behavior: "smooth", block: "start" });
	};

	return (
		<nav aria-label="On this page" class="rt-toc">
			<div class="rt-toc__title">On this page</div>
			<Show
				when={headings().length > 0}
				fallback={<div class="rt-toc__empty">No headings</div>}
			>
				<ul class="rt-toc__list">
					<For each={headings()}>
						{(h) => (
							<li class={`rt-toc__item rt-toc__item--depth-${h.depth}`}>
								<button
									type="button"
									class="rt-toc__link"
									onClick={() => scrollTo(h.id)}
									aria-label={`Jump to ${h.text}`}
								>
									{h.text}
								</button>
							</li>
						)}
					</For>
				</ul>
			</Show>
		</nav>
	);
}

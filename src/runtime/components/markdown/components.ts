import type { ElementNode, NodeHandler } from "comark";

const rand = () => Math.random().toString(36).slice(2, 8);

function getAttr(
	attrs: Record<string, unknown>,
	key: string,
): string | undefined {
	return (attrs[key] as string) ?? undefined;
}

export const cardComponent: NodeHandler = async (node, state) => {
	const [, attrs, ...children] = node;
	const title = getAttr(attrs, "title");
	const icon = getAttr(attrs, "icon");
	const to = getAttr(attrs, "to");
	const id = `card-${rand()}`;
	const body = await state.render(children);

	const inner = `
		<div class="rt-card__header">
			${icon ? `<span class="${icon} rt-card__icon" aria-hidden="true"></span>` : ""}
			${title ? `<div class="rt-card__title">${title}</div>` : ""}
		</div>
		<div class="rt-card__body">${body}</div>
	`;

	if (to) {
		return `<a href="${to}" class="rt-card rt-card--link" id="${id}">${inner}</a>`;
	}
	return `<div class="rt-card" id="${id}">${inner}</div>`;
};

export const cardGridComponent: NodeHandler = async (node, state) => {
	const [, , ...children] = node;
	const rendered = await state.render(children);
	return `<div class="rt-card-grid">${rendered}</div>`;
};

export const tabsComponent: NodeHandler = async (node, state) => {
	const [, , ...children] = node;
	const tabs: { id: string; label: string; body: string }[] = [];

	for (const child of children) {
		const el = child as ElementNode;
		if (el[0] !== "tab") continue;
		const [, cAttrs, ...cChildren] = el;
		const label = getAttr(cAttrs, "label") ?? "Tab";
		const id = `tab-${rand()}`;
		const body = await state.render(cChildren);
		tabs.push({ id, label, body });
	}

	if (!tabs.length) return "";

	const tabList = tabs
		.map(
			(t, i) =>
				`<button type="button" class="rt-tabs__tab${i === 0 ? " rt-tabs__tab--active" : ""}" data-tab="${t.id}" role="tab" aria-selected="${i === 0 ? "true" : "false"}">${t.label}</button>`,
		)
		.join("");

	const panels = tabs
		.map(
			(t, i) =>
				`<div class="rt-tabs__panel${i === 0 ? " rt-tabs__panel--active" : ""}" id="${t.id}" role="tabpanel">${t.body}</div>`,
		)
		.join("");

	return `<div class="rt-tabs">
		<div class="rt-tabs__list" role="tablist">${tabList}</div>
		${panels}
	</div>`;
};

export const fileTreeComponent: NodeHandler = async (node) => {
	const [, , ...children] = node;

	async function renderTree(items: ElementNode[], depth = 0): Promise<string> {
		const out: string[] = [];
		for (const item of items) {
			const tag = item[0] as string;
			const attrs = item[1] as Record<string, unknown>;
			const cChildren = item.slice(2) as ElementNode[];
			const name = getAttr(attrs, "name") ?? "unknown";

			if (tag === "folder") {
				const nested = cChildren.length
					? `<ul class="rt-file-tree__nested">${await renderTree(cChildren, depth + 1)}</ul>`
					: "";
				out.push(`
					<li class="rt-file-tree__item rt-file-tree__item--folder" style="--rt-ft-depth: ${depth}">
						<span class="rt-file-tree__label">
							<span class="i-mdi:folder-outline rt-file-tree__icon" aria-hidden="true"></span>
							${name}
						</span>
						${nested}
					</li>
				`);
			} else if (tag === "file") {
				out.push(`
					<li class="rt-file-tree__item rt-file-tree__item--file" style="--rt-ft-depth: ${depth}">
						<span class="rt-file-tree__label">
							<span class="i-mdi:file-document-outline rt-file-tree__icon" aria-hidden="true"></span>
							${name}
						</span>
					</li>
				`);
			}
		}
		return out.join("");
	}

	const valid = children.filter(
		(c) =>
			(c as ElementNode)[0] === "folder" || (c as ElementNode)[0] === "file",
	) as ElementNode[];
	if (!valid.length) return "";

	return `<ul class="rt-file-tree">${await renderTree(valid)}</ul>`;
};

export const kbdComponent: NodeHandler = async (node, state) => {
	const [, , ...children] = node;
	const text = (await state.render(children)).replace(/<[^>]+>/g, "");
	return `<kbd class="rt-kbd">${text}</kbd>`;
};

export const badgeComponent: NodeHandler = async (node, state) => {
	const [, attrs, ...children] = node;
	const text = getAttr(attrs, "text") ?? (await state.render(children));
	const type = getAttr(attrs, "type") ?? "default";
	return `<span class="rt-badge rt-badge--${type}">${text}</span>`;
};

export const accordionComponent: NodeHandler = async (node, state) => {
	const [, attrs, ...children] = node;
	const title = getAttr(attrs, "title");
	const id = `acc-${rand()}`;

	// <accordion title="..."> ... content ... </accordion>
	if (title) {
		const body = await state.render(children);
		return `<details class="rt-accordion" id="${id}">
			<summary class="rt-accordion__summary">${title}</summary>
			<div class="rt-accordion__body">${body}</div>
		</details>`;
	}

	// <accordion> <item title="...">...</item> ... </accordion>
	const items: { title: string; body: string }[] = [];
	for (const child of children) {
		const el = child as ElementNode;
		if (el[0] !== "item") continue;
		const [, cAttrs, ...cChildren] = el;
		const itemTitle = getAttr(cAttrs, "title") ?? "Item";
		const body = await state.render(cChildren);
		items.push({ title: itemTitle, body });
	}

	if (!items.length) return await state.render(children);

	return `<div class="rt-accordion-group">
		${items
			.map(
				(item, i) => `
				<details class="rt-accordion" id="${id}-${i}">
					<summary class="rt-accordion__summary">${item.title}</summary>
					<div class="rt-accordion__body">${item.body}</div>
				</details>
			`,
			)
			.join("")}
	</div>`;
};

const videoHosts = new Set([
	"youtube.com",
	"www.youtube.com",
	"youtu.be",
	"vimeo.com",
]);

export const youtubeComponent: NodeHandler = async (node) => {
	const [, attrs] = node;
	const id = getAttr(attrs, "id");
	if (!id) return "";
	return `<div class="rt-youtube" data-id="${id}" role="img" aria-label="YouTube video">
		<button type="button" class="rt-youtube__play" aria-label="Play video">
			<span class="i-mdi:play-circle text-5xl" aria-hidden="true"></span>
		</button>
	</div>`;
};

export const videoComponent: NodeHandler = async (node) => {
	const [, attrs] = node;
	const src = getAttr(attrs, "src");
	if (!src) return "";

	try {
		const url = new URL(src);
		if (!videoHosts.has(url.hostname)) {
			return `<p class="rt-markdown__error">Unsupported video host: ${url.hostname}</p>`;
		}
	} catch {
		return `<p class="rt-markdown__error">Invalid video URL</p>`;
	}

	return `<div class="rt-video" data-src="${src}">
		<a href="${src}" target="_blank" rel="noreferrer" class="rt-video__link">Watch video</a>
	</div>`;
};

export const timelineComponent: NodeHandler = async (node, state) => {
	const [, , ...children] = node;
	const events: { date?: string; title?: string; body: string }[] = [];

	for (const child of children) {
		const el = child as ElementNode;
		if (el[0] !== "event") continue;
		const [, cAttrs, ...cChildren] = el;
		const body = await state.render(cChildren);
		events.push({
			date: getAttr(cAttrs, "date"),
			title: getAttr(cAttrs, "title"),
			body,
		});
	}

	if (!events.length) return await state.render(children);

	return `<ol class="rt-timeline">
		${events
			.map(
				(e) => `
				<li class="rt-timeline__item">
					<div class="rt-timeline__dot" aria-hidden="true"></div>
					<div class="rt-timeline__content">
						${e.date ? `<time class="rt-timeline__date">${e.date}</time>` : ""}
						${e.title ? `<div class="rt-timeline__title">${e.title}</div>` : ""}
						<div class="rt-timeline__body">${e.body}</div>
					</div>
				</li>
			`,
			)
			.join("")}
	</ol>`;
};

export const tooltipComponent: NodeHandler = async (node, state) => {
	const [, attrs, ...children] = node;
	const text = getAttr(attrs, "text") ?? (await state.render(children));
	const tip = getAttr(attrs, "tip") ?? "";
	const id = `tt-${rand()}`;
	return `<span class="rt-tooltip" id="${id}" data-tip="${tip}" tabindex="0">${text}</span>`;
};

export const copyComponent: NodeHandler = async (node, state) => {
	const [, attrs, ...children] = node;
	const value = getAttr(attrs, "value");
	if (!value) return await state.render(children);
	const id = `cp-${rand()}`;
	return `<button type="button" class="rt-copy" id="${id}" data-copy="${value}" aria-label="Copy to clipboard">${getAttr(attrs, "label") ?? value}</button>`;
};

export const codePreviewComponent: NodeHandler = async (node, state) => {
	const [, , ...children] = node;
	const rendered = await state.render(children);
	const code = rendered
		.replace(/<[^>]+>/g, "")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&amp;/g, "&")
		.trim();
	const id = `preview-${rand()}`;
	return `<div class="rt-code-preview" id="${id}" data-code="${code.replace(/"/g, "&quot;")}">
		<div class="rt-code-preview__result" aria-live="polite"></div>
		<pre class="rt-code-preview__code"><code>${rendered}</code></pre>
	</div>`;
};

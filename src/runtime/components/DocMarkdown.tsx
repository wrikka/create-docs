import type { ElementNode, NodeHandler } from "comark";
import { createEffect, onCleanup } from "solid-js";
import { useDocs } from "../context";
import "katex/dist/katex.min.css";
import "../markdown-content.css";

const alertMap: Record<string, string> = {
	info: "rt-alert--info",
	note: "rt-alert--note",
	success: "rt-alert--success",
	tip: "rt-alert--tip",
	important: "rt-alert--important",
	warning: "rt-alert--warning",
	caution: "rt-alert--caution",
	danger: "rt-alert--danger",
};

type RenderFn = (source: string) => Promise<string>;
type FeatureKey = "base" | "base:math" | "base:mermaid" | "base:math:mermaid";

const renderers: Partial<Record<FeatureKey, RenderFn>> = {};

function detectFeatures(source: string): { math: boolean; mermaid: boolean } {
	const mermaid = source.includes("```mermaid");
	const math =
		/\$\$/.test(source) ||
		/(?:^|[^$\d])\$[^$\s\d][^$\n]*\$(?:[^$]|$)/.test(source);
	return { math, mermaid };
}

const blockquoteComponent: NodeHandler = async (node, state) => {
	const [, attrs, ...children] = node;
	const as = attrs.as as string | undefined;
	if (!as) return `<blockquote>${await state.render(children)}</blockquote>`;
	const cls = alertMap[as] ?? `rt-alert rt-alert--${as}`;
	const title = as.charAt(0).toUpperCase() + as.slice(1);
	return `<div class="rt-alert ${cls}" role="alert"><p class="rt-alert__title">${title}</p>${await state.render(children)}</div>`;
};

const codeGroupComponent: NodeHandler = async (node, state) => {
	const [, , ...children] = node;
	if (!children.length) return "";

	const tabs = await Promise.all(
		children.map(async (child, i) => {
			const el = child as ElementNode;
			const [tag, cAttrs] = el;
			if (tag !== "pre") return null;
			const label =
				(cAttrs["data-language"] as string) ||
				(cAttrs.class as string) ||
				`tab-${i + 1}`;
			const html = await state.render(el);
			const id = `cg-${Math.random().toString(36).slice(2, 8)}-${i}`;
			return { id, label, html };
		}),
	);

	const valid = tabs.filter(Boolean) as {
		id: string;
		label: string;
		html: string;
	}[];
	if (!valid.length) return "";

	return `<div class="rt-code-group">
	<div class="rt-code-group__tabs" role="tablist">
		${valid
			.map(
				(t, i) =>
					`<button type="button" class="rt-code-group__tab${i === 0 ? " rt-code-group__tab--active" : ""}" data-target="${t.id}" role="tab" aria-selected="${i === 0 ? "true" : "false"}">${t.label}</button>`,
			)
			.join("")}
	</div>
	${valid
		.map(
			(t, i) =>
				`<div class="rt-code-group__panel${i === 0 ? " rt-code-group__panel--active" : ""}" id="${t.id}" role="tabpanel">${t.html}</div>`,
		)
		.join("")}
</div>`;
};

const playgroundComponent: NodeHandler = async (node, state) => {
	const [, , ...children] = node;
	if (!children.length) return "";
	const el = children[0] as ElementNode;
	if (el[0] !== "pre") return await state.render(children);
	const html = await state.render(el);
	const id = `pg-${Math.random().toString(36).slice(2, 8)}`;
	return `<div class="rt-playground" data-playground="${id}">
	<div class="rt-playground__preview" data-preview="${id}"></div>
	<details class="rt-playground__source" open>
		<summary>Source</summary>
		${html}
	</details>
</div>`;
};

const stepsComponent: NodeHandler = async (node, state) => {
	const [, , ...children] = node;
	const items: string[] = [];
	for (const child of children) {
		const el = child as ElementNode;
		if (el[0] === "ol" || el[0] === "ul") {
			const [, , ...listItems] = el;
			for (const li of listItems) {
				const liEl = li as ElementNode;
				if (liEl[0] !== "li") continue;
				const [, , ...liChildren] = liEl;
				items.push(await state.render(liChildren));
			}
		}
	}
	if (!items.length) return await state.render(children);
	const id = `steps-${Math.random().toString(36).slice(2, 8)}`;
	return `<ol class="rt-steps" data-steps="${id}">
	${items
		.map(
			(body, i) => `<li class="rt-steps__item" data-step="${i}">
		<span class="rt-steps__marker" aria-hidden="true">${i + 1}</span>
		<div class="rt-steps__body">${body}</div>
	</li>`,
		)
		.join("")}
</ol>`;
};

async function buildRenderer(features: {
	math: boolean;
	mermaid: boolean;
}): Promise<RenderFn> {
	const [
		{ createHtmlRenderer },
		{ default: security },
		{ default: rangi },
		{ default: taskList },
		{ github },
	] = await Promise.all([
		import("@comark/html"),
		import("@comark/html/plugins/security"),
		import("@comark/html/plugins/rangi"),
		import("@comark/html/plugins/task-list"),
		import("rangi/themes"),
	]);

	const plugins = [
		security({
			blockedTags: ["script", "iframe", "object", "embed", "link", "style"],
			allowedProtocols: ["https", "http", "mailto"],
		}),
		rangi({ theme: github }),
		taskList(),
	];

	const components: Record<string, NodeHandler> = {
		blockquote: blockquoteComponent,
		"code-group": codeGroupComponent,
		playground: playgroundComponent,
		steps: stepsComponent,
	};

	if (features.mermaid) {
		const mermaidModule = await import("@comark/html/plugins/mermaid");
		plugins.push(mermaidModule.default());
		components.mermaid = mermaidModule.Mermaid as NodeHandler;
	}

	if (features.math) {
		const mathModule = await import("@comark/html/plugins/math");
		plugins.push(mathModule.default());
		components.math = mathModule.Math as NodeHandler;
	}

	return createHtmlRenderer({ plugins, components });
}

function getRendererKey(features: {
	math: boolean;
	mermaid: boolean;
}): FeatureKey {
	if (features.math && features.mermaid) return "base:math:mermaid";
	if (features.math) return "base:math";
	if (features.mermaid) return "base:mermaid";
	return "base";
}

async function getComarkRender(source: string): Promise<RenderFn> {
	const features = detectFeatures(source);
	const key = getRendererKey(features);
	if (!renderers[key]) {
		renderers[key] = await buildRenderer(features);
	}
	return renderers[key] as RenderFn;
}

export function slugify(text: string): string {
	return text
		.trim()
		.toLowerCase()
		.replace(/[^\p{L}\p{N}\s-]/gu, "")
		.replace(/\s+/gu, "-")
		.replace(/-+/g, "-")
		.substring(0, 80);
}

function enhanceMarkdown(el: HTMLDivElement) {
	const headings = el.querySelectorAll("h1, h2, h3, h4, h5, h6");
	for (const h of headings) {
		if (h.id) continue;
		const id = slugify(h.textContent ?? "");
		if (id) h.id = id;
	}

	const pres = el.querySelectorAll("pre");
	for (const pre of pres) {
		if (pre.querySelector(".rt-code-copy")) continue;
		const code = pre.querySelector("code");
		const text = code?.textContent ?? pre.textContent ?? "";
		const btn = document.createElement("button");
		btn.type = "button";
		btn.className = "rt-code-copy";
		btn.textContent = "Copy";
		btn.setAttribute("aria-label", "Copy code");
		btn.title = "Copy code";
		btn.addEventListener("click", () => {
			navigator.clipboard.writeText(text).catch(() => {});
			const original = btn.textContent;
			btn.textContent = "Copied!";
			setTimeout(() => (btn.textContent = original), 1500);
		});
		pre.appendChild(btn);
	}

	const codeGroups = el.querySelectorAll(".rt-code-group");
	for (const group of codeGroups) {
		const tabs = group.querySelectorAll<HTMLButtonElement>(
			".rt-code-group__tab",
		);
		const panels = group.querySelectorAll<HTMLDivElement>(
			".rt-code-group__panel",
		);
		for (const tab of tabs) {
			tab.addEventListener("click", () => {
				const target = tab.dataset.target;
				for (const t of tabs) {
					t.classList.toggle(
						"rt-code-group__tab--active",
						t.dataset.target === target,
					);
					t.setAttribute("aria-selected", String(t.dataset.target === target));
				}
				for (const p of panels) {
					p.classList.toggle("rt-code-group__panel--active", p.id === target);
				}
			});
		}
	}

	const playgrounds = el.querySelectorAll<HTMLDivElement>(".rt-playground");
	for (const pg of playgrounds) {
		if (pg.dataset.enhanced) continue;
		pg.dataset.enhanced = "1";
		const previewEl = pg.querySelector<HTMLDivElement>("[data-preview]");
		const pre = pg.querySelector("pre");
		const code = pre?.querySelector("code");
		if (!previewEl || !pre || !code) continue;

		const iframe = document.createElement("iframe");
		iframe.setAttribute("sandbox", "allow-scripts");
		iframe.setAttribute("title", "Playground preview");
		iframe.className = "rt-playground__frame";
		iframe.srcdoc = code.textContent ?? "";
		previewEl.appendChild(iframe);

		const source = pre;
		source.setAttribute("contenteditable", "true");
		source.setAttribute("spellcheck", "false");
		source.addEventListener("input", () => {
			iframe.srcdoc = source.textContent ?? "";
		});
	}

	const stepsKey = `create-docs:steps:${location.pathname}`;
	let savedSteps: number[] = [];
	try {
		savedSteps = JSON.parse(localStorage.getItem(stepsKey) ?? "[]");
	} catch {
		savedSteps = [];
	}
	const stepLists = el.querySelectorAll<HTMLOListElement>(".rt-steps");
	for (const list of stepLists) {
		if (list.dataset.enhanced) continue;
		list.dataset.enhanced = "1";
		const items = list.querySelectorAll<HTMLLIElement>(".rt-steps__item");
		for (const item of items) {
			const idx = Number(item.dataset.step);
			const box = document.createElement("input");
			box.type = "checkbox";
			box.className = "rt-steps__check";
			box.checked = savedSteps.includes(idx);
			box.setAttribute("aria-label", `Mark step ${idx + 1} complete`);
			item.classList.toggle("rt-steps__item--done", box.checked);
			box.addEventListener("change", () => {
				item.classList.toggle("rt-steps__item--done", box.checked);
				const done = Array.from(items)
					.filter((it) => it.classList.contains("rt-steps__item--done"))
					.map((it) => Number(it.dataset.step));
				try {
					localStorage.setItem(stepsKey, JSON.stringify(done));
				} catch {
					// storage unavailable — progress not persisted
				}
			});
			item.insertBefore(box, item.firstChild);
		}
	}
}

function applyMarked(source: string) {
	return import("marked").then(({ marked }) => marked.parse(source) as string);
}

export function DocMarkdown(props: { source: string }) {
	let el: HTMLDivElement | undefined;
	const config = useDocs();

	const renderMarkdown = async () => {
		if (!el) return;
		try {
			const engine = config.markdown?.engine ?? "comark";
			const str =
				engine === "marked"
					? await applyMarked(props.source)
					: await (await getComarkRender(props.source))(props.source);
			el.innerHTML = str;
			queueMicrotask(() => enhanceMarkdown(el as HTMLDivElement));
		} catch (err) {
			el.innerHTML = `<p class="rt-markdown__error">Failed to render docs: ${err}</p>`;
		}
	};

	createEffect(() => {
		renderMarkdown();
	});
	onCleanup(() => {
		el = undefined;
	});

	return (
		<div
			ref={(node) => {
				el = node;
				renderMarkdown();
			}}
			class="rt-markdown"
		/>
	);
}

import { createHtmlRenderer } from "@comark/html";
import rangi from "@comark/html/plugins/rangi";
import security from "@comark/html/plugins/security";
import { github } from "rangi/themes";
import { createEffect, onCleanup } from "solid-js";
import { useDocs } from "../context";
import "../markdown-content.css";

const alertMap: Record<string, string> = {
	note: "rt-alert--note",
	tip: "rt-alert--tip",
	important: "rt-alert--important",
	warning: "rt-alert--warning",
	caution: "rt-alert--caution",
	danger: "rt-alert--danger",
};

const renderHtml = createHtmlRenderer({
	plugins: [
		security({
			blockedTags: ["script", "iframe", "object", "embed", "link", "style"],
			allowedProtocols: ["https", "http", "mailto"],
		}),
		rangi({ theme: github }),
	],
	components: {
		blockquote: async ([, attrs, ...children], { render }) => {
			const as = attrs.as as string | undefined;
			if (!as) return `<blockquote>${await render(children)}</blockquote>`;
			const cls = alertMap[as] ?? `rt-alert rt-alert--${as}`;
			const title = as.charAt(0).toUpperCase() + as.slice(1);
			return `<div class="rt-alert ${cls}" role="alert"><p class="rt-alert__title">${title}</p>${await render(children)}</div>`;
		},
	},
});

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
					: await renderHtml(props.source);
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

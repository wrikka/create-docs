import { createEffect, onCleanup } from "solid-js";
import "../markdown-content.css";

export function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^\w\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.substring(0, 80);
}

function enhanceMarkdown(el: HTMLDivElement) {
	const headings = el.querySelectorAll("h1, h2, h3, h4, h5, h6");
	for (const h of headings) {
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

function applyAlerts(html: string): string {
	return html.replace(
		/<blockquote>\s*<p>\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION|DANGER)\]([\s\S]*?)<\/blockquote>/gi,
		(_, type: string, inner: string) => {
			const t = type.toLowerCase();
			const title = t.charAt(0).toUpperCase() + t.slice(1);
			const body = inner.trim().replace(/<\/p>\s*$/, "");
			return `<div class="rt-alert rt-alert--${t}"><p class="rt-alert__title">${title}</p><p>${body}</p></div>`;
		},
	);
}

export function DocMarkdown(props: { source: string }) {
	let el: HTMLDivElement | undefined;

	const renderMarkdown = async () => {
		if (!el) return;
		try {
			const { marked } = await import("marked");
			const str = applyAlerts(marked.parse(props.source) as string);
			el.innerHTML = str;
			queueMicrotask(() => enhanceMarkdown(el as HTMLDivElement));
		} catch (err) {
			el.innerHTML = `<p class="rt-markdown__error">Failed to render docs: ${err}</p>`;
		}
	};

	createEffect(renderMarkdown);
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

/**
 * Solid CodeBlock Component
 *
 * Code block component with syntax highlighting and copy functionality
 */

import { createSignal, For, onMount, Show } from "solid-js";
import type { CodeBlockOptions } from "../../modules/code-block-enhancements";

export interface CodeBlockProps extends CodeBlockOptions {
	/** Code content */
	code: string;
	/** Language */
	language?: string;
}

export const CodeBlock = (props: CodeBlockProps) => {
	const [copied, setCopied] = createSignal(false);
	const [highlightedCode, setHighlightedCode] = createSignal("");

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(props.code);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy code:", err);
		}
	};

	onMount(() => {
		// Basic syntax highlighting - in production, integrate with a proper highlighter
		// This is a placeholder that can be enhanced with Shiki or similar
		let highlighted = props.code
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;");

		// Simple keyword highlighting for common languages
		if (props.language === "typescript" || props.language === "ts") {
			highlighted = highlighted
				.replace(
					/\b(const|let|var|function|return|if|else|for|while|import|export|from|interface|type|class|extends|implements)\b/g,
					'<span class="keyword">$1</span>',
				)
				.replace(
					/\b(string|number|boolean|void|any|never)\b/g,
					'<span class="type">$1</span>',
				);
		} else if (props.language === "javascript" || props.language === "js") {
			highlighted = highlighted.replace(
				/\b(const|let|var|function|return|if|else|for|while|import|export|from|class|extends)\b/g,
				'<span class="keyword">$1</span>',
			);
		}

		setHighlightedCode(highlighted);
	});

	const lineNumbers = () => {
		if (!props.lineNumbers) return null;
		const lines = props.code.split("\n");
		return (
			<div class="code-block-line-numbers">
				<For each={lines}>
					{(_, i) => <div class="line-number">{i() + 1}</div>}
				</For>
			</div>
		);
	};

	const highlightLines = () => {
		if (!props.highlightLines || props.highlightLines.length === 0) return "";
		return props.highlightLines.map((line) => `.line-${line}`).join(", ");
	};

	return (
		<div
			class="code-block"
			classList={{
				"code-block-dark": props.theme === "dark" || props.theme === "auto",
			}}
		>
			<Show when={props.filename || props.copyButton !== false}>
				<div class="code-block-header">
					<Show when={props.filename}>
						<span class="code-block-filename">{props.filename}</span>
					</Show>
					<Show when={props.copyButton !== false}>
						<button
							type="button"
							class="code-block-copy"
							onClick={handleCopy}
							aria-label={copied() ? "Copied!" : "Copy code"}
						>
							{copied() ? "✓" : "📋"}
						</button>
					</Show>
				</div>
			</Show>
			<div class="code-block-content">
				{lineNumbers()}
				<pre class="code-block-pre">
					<code
						class={`code-block-code language-${props.language || "text"} ${highlightLines()}`}
						innerHTML={highlightedCode()}
					/>
				</pre>
			</div>
		</div>
	);
};

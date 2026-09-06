import { createSignal, Show } from "solid-js";
import { useDocs } from "../context";
import { DocMarkdown } from "./DocMarkdown";

async function suggest(prompt: string): Promise<string> {
	const res = await fetch("/api/ai/suggest", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ prompt }),
	});
	const data = (await res.json()) as { suggestion?: string; error?: string };
	if (!res.ok) throw new Error(data.error ?? "AI request failed");
	return data.suggestion ?? "";
}

export function AskAiDialog(props: {
	open: boolean;
	onClose: () => void;
	collection: string;
	docId: string;
	docTitle: string;
}) {
	const [question, setQuestion] = createSignal("");
	const [answer, setAnswer] = createSignal("");
	const [loading, setLoading] = createSignal(false);
	const [error, setError] = createSignal("");
	const dataSource = useDocs().dataSource;

	const ask = async () => {
		const q = question().trim();
		if (!q || loading()) return;
		setLoading(true);
		setError("");
		setAnswer("");
		try {
			let answer = "";
			if (dataSource.ask) {
				const res = await dataSource.ask({
					collection: props.collection,
					id: props.docId,
					question: q,
				});
				answer = res.answer;
			} else {
				answer = await suggest(`Document: ${props.docTitle}\nQuestion: ${q}`);
			}
			setAnswer(answer);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed to get answer");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Show when={props.open}>
			<div
				class="fixed inset-0 z-50 bg-overlay flex items-start justify-center pt-20 px-4"
				onClick={(e) => {
					if (e.target === e.currentTarget) props.onClose();
				}}
				role="presentation"
			>
				<div class="w-full max-w-2xl rounded-lg border border-border bg-surface shadow-2xl overflow-hidden">
					<div class="flex items-center gap-2 px-4 py-3 border-b border-border">
						<span
							class="i-mdi:robot-happy-outline text-primary"
							aria-hidden="true"
						/>
						<span class="text-sm font-semibold text-foreground">
							Ask AI about this page
						</span>
						<span class="text-xs text-muted truncate">— {props.docTitle}</span>
						<button
							type="button"
							onClick={props.onClose}
							aria-label="Close"
							class="ml-auto w-8 h-8 inline-flex items-center justify-center rounded-md text-muted hover:text-foreground hover:bg-background transition-colors cursor-pointer border-none bg-transparent"
						>
							<span class="i-mdi:close" aria-hidden="true" />
						</button>
					</div>
					<div class="p-4">
						<div class="flex gap-2">
							<textarea
								value={question()}
								onInput={(e) => setQuestion(e.currentTarget.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter" && !e.shiftKey) {
										e.preventDefault();
										ask();
									}
								}}
								placeholder="Ask a question about this document..."
								aria-label="Question"
								rows={2}
								class="flex-1 px-3 py-2 rounded-md border border-border bg-background text-sm text-foreground placeholder:text-muted resize-none outline-none focus:border-focus"
							/>
							<button
								type="button"
								onClick={ask}
								disabled={loading() || !question().trim()}
								class="self-end inline-flex items-center gap-1.5 px-4 h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover transition-colors cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<span
									class={
										loading() ? "i-mdi:loading animate-spin" : "i-mdi:send"
									}
									aria-hidden="true"
								/>
								{loading() ? "Asking…" : "Ask"}
							</button>
						</div>
						<Show when={error()}>
							<p class="mt-3 text-sm text-destructive">{error()}</p>
						</Show>
						<Show when={answer()}>
							<div class="mt-4 pt-3 border-t border-border">
								<DocMarkdown source={answer()} />
							</div>
						</Show>
					</div>
				</div>
			</div>
		</Show>
	);
}

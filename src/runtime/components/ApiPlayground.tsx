import { createSignal, For, Show } from "solid-js";
import type { ApiEndpoint } from "../types";

const METHOD_COLOR: Record<string, string> = {
	GET: "text-accent",
	POST: "text-success",
	PUT: "text-warning",
	PATCH: "text-warning",
	DELETE: "text-destructive",
};

function buildCurl(ep: ApiEndpoint, url: string, body: string): string {
	const lines = [`curl -X ${ep.method} '${url}'`];
	if (body.trim()) {
		lines.push(`  -H 'Content-Type: application/json'`, `  -d '${body}'`);
	}
	return lines.join(" \\\n");
}

/** Scalar-style try-it panel: params → send → response. */
export function ApiPlayground(props: { endpoint: ApiEndpoint }) {
	const ep = () => props.endpoint;
	const [paramValues, setParamValues] = createSignal<Record<string, string>>(
		{},
	);
	const [body, setBody] = createSignal(
		ep().requestBody?.example != null
			? JSON.stringify(ep().requestBody?.example, null, 2)
			: "",
	);
	const [sending, setSending] = createSignal(false);
	const [result, setResult] = createSignal<{
		status: number;
		ms: number;
		body: string;
	} | null>(null);
	const [error, setError] = createSignal("");

	const setParam = (name: string, value: string) =>
		setParamValues((p) => ({ ...p, [name]: value }));

	const resolvedUrl = () => {
		let path = ep().path;
		const query = new URLSearchParams();
		for (const p of ep().parameters) {
			const v = paramValues()[p.name] ?? "";
			if (p.in === "path")
				path = path.replace(`{${p.name}}`, v || `{${p.name}}`);
			else if (p.in === "query" && v) query.set(p.name, v);
		}
		const base = ep().server ?? "";
		const qs = query.toString();
		return `${base}${path}${qs ? `?${qs}` : ""}`;
	};

	const send = async () => {
		setSending(true);
		setError("");
		setResult(null);
		const t0 = performance.now();
		try {
			const res = await fetch(resolvedUrl(), {
				method: ep().method,
				headers: body().trim()
					? { "Content-Type": "application/json" }
					: undefined,
				body: ep().method === "GET" || !body().trim() ? undefined : body(),
			});
			const text = await res.text();
			setResult({
				status: res.status,
				ms: Math.round(performance.now() - t0),
				body: text,
			});
		} catch (e) {
			setError(e instanceof Error ? e.message : String(e));
		} finally {
			setSending(false);
		}
	};

	const prettyResult = () => {
		const r = result();
		if (!r) return "";
		try {
			return JSON.stringify(JSON.parse(r.body), null, 2);
		} catch {
			return r.body;
		}
	};

	return (
		<div class="rounded-lg border border-border bg-surface overflow-hidden">
			<div class="flex items-center gap-2 px-3 py-2 border-b border-border">
				<span
					class={`text-xs font-bold ${METHOD_COLOR[ep().method] ?? "text-foreground"}`}
				>
					{ep().method}
				</span>
				<code class="text-xs text-muted font-mono truncate flex-1">
					{resolvedUrl() || ep().path}
				</code>
			</div>
			<div class="p-3 flex flex-col gap-3">
				<Show when={ep().parameters.length > 0}>
					<div>
						<p class="text-[11px] font-semibold uppercase tracking-wide text-muted m-0 mb-1.5">
							Parameters
						</p>
						<For each={ep().parameters}>
							{(p) => (
								<label class="flex items-center gap-2 mb-1.5">
									<span class="text-xs font-mono text-foreground w-28 truncate shrink-0">
										{p.name}
										<Show when={p.required}>
											<span class="text-destructive">*</span>
										</Show>
									</span>
									<input
										type="text"
										value={paramValues()[p.name] ?? ""}
										onInput={(e) => setParam(p.name, e.currentTarget.value)}
										placeholder={p.in}
										class="flex-1 min-w-0 h-7 px-2 rounded border border-border bg-background text-xs font-mono text-foreground outline-none focus:border-focus"
									/>
								</label>
							)}
						</For>
					</div>
				</Show>
				<Show when={ep().requestBody}>
					<div>
						<p class="text-[11px] font-semibold uppercase tracking-wide text-muted m-0 mb-1.5">
							Body
						</p>
						<textarea
							value={body()}
							onInput={(e) => setBody(e.currentTarget.value)}
							rows={6}
							spellcheck={false}
							class="w-full px-2 py-1.5 rounded border border-border bg-background text-xs font-mono text-foreground outline-none focus:border-focus resize-y"
						/>
					</div>
				</Show>
				<button
					type="button"
					onClick={send}
					disabled={sending()}
					class="inline-flex items-center justify-center gap-1.5 h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover transition-colors cursor-pointer border-none disabled:opacity-50"
				>
					<span
						class={sending() ? "i-mdi:loading animate-spin" : "i-mdi:send"}
						aria-hidden="true"
					/>
					{sending() ? "Sending…" : "Send request"}
				</button>
				<Show when={error()}>
					<p class="text-xs text-destructive m-0">{error()}</p>
				</Show>
				<Show when={result()}>
					{(r) => (
						<div>
							<div class="flex items-center gap-2 mb-1.5">
								<span
									class={`text-xs font-bold ${r().status < 400 ? "text-success" : "text-destructive"}`}
								>
									{r().status}
								</span>
								<span class="text-[11px] text-muted">{r().ms}ms</span>
							</div>
							<pre class="m-0 p-2 rounded border border-border bg-background text-xs font-mono text-foreground overflow-auto max-h-64 whitespace-pre-wrap">
								{prettyResult()}
							</pre>
						</div>
					)}
				</Show>
				<details class="text-xs text-muted">
					<summary class="cursor-pointer select-none">cURL</summary>
					<pre class="m-0 mt-1.5 p-2 rounded border border-border bg-background font-mono text-foreground overflow-auto whitespace-pre-wrap">
						{buildCurl(ep(), resolvedUrl(), body())}
					</pre>
				</details>
			</div>
		</div>
	);
}

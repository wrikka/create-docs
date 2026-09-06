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

function buildCommand(
	ep: ApiEndpoint,
	argValues: Record<string, string>,
): string {
	if (!ep.cli) return `${ep.method} ${ep.path}`;
	const parts = [ep.cli.command];
	if (ep.cli.subcommand) parts.push(ep.cli.subcommand);
	for (const a of ep.cli.args ?? []) {
		const v = argValues[a.name] ?? "";
		if (v) parts.push(`--${a.name}`, v);
	}
	return parts.join(" ");
}

export function ApiPlayground(props: {
	endpoint: ApiEndpoint;
	style?: string;
}) {
	const ep = () => props.endpoint;
	const style = () => props.style ?? "rest";

	const [paramValues, setParamValues] = createSignal<Record<string, string>>(
		{},
	);
	const [argValues, setArgValues] = createSignal<Record<string, string>>({});
	const [body, setBody] = createSignal(
		ep().requestBody?.example != null
			? JSON.stringify(ep().requestBody?.example, null, 2)
			: "",
	);
	const [query, setQuery] = createSignal(ep().graphql?.query ?? "");
	const [variables, setVariables] = createSignal(
		ep().graphql?.variables != null
			? JSON.stringify(ep().graphql?.variables, null, 2)
			: "",
	);
	const [sending, setSending] = createSignal(false);
	const [result, setResult] = createSignal<{
		status: number;
		ms: number;
		body: string;
	} | null>(null);
	const [error, setError] = createSignal("");
	const [copied, setCopied] = createSignal(false);

	const setParam = (name: string, value: string) =>
		setParamValues((p) => ({ ...p, [name]: value }));
	const setArg = (name: string, value: string) =>
		setArgValues((p) => ({ ...p, [name]: value }));

	const resolvedUrl = () => {
		let path = ep().path;
		const queryParams = new URLSearchParams();
		for (const p of ep().parameters) {
			const v = paramValues()[p.name] ?? "";
			if (p.in === "path")
				path = path.replace(`{${p.name}}`, v || `{${p.name}}`);
			else if (p.in === "query" && v) queryParams.set(p.name, v);
		}
		const base = ep().server ?? "";
		const qs = queryParams.toString();
		return `${base}${path}${qs ? `?${qs}` : ""}`;
	};

	const send = async () => {
		setSending(true);
		setError("");
		setResult(null);
		const t0 = performance.now();
		try {
			let requestBody: string | undefined;
			let headers: Record<string, string> | undefined;

			if (style() === "graphql") {
				const vars = variables().trim()
					? (JSON.parse(variables()) as Record<string, unknown>)
					: {};
				requestBody = JSON.stringify({ query: query(), variables: vars });
				headers = { "Content-Type": "application/json" };
			} else if (body().trim()) {
				requestBody = body();
				headers = { "Content-Type": "application/json" };
			}

			const res = await fetch(resolvedUrl(), {
				method: ep().method,
				headers,
				body: ep().method === "GET" || !requestBody ? undefined : requestBody,
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

	const copyCommand = () => {
		const text = buildCommand(ep(), argValues());
		navigator.clipboard.writeText(text).catch(() => {});
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
	};

	return (
		<div class="rounded-lg border border-border bg-surface overflow-hidden">
			<Show when={style() !== "cli"}>
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
			</Show>

			<div class="p-3 flex flex-col gap-3">
				<Show when={style() === "graphql"}>
					<div>
						<p class="text-[11px] font-semibold uppercase tracking-wide text-muted m-0 mb-1.5">
							Query
						</p>
						<textarea
							value={query()}
							onInput={(e) => setQuery(e.currentTarget.value)}
							rows={8}
							spellcheck={false}
							class="w-full px-2 py-1.5 rounded border border-border bg-background text-xs font-mono text-foreground outline-none focus:border-focus resize-y"
						/>
					</div>
					<div>
						<p class="text-[11px] font-semibold uppercase tracking-wide text-muted m-0 mb-1.5">
							Variables
						</p>
						<textarea
							value={variables()}
							onInput={(e) => setVariables(e.currentTarget.value)}
							rows={4}
							spellcheck={false}
							class="w-full px-2 py-1.5 rounded border border-border bg-background text-xs font-mono text-foreground outline-none focus:border-focus resize-y"
						/>
					</div>
				</Show>

				<Show when={style() === "cli"}>
					<div>
						<p class="text-[11px] font-semibold uppercase tracking-wide text-muted m-0 mb-1.5">
							Command
						</p>
						<pre class="m-0 p-2 rounded border border-border bg-background text-xs font-mono text-foreground overflow-auto whitespace-pre-wrap">
							{buildCommand(ep(), argValues())}
						</pre>
					</div>
					<Show when={ep().cli?.args?.length}>
						<div>
							<p class="text-[11px] font-semibold uppercase tracking-wide text-muted m-0 mb-1.5">
								Arguments
							</p>
							<For each={ep().cli?.args ?? []}>
								{(a) => (
									<label class="flex items-center gap-2 mb-1.5">
										<span class="text-xs font-mono text-foreground w-28 truncate shrink-0">
											{a.name}
											<Show when={a.required}>
												<span class="text-destructive">*</span>
											</Show>
										</span>
										<input
											type="text"
											value={argValues()[a.name] ?? ""}
											onInput={(e) => setArg(a.name, e.currentTarget.value)}
											placeholder={a.example ?? ""}
											class="flex-1 min-w-0 h-7 px-2 rounded border border-border bg-background text-xs font-mono text-foreground outline-none focus:border-focus"
										/>
									</label>
								)}
							</For>
						</div>
					</Show>
					<button
						type="button"
						onClick={copyCommand}
						class="inline-flex items-center justify-center gap-1.5 h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover transition-colors cursor-pointer border-none"
					>
						<span
							class={copied() ? "i-mdi:check" : "i-mdi:content-copy"}
							aria-hidden="true"
						/>
						{copied() ? "Copied!" : "Copy command"}
					</button>
				</Show>

				<Show
					when={
						ep().parameters.length > 0 &&
						style() !== "graphql" &&
						style() !== "cli"
					}
				>
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

				<Show
					when={ep().requestBody && style() !== "graphql" && style() !== "cli"}
				>
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

				<Show when={style() !== "cli"}>
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
						{sending()
							? "Sending…"
							: style() === "graphql"
								? "Run query"
								: "Send request"}
					</button>
				</Show>

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

				<Show when={style() !== "cli" && style() !== "graphql"}>
					<details class="text-xs text-muted">
						<summary class="cursor-pointer select-none">cURL</summary>
						<pre class="m-0 mt-1.5 p-2 rounded border border-border bg-background font-mono text-foreground overflow-auto whitespace-pre-wrap">
							{buildCurl(ep(), resolvedUrl(), body())}
						</pre>
					</details>
				</Show>
			</div>
		</div>
	);
}

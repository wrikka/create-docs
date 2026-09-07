import { createSignal, For, Show } from "solid-js";
import type { ApiEndpoint, ApiParameter } from "../types";
import { DocMarkdown } from "./DocMarkdown";

function CopyButton(props: { text: () => string; label?: string }) {
	const [copied, setCopied] = createSignal(false);
	return (
		<button
			type="button"
			onClick={() => {
				navigator.clipboard.writeText(props.text()).catch(() => {});
				setCopied(true);
				setTimeout(() => setCopied(false), 1500);
			}}
			class="px-2 h-6 inline-flex items-center gap-1 rounded text-[10px] text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer border-none bg-transparent"
		>
			<span
				class={copied() ? "i-mdi:check text-success" : "i-mdi:content-copy"}
				aria-hidden="true"
			/>
			{copied() ? "Copied" : (props.label ?? "Copy")}
		</button>
	);
}

function SectionCard(props: {
	title: string;
	icon: string;
	children: import("solid-js").JSX.Element;
	actions?: import("solid-js").JSX.Element;
}) {
	return (
		<section class="border border-border rounded-xl bg-surface/30 overflow-hidden mb-6">
			<header class="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-background/50">
				<span class={`${props.icon} text-primary`} aria-hidden="true" />
				<h2 class="text-sm font-semibold text-foreground m-0">{props.title}</h2>
				<div class="ml-auto">{props.actions}</div>
			</header>
			<div class="p-4">{props.children}</div>
		</section>
	);
}

const IN_BADGE: Record<string, string> = {
	path: "bg-primary/10 text-primary border-primary/30",
	query: "bg-accent/10 text-accent border-accent/30",
	header: "bg-warning/10 text-warning border-warning/30",
	cookie: "bg-muted/10 text-muted border-border",
};

function statusClass(code: string): string {
	const n = Number.parseInt(code, 10);
	if (n >= 200 && n < 300)
		return "bg-success/15 text-success border-success/30";
	if (n >= 300 && n < 400) return "bg-accent/15 text-accent border-accent/30";
	if (n >= 400 && n < 500)
		return "bg-warning/15 text-warning border-warning/30";
	if (n >= 500)
		return "bg-destructive/15 text-destructive border-destructive/30";
	return "bg-surface text-muted border-border";
}

function ParamRow(props: { p: ApiParameter }) {
	return (
		<div class="flex items-start gap-3 py-2.5 border-b border-border/50 last:border-0">
			<div class="min-w-0 flex-1">
				<div class="flex items-center gap-2 flex-wrap">
					<code class="text-sm font-mono font-semibold text-foreground">
						{props.p.name}
					</code>
					<span
						class={`text-[10px] px-1.5 py-0.5 rounded border ${IN_BADGE[props.p.in] ?? IN_BADGE.query}`}
					>
						{props.p.in}
					</span>
					<Show
						when={props.p.required}
						fallback={<span class="text-[10px] text-muted">optional</span>}
					>
						<span class="text-[10px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive font-medium">
							required
						</span>
					</Show>
				</div>
				<Show when={props.p.description}>
					<p class="text-xs text-muted m-0 mt-1 leading-relaxed">
						{props.p.description}
					</p>
				</Show>
			</div>
			<Show when={props.p.example != null}>
				<code class="text-[11px] font-mono px-2 py-1 rounded bg-background border border-border text-muted shrink-0 max-w-40 truncate">
					{typeof props.p.example === "string"
						? props.p.example
						: JSON.stringify(props.p.example)}
				</code>
			</Show>
		</div>
	);
}

function JsonBlock(props: { value: unknown }) {
	const text = () => JSON.stringify(props.value, null, 2);
	return (
		<div class="relative rounded-lg bg-background border border-border">
			<div class="absolute top-1.5 right-1.5">
				<CopyButton text={text} />
			</div>
			<pre class="text-xs font-mono text-foreground p-3 m-0 overflow-x-auto whitespace-pre-wrap break-all">
				{text()}
			</pre>
		</div>
	);
}

function ResponseRow(props: {
	code: string;
	description: string;
	example?: unknown;
}) {
	const [open, setOpen] = createSignal(false);
	return (
		<div class="border-b border-border/50 last:border-0">
			<button
				type="button"
				onClick={() => props.example != null && setOpen(!open())}
				class="w-full flex items-center gap-3 px-1 py-2.5 text-left cursor-pointer border-none bg-transparent"
			>
				<span
					class={`inline-flex items-center justify-center min-w-12 px-2 py-0.5 rounded-md border text-xs font-bold font-mono ${statusClass(props.code)}`}
				>
					{props.code}
				</span>
				<span class="text-sm text-muted flex-1">{props.description}</span>
				<Show when={props.example != null}>
					<span
						class={`i-mdi:chevron-down text-muted transition-transform ${open() ? "rotate-180" : ""}`}
						aria-hidden="true"
					/>
				</Show>
			</button>
			<Show when={open() && props.example != null}>
				<div class="pb-3">
					<JsonBlock value={props.example} />
				</div>
			</Show>
		</div>
	);
}

function curlCommand(ep: ApiEndpoint, base?: string): string {
	const url = `${base ?? ep.server ?? "https://api.example.com"}${ep.path}`;
	const lines = [`curl -X ${ep.method} "${url}"`];
	for (const p of ep.parameters.filter((x) => x.in === "header")) {
		lines.push(`  -H "${p.name}: <value>"`);
	}
	if (ep.requestBody?.example != null) {
		lines.push(`  -H "Content-Type: application/json"`);
		lines.push(`  -d '${JSON.stringify(ep.requestBody.example)}'`);
	}
	return lines.join(" \\\n");
}

export function ApiReference(props: {
	endpoint: ApiEndpoint;
	style: "rest" | "graphql" | "cli" | "rpc";
}) {
	const ep = () => props.endpoint;
	const codes = () => Object.keys(ep().responses);

	return (
		<div>
			<Show when={ep().description}>
				<div class="markdown-body mb-6">
					<DocMarkdown source={ep().description ?? ""} />
				</div>
			</Show>

			<Show when={props.style === "cli"}>
				<SectionCard
					title="Usage"
					icon="i-mdi:console-line"
					actions={
						<CopyButton
							text={() =>
								ep().cli
									? [
											ep().cli!.command,
											ep().cli!.subcommand,
											...(ep().cli!.args?.map((a) =>
												a.required ? `<${a.name}>` : `[${a.name}]`,
											) ?? []),
										].join(" ")
									: `${ep().method} ${ep().path}`
							}
						/>
					}
				>
					<pre class="text-sm font-mono text-foreground bg-background border border-border rounded-lg p-3 m-0 overflow-x-auto">
						{ep().cli
							? [
									ep().cli!.command,
									ep().cli!.subcommand,
									...(ep().cli!.args?.map((a) =>
										a.required ? `<${a.name}>` : `[${a.name}]`,
									) ?? []),
								].join(" ")
							: `${ep().method} ${ep().path}`}
					</pre>
					<Show when={ep().cli?.args?.length}>
						<div class="mt-4">
							<For each={ep().cli?.args ?? []}>
								{(a) => (
									<div class="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
										<code class="text-sm font-mono font-semibold text-foreground">
											{a.name}
										</code>
										<Show when={a.required}>
											<span class="text-[10px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive font-medium">
												required
											</span>
										</Show>
										<span class="text-xs text-muted flex-1">
											{a.description}
										</span>
									</div>
								)}
							</For>
						</div>
					</Show>
				</SectionCard>
			</Show>

			<Show when={props.style === "graphql"}>
				<Show when={ep().graphql?.query}>
					<SectionCard
						title="Query"
						icon="i-mdi:graphql"
						actions={<CopyButton text={() => ep().graphql?.query ?? ""} />}
					>
						<pre class="text-xs font-mono text-foreground bg-background border border-border rounded-lg p-3 m-0 overflow-x-auto whitespace-pre-wrap">
							{ep().graphql?.query}
						</pre>
					</SectionCard>
				</Show>
				<Show when={ep().graphql?.variables != null}>
					<SectionCard title="Variables" icon="i-mdi:code-json">
						<JsonBlock value={ep().graphql?.variables} />
					</SectionCard>
				</Show>
			</Show>

			<Show when={props.style === "rest" || props.style === "rpc"}>
				<Show when={ep().parameters.length > 0}>
					<SectionCard
						title="Parameters"
						icon="i-mdi:tune-variant"
						actions={
							<span class="text-[10px] text-muted">
								{ep().parameters.length} field
								{ep().parameters.length === 1 ? "" : "s"}
							</span>
						}
					>
						<For each={ep().parameters}>{(p) => <ParamRow p={p} />}</For>
					</SectionCard>
				</Show>

				<Show when={ep().requestBody}>
					<SectionCard
						title="Request Body"
						icon="i-mdi:code-braces"
						actions={
							<Show when={ep().requestBody?.required}>
								<span class="text-[10px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive font-medium">
									required
								</span>
							</Show>
						}
					>
						<Show when={ep().requestBody?.description}>
							<p class="text-sm text-muted m-0 mb-3 leading-relaxed">
								{ep().requestBody?.description}
							</p>
						</Show>
						<Show when={ep().requestBody?.example != null}>
							<JsonBlock value={ep().requestBody?.example} />
						</Show>
					</SectionCard>
				</Show>

				<SectionCard
					title="cURL"
					icon="i-mdi:console"
					actions={<CopyButton text={() => curlCommand(ep())} />}
				>
					<pre class="text-xs font-mono text-foreground bg-background border border-border rounded-lg p-3 m-0 overflow-x-auto whitespace-pre-wrap">
						{curlCommand(ep())}
					</pre>
				</SectionCard>
			</Show>

			<Show when={ep().requestBody?.example != null && props.style === "cli"}>
				<SectionCard title="Options" icon="i-mdi:code-json">
					<JsonBlock value={ep().requestBody?.example} />
				</SectionCard>
			</Show>

			<Show when={codes().length > 0}>
				<SectionCard
					title={props.style === "cli" ? "Exit codes" : "Responses"}
					icon="i-mdi:reply-outline"
					actions={
						<span class="text-[10px] text-muted">
							{codes().length} code{codes().length === 1 ? "" : "s"}
						</span>
					}
				>
					<For each={codes()}>
						{(code) => (
							<ResponseRow
								code={code}
								description={ep().responses[code]?.description ?? ""}
								example={ep().responses[code]?.example}
							/>
						)}
					</For>
				</SectionCard>
			</Show>
		</div>
	);
}

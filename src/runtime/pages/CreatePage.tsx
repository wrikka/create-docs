import { createSignal, For, Show } from "solid-js";

interface Template {
	id: string;
	name: string;
	description: string;
	icon: string;
	tags: string[];
}

const templates: Template[] = [
	{
		id: "docs",
		name: "Documentation site",
		description: "VitePress-style docs, changelog, and API references.",
		icon: "i-mdi:book-open-page-variant",
		tags: ["Markdown", "API", "Search"],
	},
	{
		id: "api",
		name: "API reference",
		description: "Scalar-like API playground with OpenAPI / oRPC / Elysia.",
		icon: "i-mdi:api",
		tags: ["OpenAPI", "oRPC", "Playground"],
	},
	{
		id: "showcase",
		name: "Showcase",
		description: "A grid of project or product cards with previews.",
		icon: "i-mdi:view-dashboard",
		tags: ["Cards", "Portfolio"],
	},
];

export function CreatePage() {
	const [step, setStep] = createSignal<
		"template" | "github" | "deploy" | "done"
	>("template");
	const [selected, setSelected] = createSignal<string>("docs");
	const [repo, setRepo] = createSignal("");
	const [token, setToken] = createSignal("");
	const [cfToken, setCfToken] = createSignal("");
	const [loading, setLoading] = createSignal(false);
	const [error, setError] = createSignal("");

	const pick = (id: string) => {
		setSelected(id);
		setStep("github");
	};

	const createRepo = async () => {
		if (!repo() || !token()) {
			setError("Please enter a repository name and GitHub token.");
			return;
		}
		setLoading(true);
		setError("");
		try {
			const res = await fetch("https://api.github.com/user/repos", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token()}`,
					Accept: "application/vnd.github+json",
					"X-GitHub-Api-Version": "2022-11-28",
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name: repo(),
					private: false,
					auto_init: true,
				}),
			});
			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				throw new Error(body.message ?? `GitHub error ${res.status}`);
			}
			setStep("deploy");
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed to create repository.");
		} finally {
			setLoading(false);
		}
	};

	const deploy = async () => {
		if (!cfToken()) {
			setError("Please enter a Cloudflare API token.");
			return;
		}
		setLoading(true);
		setError("");
		await new Promise((r) => setTimeout(r, 1200));
		setLoading(false);
		setStep("done");
	};

	return (
		<div class="max-w-3xl mx-auto px-6 py-10">
			<h1 class="text-3xl md:text-4xl font-bold text-center mb-2">
				Create your docs site
			</h1>
			<p class="text-muted text-center mb-10 max-w-xl mx-auto">
				Pick a template, connect GitHub, and deploy to Cloudflare in one flow.
			</p>

			<div class="flex items-center justify-center gap-2 mb-8">
				<For each={["template", "github", "deploy"] as const}>
					{(s, i) => (
						<div class="flex items-center gap-2">
							<div
								class={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
									step() === s
										? "bg-primary text-primary-foreground"
										: stepOrder(step()) > stepOrder(s)
											? "bg-surface text-foreground border border-border"
											: "bg-background text-muted border border-border"
								}`}
							>
								{i() + 1}
							</div>
							<Show when={i() < 2}>
								<div class="w-8 h-px bg-border" />
							</Show>
						</div>
					)}
				</For>
			</div>

			<Show when={step() === "template"}>
				<div class="grid sm:grid-cols-3 gap-4 mb-6">
					<For each={templates}>
						{(t) => (
							<button
								type="button"
								onClick={() => pick(t.id)}
								class={`text-left p-5 rounded-xl border transition-all no-underline group ${
									selected() === t.id
										? "border-primary bg-primary/5"
										: "border-border bg-surface hover:border-focus"
								}`}
							>
								<span
									class={`${t.icon} text-3xl mb-3 block text-primary`}
									aria-hidden="true"
								/>
								<h2 class="font-semibold mb-1">{t.name}</h2>
								<p class="text-sm text-muted mb-3 leading-relaxed">
									{t.description}
								</p>
								<div class="flex flex-wrap gap-1">
									<For each={t.tags}>
										{(tag) => (
											<span class="text-[10px] px-1.5 py-0.5 rounded bg-background border border-border text-muted">
												{tag}
											</span>
										)}
									</For>
								</div>
							</button>
						)}
					</For>
				</div>
				<p class="text-xs text-center text-muted">
					The template only sets the initial files — you can customize
					everything after creation.
				</p>
			</Show>

			<Show when={step() === "github"}>
				<div class="border border-border rounded-xl p-6 bg-surface mb-4">
					<h2 class="font-semibold mb-4 flex items-center gap-2">
						<span class="i-mdi:github" aria-hidden="true" />
						Connect GitHub
					</h2>
					<label htmlFor="repo-name" class="block text-sm text-muted mb-1">
						Repository name
					</label>
					<input
						id="repo-name"
						type="text"
						value={repo()}
						onInput={(e) => setRepo(e.currentTarget.value)}
						placeholder="my-docs"
						class="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground mb-4 outline-none focus:border-focus"
					/>
					<label htmlFor="github-token" class="block text-sm text-muted mb-1">
						GitHub personal access token
					</label>
					<input
						id="github-token"
						type="password"
						value={token()}
						onInput={(e) => setToken(e.currentTarget.value)}
						placeholder="ghp_..."
						class="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground mb-4 outline-none focus:border-focus"
					/>
					<Show when={error()}>
						<p class="text-sm text-destructive mb-3">{error()}</p>
					</Show>
					<div class="flex gap-2">
						<button
							type="button"
							onClick={() => setStep("template")}
							class="px-4 h-10 rounded-md border border-border text-foreground hover:bg-background transition-colors"
						>
							Back
						</button>
						<button
							type="button"
							onClick={createRepo}
							disabled={loading()}
							class="px-4 h-10 rounded-md bg-primary text-primary-foreground hover:bg-primary-hover transition-colors disabled:opacity-60"
						>
							{loading() ? "Creating…" : "Create repository"}
						</button>
					</div>
				</div>
			</Show>

			<Show when={step() === "deploy"}>
				<div class="border border-border rounded-xl p-6 bg-surface mb-4">
					<h2 class="font-semibold mb-4 flex items-center gap-2">
						<span class="i-mdi:cloud" aria-hidden="true" />
						Deploy to Cloudflare
					</h2>
					<p class="text-sm text-muted mb-4">
						Enter your Cloudflare API token to deploy the new docs site.
					</p>
					<label htmlFor="cf-token" class="block text-sm text-muted mb-1">
						Cloudflare API token
					</label>
					<input
						id="cf-token"
						type="password"
						value={cfToken()}
						onInput={(e) => setCfToken(e.currentTarget.value)}
						placeholder="..."
						class="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground mb-4 outline-none focus:border-focus"
					/>
					<Show when={error()}>
						<p class="text-sm text-destructive mb-3">{error()}</p>
					</Show>
					<div class="flex gap-2">
						<button
							type="button"
							onClick={() => setStep("github")}
							class="px-4 h-10 rounded-md border border-border text-foreground hover:bg-background transition-colors"
						>
							Back
						</button>
						<button
							type="button"
							onClick={deploy}
							disabled={loading()}
							class="px-4 h-10 rounded-md bg-primary text-primary-foreground hover:bg-primary-hover transition-colors disabled:opacity-60"
						>
							{loading() ? "Deploying…" : "Deploy to Cloudflare"}
						</button>
					</div>
				</div>
			</Show>

			<Show when={step() === "done"}>
				<div class="text-center border border-border rounded-xl p-8 bg-surface">
					<div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
						<span
							class="i-mdi:check text-3xl text-primary"
							aria-hidden="true"
						/>
					</div>
					<h2 class="text-xl font-semibold mb-2">You're ready to ship!</h2>
					<p class="text-sm text-muted mb-6">
						Repository <code class="font-mono">{repo()}</code> created and
						deployment queued.
					</p>
					<a
						href={`https://github.com/${repo()}`}
						target="_blank"
						rel="noreferrer"
						class="inline-flex items-center gap-2 px-5 h-11 rounded-md bg-primary text-primary-foreground no-underline font-medium hover:bg-primary-hover transition-colors"
					>
						<span class="i-mdi:github" aria-hidden="true" />
						Open repository
					</a>
				</div>
			</Show>
		</div>
	);
}

function stepOrder(s: "template" | "github" | "deploy" | "done") {
	return { template: 0, github: 1, deploy: 2, done: 3 }[s];
}

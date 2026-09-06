interface Env {
	ASSETS: { fetch: (req: Request) => Promise<Response> };
	AI: {
		run: (
			model: string,
			input: Record<string, unknown>,
		) => Promise<{ response?: string }>;
	};
	GITHUB_TOKEN?: string;
	GITHUB_CLIENT_ID?: string;
	GITHUB_CLIENT_SECRET?: string;
}

const GITHUB_API_HEADERS: Record<string, string> = {
	Accept: "application/vnd.github+json",
	"X-GitHub-Api-Version": "2022-11-28",
	"User-Agent": "create-docs",
};

function json(data: unknown, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}

/** Prefer the caller's token; fall back to the worker secret. */
function githubAuth(request: Request, env: Env): string | null {
	return (
		request.headers.get("Authorization") ??
		(env.GITHUB_TOKEN ? `Bearer ${env.GITHUB_TOKEN}` : null)
	);
}

function toBase64(text: string): string {
	const bytes = new TextEncoder().encode(text);
	let bin = "";
	const chunk = 0x8000;
	for (let i = 0; i < bytes.length; i += chunk) {
		bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
	}
	return btoa(bin);
}

function handleOAuthStart(request: Request, env: Env): Response {
	if (!env.GITHUB_CLIENT_ID) {
		return json({ error: "GITHUB_CLIENT_ID not configured" }, 503);
	}
	const url = new URL(request.url);
	const redirectUri =
		url.searchParams.get("redirect_uri") ??
		`${url.origin}/auth/github/callback`;
	const state = url.searchParams.get("state") ?? "";
	const scope = url.searchParams.get("scope") ?? "repo";
	const auth = new URL("https://github.com/login/oauth/authorize");
	auth.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
	auth.searchParams.set("redirect_uri", redirectUri);
	auth.searchParams.set("scope", scope);
	if (state) auth.searchParams.set("state", state);
	return json({ url: auth.toString() });
}

async function handleOAuthToken(request: Request, env: Env): Promise<Response> {
	if (request.method !== "POST") {
		return new Response("Method not allowed", { status: 405 });
	}
	if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
		return json({ error: "GitHub OAuth is not configured" }, 503);
	}
	const { code, redirect_uri } = (await request.json().catch(() => ({}))) as {
		code?: string;
		redirect_uri?: string;
	};
	if (!code) return json({ error: "Missing code" }, 400);
	const res = await fetch("https://github.com/login/oauth/access_token", {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			"User-Agent": "create-docs",
		},
		body: JSON.stringify({
			client_id: env.GITHUB_CLIENT_ID,
			client_secret: env.GITHUB_CLIENT_SECRET,
			code,
			...(redirect_uri ? { redirect_uri } : {}),
		}),
	});
	const data = (await res.json().catch(() => ({}))) as {
		access_token?: string;
		error?: string;
		error_description?: string;
	};
	if (data.error || !data.access_token) {
		return json(
			{
				error: data.error_description ?? data.error ?? "Token exchange failed",
			},
			400,
		);
	}
	return json({ access_token: data.access_token });
}

async function handleDeploy(request: Request): Promise<Response> {
	if (request.method !== "POST") {
		return new Response("Method not allowed", { status: 405 });
	}
	const cfToken = request.headers
		.get("Authorization")
		?.replace(/^Bearer\s+/i, "");
	const {
		accountId,
		projectName,
		owner,
		repo,
		productionBranch = "main",
	} = (await request.json().catch(() => ({}))) as Record<string, string>;
	if (!cfToken) return json({ error: "Missing Cloudflare API token" }, 401);
	if (!accountId || !projectName) {
		return json({ error: "Missing accountId or projectName" }, 400);
	}

	const body: Record<string, unknown> = {
		name: projectName,
		production_branch: productionBranch,
	};
	if (owner && repo) {
		body.source = {
			type: "github",
			config: {
				owner,
				repo_name: repo,
				production_branch: productionBranch,
				pr_comments_enabled: true,
				deployments_enabled: true,
			},
		};
	}

	try {
		const res = await fetch(
			`https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${cfToken}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(body),
			},
		);
		const data = (await res.json().catch(() => ({}))) as {
			success?: boolean;
			errors?: { message?: string }[];
			result?: { name?: string; subdomain?: string };
		};
		if (!res.ok || data.success === false) {
			return json(
				{
					error: data.errors?.[0]?.message ?? `Cloudflare error ${res.status}`,
				},
				res.ok ? 400 : res.status,
			);
		}
		return json({
			ok: true,
			project: data.result?.name ?? projectName,
			url: data.result?.subdomain
				? `https://${data.result.subdomain}`
				: undefined,
		});
	} catch (e) {
		return json(
			{ error: e instanceof Error ? e.message : "Deploy error" },
			502,
		);
	}
}

interface DocEntry {
	collection: string;
	id: string;
	title: string;
	description: string;
	text: string;
	content: string;
}

let indexCache: { docs: DocEntry[] } | null = null;

async function loadIndex(env: Env): Promise<{ docs: DocEntry[] }> {
	if (indexCache) return indexCache;
	const res = await env.ASSETS.fetch(
		new Request("https://assets.local/search-index.json"),
	);
	if (!res.ok) {
		throw new Error("search-index.json not found");
	}
	indexCache = (await res.json()) as { docs: DocEntry[] };
	return indexCache;
}

async function handleGitHubProxy(
	request: Request,
	env: Env,
): Promise<Response> {
	const url = new URL(request.url);
	const path = url.pathname.slice("/api/github".length) + url.search;
	const headers: Record<string, string> = { ...GITHUB_API_HEADERS };
	const auth = githubAuth(request, env);
	if (auth) headers.Authorization = auth;
	const isRead = request.method === "GET" || request.method === "HEAD";
	try {
		const res = await fetch(`https://api.github.com${path}`, {
			method: request.method,
			headers,
			body: isRead ? undefined : request.body,
		});
		return new Response(res.body, {
			status: res.status,
			headers: {
				"Content-Type": res.headers.get("Content-Type") ?? "application/json",
				...(isRead ? { "Cache-Control": "public, max-age=60" } : {}),
			},
		});
	} catch (e) {
		const message = e instanceof Error ? e.message : "GitHub proxy error";
		return new Response(JSON.stringify({ error: message }), { status: 502 });
	}
}

async function handleAi(request: Request, env: Env): Promise<Response> {
	if (request.method !== "POST") {
		return new Response("Method not allowed", { status: 405 });
	}
	const { prompt } = (await request.json().catch(() => ({}))) as {
		prompt?: string;
	};
	if (!prompt) {
		return new Response(JSON.stringify({ error: "Missing prompt" }), {
			status: 400,
		});
	}
	try {
		const result = await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast", {
			prompt,
		});
		return new Response(JSON.stringify({ suggestion: result.response ?? "" }), {
			headers: { "Content-Type": "application/json" },
		});
	} catch (e) {
		const message = e instanceof Error ? e.message : "AI error";
		return new Response(JSON.stringify({ error: message }), { status: 500 });
	}
}

async function handleSave(request: Request, env: Env): Promise<Response> {
	if (request.method !== "POST") {
		return new Response("Method not allowed", { status: 405 });
	}
	const auth = githubAuth(request, env);
	if (!auth) {
		return json({ error: "GitHub credentials not configured" }, 503);
	}
	const {
		owner,
		repo,
		path: filePath,
		content,
		branch = "main",
		message,
	} = (await request.json().catch(() => ({}))) as Record<string, string>;
	if (!owner || !repo || !filePath || !content || !message) {
		return new Response(JSON.stringify({ error: "Missing required fields" }), {
			status: 400,
		});
	}

	try {
		const getRes = await fetch(
			`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`,
			{
				headers: { ...GITHUB_API_HEADERS, Authorization: auth },
			},
		);
		const existing = getRes.ok
			? ((await getRes.json()) as { sha: string })
			: null;

		const body = JSON.stringify({
			message,
			content: toBase64(content),
			branch,
			sha: existing?.sha,
		});

		const putRes = await fetch(
			`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
			{
				method: "PUT",
				headers: {
					...GITHUB_API_HEADERS,
					Authorization: auth,
					"Content-Type": "application/json",
				},
				body,
			},
		);

		if (!putRes.ok) {
			const text = await putRes.text();
			return new Response(JSON.stringify({ error: text }), {
				status: putRes.status,
			});
		}

		return new Response(JSON.stringify({ ok: true }), {
			headers: { "Content-Type": "application/json" },
		});
	} catch (e) {
		const msg = e instanceof Error ? e.message : "Save error";
		return new Response(JSON.stringify({ error: msg }), { status: 500 });
	}
}

async function handleMcp(request: Request, env: Env): Promise<Response> {
	if (request.method !== "POST") {
		return new Response("Method not allowed", { status: 405 });
	}
	const body = (await request.json().catch(() => ({}))) as {
		id?: unknown;
		method?: string;
		params?: Record<string, unknown>;
	};
	const { id = null, method, params = {} } = body;

	const reply = (result: unknown) =>
		new Response(JSON.stringify({ jsonrpc: "2.0", id, result }), {
			headers: { "Content-Type": "application/json" },
		});
	const rpcError = (code: number, message: string) =>
		new Response(
			JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } }),
			{ headers: { "Content-Type": "application/json" } },
		);

	if (method === "initialize") {
		return reply({
			protocolVersion: "2024-11-05",
			capabilities: { tools: {} },
			serverInfo: { name: "create-docs", version: "0.1.0" },
		});
	}
	if (method === "notifications/initialized" || method === "ping") {
		return reply({});
	}
	if (method === "tools/list") {
		return reply({
			tools: [
				{
					name: "search_docs",
					description: "Search documentation content",
					inputSchema: {
						type: "object",
						properties: {
							query: { type: "string", description: "Search query" },
							limit: {
								type: "number",
								description: "Max results",
								default: 5,
							},
						},
						required: ["query"],
					},
				},
				{
					name: "get_doc",
					description: "Get a document by collection and id",
					inputSchema: {
						type: "object",
						properties: {
							collection: { type: "string", description: "Collection id" },
							id: { type: "string", description: "Document id" },
						},
						required: ["collection", "id"],
					},
				},
			],
		});
	}
	if (method === "tools/call") {
		const name = params.name;
		const args = (params.arguments ?? {}) as Record<string, unknown>;
		const { docs } = await loadIndex(env);
		if (name === "search_docs") {
			const q = String(args.query ?? "").toLowerCase();
			const limit = Math.min(Number(args.limit ?? 5), 20);
			const results = docs
				.filter((d) =>
					[d.title, d.description, d.text].join(" ").toLowerCase().includes(q),
				)
				.slice(0, limit)
				.map((d) => ({
					collection: d.collection,
					id: d.id,
					title: d.title,
					description: d.description,
					snippet: d.text.slice(0, 200),
				}));
			return reply({
				content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
			});
		}
		if (name === "get_doc") {
			const doc = docs.find(
				(d) => d.collection === args.collection && d.id === args.id,
			);
			if (!doc) {
				return rpcError(-32602, "Document not found");
			}
			return reply({
				content: [{ type: "text", text: doc.content }],
			});
		}
		return rpcError(-32601, "Unknown tool");
	}
	return rpcError(-32601, "Method not found");
}

export default {
	async fetch(request: Request, env: Env) {
		const url = new URL(request.url);
		try {
			if (url.pathname === "/api/ai/suggest") {
				return handleAi(request, env);
			}
			if (url.pathname === "/api/content/save") {
				return handleSave(request, env);
			}
			if (url.pathname === "/api/github/auth") {
				return handleOAuthStart(request, env);
			}
			if (url.pathname === "/api/github/token") {
				return handleOAuthToken(request, env);
			}
			if (url.pathname === "/api/deploy") {
				return handleDeploy(request);
			}
			if (url.pathname.startsWith("/api/github")) {
				return handleGitHubProxy(request, env);
			}
			if (url.pathname === "/api/mcp" || url.pathname === "/mcp") {
				return handleMcp(request, env);
			}
			return await env.ASSETS.fetch(request);
		} catch (e) {
			const message = e instanceof Error ? e.message : "Unknown error";
			return new Response(`Not found: ${message}`, { status: 404 });
		}
	},
};

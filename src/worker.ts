interface Env {
	ASSETS: { fetch: (req: Request) => Promise<Response> };
	AI: { run: (model: string, input: Record<string, unknown>) => Promise<{ response?: string }> };
	GITHUB_TOKEN?: string;
}

async function handleAi(request: Request, env: Env): Promise<Response> {
	if (request.method !== "POST") {
		return new Response("Method not allowed", { status: 405 });
	}
	const { prompt } = (await request.json().catch(() => ({}))) as { prompt?: string };
	if (!prompt) {
		return new Response(JSON.stringify({ error: "Missing prompt" }), { status: 400 });
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
	if (!env.GITHUB_TOKEN) {
		return new Response(JSON.stringify({ error: "GITHUB_TOKEN not configured" }), { status: 503 });
	}
	const { owner, repo, path: filePath, content, branch = "main", message } = (await request.json().catch(() => ({}))) as Record<string, string>;
	if (!owner || !repo || !filePath || !content || !message) {
		return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
	}

	try {
		const getRes = await fetch(
			`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`,
			{
				headers: {
					Authorization: `Bearer ${env.GITHUB_TOKEN}`,
					Accept: "application/vnd.github+json",
					"X-GitHub-Api-Version": "2022-11-28",
				},
			},
		);
		const existing = getRes.ok ? (await getRes.json()) as { sha: string } : null;

		const body = JSON.stringify({
			message,
			content: btoa(content),
			branch,
			sha: existing?.sha,
		});

		const putRes = await fetch(
			`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
			{
				method: "PUT",
				headers: {
					Authorization: `Bearer ${env.GITHUB_TOKEN}`,
					Accept: "application/vnd.github+json",
					"X-GitHub-Api-Version": "2022-11-28",
					"Content-Type": "application/json",
				},
				body,
			},
		);

		if (!putRes.ok) {
			const text = await putRes.text();
			return new Response(JSON.stringify({ error: text }), { status: putRes.status });
		}

		return new Response(JSON.stringify({ ok: true }), {
			headers: { "Content-Type": "application/json" },
		});
	} catch (e) {
		const msg = e instanceof Error ? e.message : "Save error";
		return new Response(JSON.stringify({ error: msg }), { status: 500 });
	}
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
			return await env.ASSETS.fetch(request);
		} catch (e) {
			const message = e instanceof Error ? e.message : "Unknown error";
			return new Response(`Not found: ${message}`, { status: 404 });
		}
	},
};

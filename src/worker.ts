interface Env {
	ASSETS: { fetch: (req: Request) => Promise<Response> };
}

export default {
	async fetch(request: Request, env: Env) {
		try {
			return await env.ASSETS.fetch(request);
		} catch (e) {
			const message = e instanceof Error ? e.message : "Unknown error";
			return new Response(`Not found: ${message}`, { status: 404 });
		}
	},
};

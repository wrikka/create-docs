import { useNavigate } from "@tanstack/solid-router";
import { onMount } from "solid-js";
import { setGitHubToken } from "../components/GitHubAuth";

export function OAuthCallbackPage() {
	const navigate = useNavigate();

	onMount(async () => {
		const params = new URLSearchParams(window.location.search);
		const code = params.get("code");
		const state = params.get("state");
		const expected = sessionStorage.getItem("create-docs:oauth-state");
		const error = params.get("error");
		const errorDescription = params.get("error_description");

		if (error) {
			console.error("GitHub OAuth error:", error, errorDescription);
			navigate({ to: "/create" });
			return;
		}

		sessionStorage.removeItem("create-docs:oauth-state");

		if (!code || !state || state !== expected) {
			console.error("Invalid OAuth callback.");
			navigate({ to: "/create" });
			return;
		}

		try {
			const res = await fetch("/api/github/token", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ code }),
			});
			const data = (await res.json()) as {
				access_token?: string;
				error?: string;
				message?: string;
			};
			if (!res.ok || data.error || !data.access_token) {
				throw new Error(data.message ?? data.error ?? "Token exchange failed.");
			}
			setGitHubToken(data.access_token);
		} catch (e) {
			console.error("Token exchange error:", e);
		} finally {
			navigate({ to: "/create" });
		}
	});

	return (
		<div class="min-h-[70vh] flex flex-col items-center justify-center px-6 py-20 text-center">
			<span
				class="i-mdi:loading animate-spin text-3xl text-primary mb-4"
				aria-hidden="true"
			/>
			<h1 class="text-xl font-bold mb-2">Completing GitHub authorization…</h1>
			<p class="text-sm text-muted">You will be redirected in a moment.</p>
		</div>
	);
}

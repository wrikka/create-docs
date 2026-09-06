import { useNavigate } from "@tanstack/solid-router";
import { createSignal, onMount, Show } from "solid-js";
import { setGitHubToken } from "../components/GitHubAuth";

export function OAuthCallbackPage() {
	const navigate = useNavigate();
	const [error, setError] = createSignal("");

	onMount(async () => {
		const params = new URLSearchParams(window.location.search);
		const code = params.get("code");
		const state = params.get("state");
		const expected = sessionStorage.getItem("create-docs:oauth-state");
		const oauthError = params.get("error");
		const errorDescription = params.get("error_description");

		if (oauthError) {
			setError(errorDescription ?? oauthError);
			return;
		}

		sessionStorage.removeItem("create-docs:oauth-state");

		if (!code || !state || state !== expected) {
			setError("Invalid OAuth callback. Please try authorizing again.");
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
			navigate({ to: "/create" });
		} catch (e) {
			setError(e instanceof Error ? e.message : "Token exchange failed.");
		}
	});

	return (
		<div class="min-h-[70vh] flex flex-col items-center justify-center px-6 py-20 text-center">
			<Show
				when={!error()}
				fallback={
					<>
						<span
							class="i-mdi:alert-circle text-3xl text-destructive mb-4"
							aria-hidden="true"
						/>
						<h1 class="text-xl font-bold mb-2">Authorization failed</h1>
						<p class="text-sm text-muted mb-6">{error()}</p>
						<a
							href="/create"
							class="inline-flex items-center gap-2 px-4 h-10 rounded-md bg-primary text-primary-foreground no-underline font-medium"
						>
							Back to create
						</a>
					</>
				}
			>
				<span
					class="i-mdi:loading animate-spin text-3xl text-primary mb-4"
					aria-hidden="true"
				/>
				<h1 class="text-xl font-bold mb-2">Completing GitHub authorization…</h1>
				<p class="text-sm text-muted">You will be redirected in a moment.</p>
			</Show>
		</div>
	);
}

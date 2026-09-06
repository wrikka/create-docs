import { createSignal, onMount, Show } from "solid-js";
import { useDocs } from "../context";

const STORAGE_KEY = "create-docs:github-token";

export function getGitHubToken(): string | null {
	if (typeof window === "undefined") return null;
	return localStorage.getItem(STORAGE_KEY);
}

export function setGitHubToken(token: string) {
	if (typeof window === "undefined") return;
	localStorage.setItem(STORAGE_KEY, token);
}

export function clearGitHubToken() {
	if (typeof window === "undefined") return;
	localStorage.removeItem(STORAGE_KEY);
}

export function GitHubAuthButton(props: {
	onToken?: (token: string) => void;
	label?: string;
	scope?: string;
}) {
	const config = useDocs();
	const [loading, setLoading] = createSignal(false);
	const [error, setError] = createSignal("");

	onMount(() => {
		const existing = getGitHubToken();
		if (existing) props.onToken?.(existing);
	});

	const oauth = () => config.github?.oauth;
	const disabled = () => oauth()?.enabled === false || loading();

	const startOAuth = async () => {
		const cfg = oauth();
		if (!cfg || cfg.enabled === false) {
			setError("GitHub OAuth is not configured.");
			return;
		}
		setLoading(true);
		setError("");
		try {
			const redirectUri =
				cfg.redirectUri ?? `${location.origin}/auth/github/callback`;
			const state = crypto.randomUUID();
			sessionStorage.setItem("create-docs:oauth-state", state);
			const res = await fetch(
				`/api/github/auth?redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(props.scope ?? cfg.scope ?? "repo")}`,
			);
			const data = (await res.json()) as { url?: string; error?: string };
			if (!res.ok || data.error) {
				throw new Error(data.error ?? "Failed to start OAuth.");
			}
			if (data.url) location.href = data.url;
		} catch (e) {
			setError(e instanceof Error ? e.message : "OAuth start failed.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div class="space-y-2">
			<button
				type="button"
				onClick={startOAuth}
				disabled={disabled()}
				class="inline-flex items-center gap-2 px-4 h-10 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
			>
				<span class="i-mdi:github" aria-hidden="true" />
				{loading() ? "Redirecting…" : (props.label ?? "Authorize with GitHub")}
			</button>
			<Show when={error()}>
				<p class="text-sm text-destructive m-0">{error()}</p>
			</Show>
		</div>
	);
}

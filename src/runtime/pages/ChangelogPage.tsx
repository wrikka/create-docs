import { createResource, For, Show } from "solid-js";
import { useDocs } from "../context";
import { fetchReleases } from "../github";

function formatDate(iso: string) {
	try {
		return new Date(iso).toLocaleDateString(undefined, {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	} catch {
		return iso;
	}
}

export function ChangelogPage() {
	const config = useDocs();
	const github = () => config.github;

	const [releases] = createResource(
		() => (github()?.releases ? github() : undefined),
		async (cfg) => {
			if (!cfg) return [];
			return fetchReleases(cfg);
		},
	);

	const bodyHtml = (body: string | null) => {
		if (!body) return "No release notes.";
		const escaped = body
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;");
		return escaped.replace(/\r\n/g, "\n").replace(/\n/g, "<br />");
	};

	return (
		<div class="max-w-3xl mx-auto px-6 py-8">
			<h1 class="text-3xl font-bold mb-2">Changelog</h1>
			<p class="text-muted mb-8">Releases from GitHub</p>
			<Show when={releases.loading}>
				<p class="text-muted">Loading releases…</p>
			</Show>
			<Show when={!releases.loading && (releases() ?? []).length === 0}>
				<p class="text-muted">No releases found.</p>
			</Show>
			<div class="space-y-6">
				<For each={releases() ?? []}>
					{(release) => (
						<article class="border border-border rounded-lg p-5">
							<div class="flex items-center gap-2 mb-2">
								<h2 class="text-xl font-semibold">
									<a
										href={release.html_url}
										target="_blank"
										rel="noreferrer"
										class="hover:text-primary transition-colors"
									>
										{release.name || release.tag_name}
									</a>
								</h2>
								<span class="text-xs text-muted ml-auto">
									{formatDate(release.published_at)}
								</span>
							</div>
							<div
								class="rt-markdown text-sm"
								innerHTML={bodyHtml(release.body)}
							/>
						</article>
					)}
				</For>
			</div>
		</div>
	);
}

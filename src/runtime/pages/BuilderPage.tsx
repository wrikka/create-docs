import { createSignal, For } from "solid-js";
import { DocMarkdown } from "../components/DocMarkdown";

type Block = { id: string; label: string; markdown: (title: string) => string };

const blocks: Block[] = [
	{
		id: "hero",
		label: "Hero",
		markdown: (t) => `---\nlayout: page\n---\n\n# ${t}\n\nA generated page.`,
	},
	{
		id: "features",
		label: "Feature grid",
		markdown: () => `<card-grid>\n<card title="Fast" icon="i-mdi:lightning-bolt">Fast docs</card>\n<card title="Pluggable" icon="i-mdi:puzzle">Pluggable data sources</card>\n</card-grid>`,
	},
	{
		id: "code",
		label: "Code block",
		markdown: () => "```ts\nconst app = mountDocsApp();\n```",
	},
	{
		id: "faq",
		label: "FAQ",
		markdown: () => `<accordion>\n<item title="Q1?">A1</item>\n</accordion>`,
	},
];

export function BuilderPage() {
	const [title, setTitle] = createSignal("My Page");
	const [active, setActive] = createSignal<string[]>(["hero", "features"]);
	const [copyText, setCopyText] = createSignal("");

	const markdown = () => {
		const parts = [`---\nlayout: page\n---\n\n# ${title()}\n`];
		for (const id of active()) {
			const block = blocks.find((b) => b.id === id);
			if (block) parts.push(block.markdown(title()));
		}
		return parts.join("\n\n");
	};

	const move = (i: number, dir: number) => {
		const arr = [...active()];
		const j = i + dir;
		if (j < 0 || j >= arr.length) return;
		[arr[i], arr[j]] = [arr[j], arr[i]];
		setActive(arr);
	};

	const remove = (i: number) => setActive(active().filter((_, idx) => idx !== i));
	const add = (id: string) => setActive([...active(), id]);

	const copy = async () => {
		await navigator.clipboard.writeText(markdown());
		setCopyText("Copied!");
		setTimeout(() => setCopyText(""), 1500);
	};

	return (
		<div class="max-w-6xl mx-auto px-6 py-8">
			<h1 class="text-2xl font-semibold text-foreground mb-6">Visual Page Builder</h1>
			<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div class="space-y-4">
					<div class="p-4 rounded-md border border-border bg-surface">
						<div class="text-sm text-muted mb-1">Page title</div>
						<input
							type="text"
							value={title()}
							onInput={(e) => setTitle(e.currentTarget.value)}
							class="w-full px-3 py-2 rounded-md border border-border bg-background text-sm text-foreground outline-none focus:border-focus"
						/>
					</div>
					<div class="p-4 rounded-md border border-border bg-surface">
						<div class="text-sm font-medium text-foreground mb-2">Add blocks</div>
						<div class="flex flex-wrap gap-2">
							<For each={blocks}>
								{(b) => (
									<button
										type="button"
										onClick={() => add(b.id)}
										class="px-2.5 h-8 rounded-md border border-border text-xs text-muted hover:text-foreground hover:bg-background transition-colors"
									>
										{b.label}
									</button>
								)}
							</For>
						</div>
					</div>
					<div class="p-4 rounded-md border border-border bg-surface">
						<div class="text-sm font-medium text-foreground mb-2">Blocks</div>
						<For each={active()}>
							{(id, i) => {
								const label = () => blocks.find((b) => b.id === id)?.label ?? id;
								return (
									<div class="flex items-center gap-2 py-1.5">
										<span class="text-sm text-foreground flex-1">{label()}</span>
										<button
											type="button"
											onClick={() => move(i(), -1)}
											class="w-7 h-7 inline-flex items-center justify-center rounded-md border border-border text-muted hover:text-foreground hover:bg-background"
										>
											<span class="i-mdi:arrow-up" aria-hidden="true" />
										</button>
										<button
											type="button"
											onClick={() => move(i(), 1)}
											class="w-7 h-7 inline-flex items-center justify-center rounded-md border border-border text-muted hover:text-foreground hover:bg-background"
										>
											<span class="i-mdi:arrow-down" aria-hidden="true" />
										</button>
										<button
											type="button"
											onClick={() => remove(i())}
											class="w-7 h-7 inline-flex items-center justify-center rounded-md border border-border text-destructive hover:bg-background"
										>
											<span class="i-mdi:close" aria-hidden="true" />
										</button>
									</div>
								);
							}}
						</For>
						<div class="mt-4 flex gap-2">
							<button
								type="button"
								onClick={copy}
								class="inline-flex items-center gap-1.5 px-3 h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover transition-colors"
							>
								<span class="i-mdi:content-copy" aria-hidden="true" />
								{copyText() || "Copy markdown"}
							</button>
						</div>
					</div>
				</div>
				<div class="lg:col-span-2 rounded-md border border-border bg-bg p-6 min-h-[60vh]">
					<DocMarkdown source={markdown()} />
				</div>
			</div>
		</div>
	);
}

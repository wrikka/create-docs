import { useNavigate, useParams, useSearch } from "@tanstack/solid-router";
import { createResource, createSignal, Show } from "solid-js";
import { DocMarkdown } from "../components/DocMarkdown";
import { useDocs } from "../context";

export function AbTestPage() {
	const params = useParams({ strict: false });
	const search = useSearch({ strict: false });
	const navigate = useNavigate();
	const config = useDocs();
	const dataSource = config.dataSource;
	const collection = () => params().collection ?? "docs";
	const baseId = () => params().docId ?? "index";

	const variant = () =>
		(search().v as string) ?? (Math.random() > 0.5 ? "a" : "b");
	const [v, setV] = createSignal(variant());

	const docId = () => `${baseId()}-${v()}`;

	const [doc] = createResource(
		() => ({ collection: collection(), id: docId() }),
		async ({ collection, id }) => {
			try {
				return await dataSource.get(collection, id);
			} catch {
				return { content: `> Variant ${v().toUpperCase()} not found for **${baseId()}**.\n\nCreate \`${baseId()}-a.md\` and \`${baseId()}-b.md\`.` };
			}
		},
	);

	const [converted, setConverted] = createSignal(false);

	const record = (action: string) => {
		const key = `ab:${baseId()}:${v()}:${action}`;
		const count = Number(localStorage.getItem(key) ?? 0) + 1;
		localStorage.setItem(key, String(count));
	};

	const switchVariant = () => {
		const next = v() === "a" ? "b" : "a";
		setV(next);
		navigate({
			to: "/ab/$collection/$docId",
			params: { collection: collection(), docId: baseId() },
			search: { v: next },
		});
	};

	const convert = () => {
		setConverted(true);
		record("convert");
	};

	return (
		<div class="max-w-4xl mx-auto px-6 py-8">
			<div class="flex items-center gap-3 mb-6">
				<span class="px-2 py-1 text-xs font-medium rounded-full border border-border text-muted">
					Variant {v().toUpperCase()}
				</span>
				<button
					type="button"
					onClick={switchVariant}
					class="inline-flex items-center gap-1.5 px-3 h-8 rounded-md border border-border text-xs text-muted hover:text-foreground hover:bg-surface transition-colors bg-transparent"
				>
					<span class="i-mdi:swap-horizontal" aria-hidden="true" />
					Switch variant
				</button>
				<button
					type="button"
					onClick={convert}
					class="inline-flex items-center gap-1.5 px-3 h-8 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary-hover transition-colors"
				>
					<span class="i-mdi:check" aria-hidden="true" />
					Convert
				</button>
				<Show when={converted()}>
					<span class="text-xs text-success">Recorded conversion</span>
				</Show>
			</div>
			<Show when={doc()} fallback={<p class="text-muted">Loading variant…</p>}>
				{(d) => <DocMarkdown source={d().content} />}
			</Show>
		</div>
	);
}

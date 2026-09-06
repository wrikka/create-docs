import { Link } from "@tanstack/solid-router";
import { useDocs } from "../context";
import { useCollections } from "../data";

export function Breadcrumbs(props: {
	collection: string;
	category: string;
	label: string;
}) {
	const collections = useCollections();
	const config = useDocs();
	const collectionMeta = () =>
		collections()?.find((c) => c.id === props.collection);

	return (
		<nav
			aria-label="Breadcrumbs"
			class="flex items-center gap-1.5 text-xs text-muted pb-3"
		>
			<Link to="/" class="hover:text-foreground transition-colors">
				{config.site.title}
			</Link>
			<span class="i-mdi:chevron-right" aria-hidden="true" />
			<Link
				to={`/${props.collection}`}
				class="hover:text-foreground transition-colors inline-flex items-center gap-1"
			>
				<span
					class={collectionMeta()?.icon ?? "i-mdi:folder-outline"}
					aria-hidden="true"
				/>
				<span>{collectionMeta()?.label ?? props.collection}</span>
			</Link>
			<span class="i-mdi:chevron-right" aria-hidden="true" />
			<span>{props.category}</span>
			<span class="i-mdi:chevron-right" aria-hidden="true" />
			<span class="text-foreground font-medium truncate max-w-[16rem]">
				{props.label}
			</span>
		</nav>
	);
}

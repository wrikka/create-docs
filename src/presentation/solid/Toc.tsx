/**
 * Solid TOC Component
 *
 * Table of contents component for Solid
 */

import { For, Show } from "solid-js";
import type { TocItem } from "../../modules/toc-generator";

export interface TocProps {
	/** TOC items */
	items: TocItem[];
	/** Active item ID */
	activeId?: string;
	/** On item click */
	onItemClick?: (id: string) => void;
	/** Max depth to show */
	maxDepth?: number;
}

export const Toc = (props: TocProps) => {
	const renderItem = (item: TocItem, depth = 0) => {
		if (depth >= (props.maxDepth || 6)) return null;

		const isActive = () => props.activeId === item.id;
		const hasChildren = () => item.children && item.children.length > 0;

		return (
			<li class={`toc-item toc-level-${item.level}`}>
				<a
					href={`#${item.id}`}
					class={`toc-link ${isActive() ? "toc-link-active" : ""}`}
					onClick={(e) => {
						e.preventDefault();
						props.onItemClick?.(item.id);
					}}
				>
					{item.text}
				</a>
				<Show when={hasChildren()}>
					<ul class="toc-children">
						<For each={item.children}>
							{(child) => <>{renderItem(child, depth + 1)}</>}
						</For>
					</ul>
				</Show>
			</li>
		);
	};

	return (
		<nav class="toc">
			<ul class="toc-list">
				<For each={props.items}>{(item) => <>{renderItem(item)}</>}</For>
			</ul>
		</nav>
	);
};

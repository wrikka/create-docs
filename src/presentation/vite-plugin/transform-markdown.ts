/**
 * Pure transformation: turn a markdown file path → Svelte source code.
 * No I/O, no exceptions. The `parse` from comark is injected so this
 * function is fully testable.
 */
import { parseFrontmatter } from "@create-docs/modules/content";

export type MarkdownToSvelte = (
	raw: string,
	deps: {
		readonly parse: (content: string) => Promise<unknown>;
	},
) => Promise<string>;

export const transformMarkdown: MarkdownToSvelte = async (raw, { parse }) => {
	const { frontmatter, content } = parseFrontmatter(raw);
	const tree = await parse(content);
	const fmJson = JSON.stringify(frontmatter);
	const contentJson = JSON.stringify(content);
	const treeJson = JSON.stringify(tree);
	return `<script lang="ts">
		export const frontmatter = ${fmJson};
		export const content = ${contentJson};
		export const tree = ${treeJson};
	</script>`;
};

import { createStaticDataSource } from "@wrikka/create-docs/solid";

const guideFiles = import.meta.glob("../docs/**/*.{md,yml,yaml}", {
	query: "?raw",
	import: "default",
	eager: true,
}) as Record<string, string>;

const apiFiles = import.meta.glob("../api/**/*.{md,yml,yaml}", {
	query: "?raw",
	import: "default",
	eager: true,
}) as Record<string, string>;

const showcaseFiles = import.meta.glob("../showcase/**/*.{md,yml,yaml}", {
	query: "?raw",
	import: "default",
	eager: true,
}) as Record<string, string>;

export const dataSource = createStaticDataSource({
	collections: [
		{
			meta: {
				id: "docs",
				label: "Docs",
				icon: "i-mdi:book-open-page-variant",
				description: "create-docs guide",
				sections: [
					{
						id: "Guide",
						label: "Guide",
						icon: "i-mdi:compass-outline",
						order: 0,
					},
					{
						id: "Features",
						label: "Features",
						icon: "i-mdi:star-outline",
						order: 1,
					},
					{
						id: "Reference",
						label: "Reference",
						icon: "i-mdi:book-outline",
						order: 2,
					},
				],
			},
			files: guideFiles,
		},
		{
			meta: {
				id: "api",
				label: "API",
				icon: "i-mdi:code-json",
				description: "Runtime and plugin API reference",
			},
			files: apiFiles,
		},
		{
			meta: {
				id: "showcase",
				label: "Showcase",
				icon: "i-mdi:view-dashboard",
				description: "UI components and layout showcase",
			},
			files: showcaseFiles,
		},
	],
	drafts: true,
});

import {
	createCompositeDataSource,
	createStaticDataSource,
} from "@wrikka/create-docs/solid";

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

export const dataSource = createCompositeDataSource([
	createStaticDataSource({
		meta: {
			id: "docs",
			label: "Docs",
			icon: "i-mdi:book-open-page-variant",
			description: "create-docs guide",
		},
		files: guideFiles,
		drafts: true,
	}),
	createStaticDataSource({
		meta: {
			id: "api",
			label: "API",
			icon: "i-mdi:code-json",
			description: "Runtime and plugin API reference",
		},
		files: apiFiles,
		drafts: true,
	}),
	createStaticDataSource({
		meta: {
			id: "showcase",
			label: "Showcase",
			icon: "i-mdi:view-dashboard",
			description: "UI components and layout showcase",
		},
		files: showcaseFiles,
		drafts: true,
	}),
]);

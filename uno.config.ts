import {
	defineConfig,
	presetIcons,
	presetWind4,
	transformerDirectives,
	transformerVariantGroup,
} from "unocss";

export default defineConfig({
	presets: [
		presetWind4({
			preflights: { reset: true, theme: "on-demand", property: true },
			dark: "class",
		}),
		presetIcons({
			scale: 1.1,
			collections: {
				mdi: () =>
					import("@iconify-json/mdi/icons.json").then((i) => i.default),
			},
		}),
	],
	transformers: [transformerVariantGroup(), transformerDirectives()],
	theme: {
		colors: {
			primary: {
				DEFAULT: "hsl(var(--color-primary))",
				hover: "hsl(var(--color-primary-hover))",
				active: "hsl(var(--color-primary-active))",
				foreground: "hsl(var(--color-primary-foreground))",
			},
			secondary: "hsl(var(--color-secondary))",
			success: "hsl(var(--color-success))",
			warning: "hsl(var(--color-warning))",
			destructive: "hsl(var(--color-destructive))",
			background: "hsl(var(--color-background))",
			foreground: "hsl(var(--color-foreground))",
			surface: "hsl(var(--color-surface))",
			muted: "hsl(var(--color-muted))",
			accent: "hsl(var(--color-accent))",
			border: "hsl(var(--color-border))",
			focus: "hsl(var(--color-focus))",
			overlay: "hsl(var(--color-overlay))",
			skeleton: "hsl(var(--color-skeleton))",
		},
	},
	content: {
		filesystem: [
			"./dev/index.html",
			"./dev/**/*.{ts,tsx,html}",
			"./src/runtime/**/*.{ts,tsx}",
		],
	},
});

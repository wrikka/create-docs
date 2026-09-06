import { useTheme } from "../theme";

export function ThemeToggle() {
	const { theme, toggle } = useTheme();

	return (
		<button
			type="button"
			onClick={toggle}
			aria-label={
				theme() === "dark" ? "Switch to light mode" : "Switch to dark mode"
			}
			title={
				theme() === "dark" ? "Switch to light mode" : "Switch to dark mode"
			}
			class="w-9 h-9 inline-flex items-center justify-center rounded-md border border-border text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
		>
			<span
				class={
					theme() === "dark" ? "i-mdi:weather-sunny" : "i-mdi:weather-night"
				}
				aria-hidden="true"
			/>
		</button>
	);
}

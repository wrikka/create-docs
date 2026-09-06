import { createEffect, createSignal } from "solid-js";

type Theme = "dark" | "light";

const stored = globalThis.localStorage?.getItem("theme");
const initial: Theme = stored === "light" ? "light" : "dark";

const [theme, setThemeSignal] = createSignal<Theme>(initial);

/** Apply the stored/default theme before render (call at app bootstrap). */
export function initTheme(defaultMode: Theme = "dark"): void {
	const value = stored === "light" || stored === "dark" ? stored : defaultMode;
	document.documentElement.classList.toggle("dark", value === "dark");
}

export function useTheme() {
	createEffect(() => {
		const value = theme();
		document.documentElement.classList.toggle("dark", value === "dark");
		globalThis.localStorage?.setItem("theme", value);
	});

	const toggle = () => setThemeSignal((t) => (t === "dark" ? "light" : "dark"));

	return { theme, toggle };
}

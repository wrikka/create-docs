import { createEffect, createSignal } from "solid-js";

type Theme = "dark" | "light";

const stored = globalThis.localStorage?.getItem("theme");
const initial: Theme = stored === "light" ? "light" : "dark";

const [theme, setThemeSignal] = createSignal<Theme>(initial);

/** A daily accent — one per weekday (index 0 = Sunday). */
export interface DailyAccent {
	name: string;
	day: string;
	/** Primary HSL triples */
	light: string;
	lightHover: string;
	lightActive: string;
	dark: string;
	darkHover: string;
	darkActive: string;
	/** Foreground on the accent */
	lightFg: string;
	darkFg: string;
	/** Legacy content-accent hex values used by markdown content. */
	rtLight: string;
	rtDark: string;
	/** Swatch hex shown in the accent picker. */
	swatch: string;
}

export const DAILY_ACCENTS: DailyAccent[] = [
	{
		name: "Sunday Red",
		day: "Sun",
		light: "0 72% 45%",
		lightHover: "0 72% 38%",
		lightActive: "0 72% 32%",
		dark: "0 90% 68%",
		darkHover: "0 90% 60%",
		darkActive: "0 90% 54%",
		lightFg: "0 0% 100%",
		darkFg: "0 60% 10%",
		rtLight: "#c81e1e",
		rtDark: "#ff7b72",
		swatch: "#e5484d",
	},
	{
		name: "Monday Amber",
		day: "Mon",
		light: "28 95% 42%",
		lightHover: "28 95% 36%",
		lightActive: "28 95% 30%",
		dark: "38 95% 60%",
		darkHover: "38 95% 54%",
		darkActive: "38 95% 48%",
		lightFg: "0 0% 100%",
		darkFg: "30 80% 10%",
		rtLight: "#d97706",
		rtDark: "#fbbf24",
		swatch: "#f59e0b",
	},
	{
		name: "Tuesday Green",
		day: "Tue",
		light: "142 60% 40%",
		lightHover: "142 60% 34%",
		lightActive: "142 60% 28%",
		dark: "140 60% 66%",
		darkHover: "140 60% 58%",
		darkActive: "140 60% 50%",
		lightFg: "0 0% 100%",
		darkFg: "140 60% 10%",
		rtLight: "#2ea043",
		rtDark: "#7ee787",
		swatch: "#3fb950",
	},
	{
		name: "Wednesday Teal",
		day: "Wed",
		light: "188 85% 38%",
		lightHover: "188 85% 32%",
		lightActive: "188 85% 26%",
		dark: "187 80% 62%",
		darkHover: "187 80% 55%",
		darkActive: "187 80% 48%",
		lightFg: "0 0% 100%",
		darkFg: "190 80% 10%",
		rtLight: "#0e8a9c",
		rtDark: "#56d4dd",
		swatch: "#14b8c4",
	},
	{
		name: "Thursday Blue",
		day: "Thu",
		light: "217 91% 52%",
		lightHover: "217 91% 45%",
		lightActive: "217 91% 38%",
		dark: "207 100% 67%",
		darkHover: "207 100% 60%",
		darkActive: "207 100% 53%",
		lightFg: "0 0% 100%",
		darkFg: "217 80% 10%",
		rtLight: "#1f6feb",
		rtDark: "#56b6ff",
		swatch: "#3b82f6",
	},
	{
		name: "Friday Violet",
		day: "Fri",
		light: "262 78% 50%",
		lightHover: "262 78% 43%",
		lightActive: "262 78% 36%",
		dark: "263 85% 72%",
		darkHover: "263 85% 64%",
		darkActive: "263 85% 56%",
		lightFg: "0 0% 100%",
		darkFg: "262 70% 12%",
		rtLight: "#7c3aed",
		rtDark: "#a78bfa",
		swatch: "#8b5cf6",
	},
	{
		name: "Saturday Pink",
		day: "Sat",
		light: "330 78% 46%",
		lightHover: "330 78% 40%",
		lightActive: "330 78% 33%",
		dark: "330 85% 70%",
		darkHover: "330 85% 62%",
		darkActive: "330 85% 55%",
		lightFg: "0 0% 100%",
		darkFg: "330 70% 12%",
		rtLight: "#d61f8c",
		rtDark: "#f471b5",
		swatch: "#ec4899",
	},
];

export type AccentSetting = "auto" | number;

const ACCENT_KEY = "create-docs:accent";
const storedAccent = globalThis.localStorage?.getItem(ACCENT_KEY);
const initialAccent: AccentSetting =
	storedAccent == null || storedAccent === "auto"
		? "auto"
		: Math.min(
				Math.max(Number(storedAccent) || 0, 0),
				DAILY_ACCENTS.length - 1,
			);

const [accentSetting, setAccentSignal] =
	createSignal<AccentSetting>(initialAccent);

/** Resolved accent index — "auto" maps to today's weekday. */
export function accentIndex(setting?: AccentSetting): number {
	const s = setting ?? accentSetting();
	if (s === "auto") return new Date().getDay();
	return s;
}

function applyAccent() {
	const root = document.documentElement;
	const isDark = root.classList.contains("dark");
	const a = DAILY_ACCENTS[accentIndex()];
	root.style.setProperty("--color-primary", isDark ? a.dark : a.light);
	root.style.setProperty(
		"--color-primary-hover",
		isDark ? a.darkHover : a.lightHover,
	);
	root.style.setProperty(
		"--color-primary-active",
		isDark ? a.darkActive : a.lightActive,
	);
	root.style.setProperty(
		"--color-primary-foreground",
		isDark ? a.darkFg : a.lightFg,
	);
	root.style.setProperty("--color-focus", isDark ? a.dark : a.light);
	root.style.setProperty("--rt-accent", isDark ? a.rtDark : a.rtLight);
	root.style.setProperty("--rt-border-focus", isDark ? a.rtDark : a.rtLight);
}

export function setAccent(next: AccentSetting) {
	setAccentSignal(next);
	globalThis.localStorage?.setItem(ACCENT_KEY, String(next));
}

/** Apply the stored/default theme + daily accent before render. */
export function initTheme(defaultMode: Theme = "dark"): void {
	const value = stored === "light" || stored === "dark" ? stored : defaultMode;
	document.documentElement.classList.toggle("dark", value === "dark");
	applyAccent();
}

export function setTheme(next: Theme) {
	setThemeSignal(next);
}

export function useTheme() {
	createEffect(() => {
		const value = theme();
		document.documentElement.classList.toggle("dark", value === "dark");
		globalThis.localStorage?.setItem("theme", value);
		applyAccent();
	});

	const toggle = () => setThemeSignal((t) => (t === "dark" ? "light" : "dark"));

	return { theme, toggle };
}

/** Accent picker state — auto follows the weekday, or pin a fixed color. */
export function useAccent() {
	createEffect(() => {
		accentSetting();
		applyAccent();
	});
	return {
		accent: accentSetting,
		accentIndex: () => accentIndex(),
		accents: DAILY_ACCENTS,
		setAccent,
	};
}

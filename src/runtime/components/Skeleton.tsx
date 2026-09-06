import { For } from "solid-js";

export function SkeletonText(props: { lines?: number; class?: string }) {
	const lines = () => props.lines ?? 1;
	return (
		<div class={`flex flex-col gap-2 ${props.class ?? ""}`}>
			<For each={Array.from({ length: lines() })}>
				{(_, i) => (
					<div
						class="h-4 rounded bg-skeleton animate-pulse"
						style={{
							width: i() === lines() - 1 ? "80%" : "100%",
						}}
					/>
				)}
			</For>
		</div>
	);
}

export function SkeletonBlock(props: { class?: string }) {
	return (
		<div
			class={`rounded bg-skeleton animate-pulse ${props.class ?? ""}`}
			aria-busy="true"
		/>
	);
}

export function SkeletonPage() {
	return (
		<div class="space-y-6 p-1" aria-busy="true">
			<SkeletonBlock class="h-8 w-2/3" />
			<SkeletonText lines={4} />
			<SkeletonBlock class="h-40 w-full" />
			<SkeletonText lines={6} />
		</div>
	);
}

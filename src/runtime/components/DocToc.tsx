import {
	createEffect,
	createResource,
	createSignal,
	For,
	onCleanup,
	onMount,
	Show,
} from "solid-js";

interface TocLink {
	id: string;
	text: string;
	depth: number;
	children?: TocLink[];
}

async function parseToc(source: string): Promise<TocLink[]> {
	const [{ parseMarkdown }, { default: toc }] = await Promise.all([
		import("comark"),
		import("@comark/html/plugins/toc"),
	]);
	const result = await parseMarkdown(source, {
		plugins: [toc({ depth: 3, searchDepth: 3 })],
	});
	return result.meta?.toc?.links ?? [];
}

function collectIds(links: TocLink[]): string[] {
	const out: string[] = [];
	for (const l of links) {
		out.push(l.id);
		if (l.children) out.push(...collectIds(l.children));
	}
	return out;
}

function TocLinkItem(props: {
	link: TocLink;
	activeId?: string;
	onClick: (id: string) => void;
}) {
	const isActive = () => props.activeId === props.link.id;
	return (
		<li class={`rt-toc__item rt-toc__item--depth-${props.link.depth}`}>
			<button
				type="button"
				class={`rt-toc__link ${isActive() ? "rt-toc__link--active" : ""}`}
				onClick={() => props.onClick(props.link.id)}
				aria-label={`Jump to ${props.link.text}`}
				aria-current={isActive() ? "location" : undefined}
			>
				{props.link.text}
			</button>
			<Show when={props.link.children?.length}>
				<ul class="rt-toc__list">
					<For each={props.link.children}>
						{(child) => (
							<TocLinkItem
								link={child}
								activeId={props.activeId}
								onClick={props.onClick}
							/>
						)}
					</For>
				</ul>
			</Show>
		</li>
	);
}

export function DocToc(props: { source: string }) {
	const [toc] = createResource(() => props.source, parseToc);
	const [activeId, setActiveId] = createSignal<string | undefined>();
	const [progress, setProgress] = createSignal(0);
	let listRef: HTMLUListElement | undefined;

	const scrollTo = (id: string) => {
		const el = document.getElementById(id);
		if (!el) return;
		el.scrollIntoView({ behavior: "smooth", block: "start" });
		setActiveId(id);
	};

	createEffect(() => {
		const ids = collectIds(toc() ?? []);
		if (ids.length === 0) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((e) => e.isIntersecting)
					.map((e) => e.target.id);
				if (visible.length) {
					setActiveId(visible[0]);
				}
			},
			{ rootMargin: "-15% 0px -60% 0px", threshold: 0 },
		);

		for (const id of ids) {
			const el = document.getElementById(id);
			if (el) observer.observe(el);
		}

		onCleanup(() => observer.disconnect());
	});

	onMount(() => {
		const onScroll = () => {
			const st = window.scrollY;
			const docH = document.documentElement.scrollHeight - window.innerHeight;
			const pct = docH <= 0 ? 0 : Math.min(100, Math.max(0, (st / docH) * 100));
			setProgress(pct);
		};
		window.addEventListener("scroll", onScroll, { passive: true });
		onCleanup(() => window.removeEventListener("scroll", onScroll));
	});

	createEffect(() => {
		const id = activeId();
		if (!id || !listRef) return;
		const activeBtn = listRef.querySelector(
			`button[aria-current="location"]`,
		) as HTMLElement | null;
		if (activeBtn) {
			activeBtn.scrollIntoView({ behavior: "smooth", block: "nearest" });
		}
	});

	return (
		<nav aria-label="On this page" class="rt-toc">
			<div class="sticky top-0 bg-background z-10 pb-2 border-b border-border mb-2">
				<div class="rt-toc__title flex items-center justify-between">
					<span>On this page</span>
					<span class="text-xs text-muted">{progress()}%</span>
				</div>
				<div class="h-1 w-full bg-muted/20 rounded-full overflow-hidden mt-1.5">
					<div
						class="h-full bg-primary transition-[width]"
						style={{ width: `${progress()}%` }}
						aria-hidden="true"
					/>
				</div>
			</div>
			<Show
				when={!toc.loading && (toc() ?? []).length > 0}
				fallback={<div class="rt-toc__empty">No headings</div>}
			>
				<ul
					class="rt-toc__list max-h-[calc(100vh-12rem)] overflow-y-auto"
					ref={listRef}
				>
					<For each={toc()}>
						{(link) => (
							<TocLinkItem
								link={link}
								activeId={activeId()}
								onClick={scrollTo}
							/>
						)}
					</For>
				</ul>
			</Show>
		</nav>
	);
}

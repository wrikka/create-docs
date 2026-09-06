import { createContext, useContext } from "solid-js";
import type { ApiCollection, DocsAppConfig } from "./config";
import type { CollectionMeta } from "./types";

const DocsCtx = createContext<DocsAppConfig>();

export const DocsProvider = (props: {
	config: DocsAppConfig;
	children: import("solid-js").JSX.Element;
}) => (
	<DocsCtx.Provider value={props.config}>{props.children}</DocsCtx.Provider>
);

export const useDocs = (): DocsAppConfig => {
	const ctx = useContext(DocsCtx);
	if (!ctx) throw new Error("useDocs must be used inside <DocsProvider>");
	return ctx;
};

/** Resolved collection metadata: dataSource collections + api collections. */
export const resolveCollections = (
	config: DocsAppConfig,
	loaded: CollectionMeta[] | undefined,
): CollectionMeta[] => [...(loaded ?? []), ...(config.apiCollections ?? [])];

export const findApiCollection = (
	config: DocsAppConfig,
	id: string | undefined,
): ApiCollection | undefined =>
	(config.apiCollections ?? []).find((c) => c.id === id);

export type SearchEvent =
	| { readonly type: "search.index_built"; readonly entriesCount: number }
	| {
			readonly type: "search.index_rebuilt";
			readonly reason: "content_changed" | "config_changed" | "manual";
	  }
	| {
			readonly type: "search.query_executed";
			readonly term: string;
			readonly hits: number;
	  };

export const searchIndexBuilt = (entriesCount: number): SearchEvent => ({
	type: "search.index_built",
	entriesCount,
});

export const searchIndexRebuilt = (
	reason: "content_changed" | "config_changed" | "manual",
): SearchEvent => ({
	type: "search.index_rebuilt",
	reason,
});

export const searchQueryExecuted = (
	term: string,
	hits: number,
): SearchEvent => ({
	type: "search.query_executed",
	term,
	hits,
});

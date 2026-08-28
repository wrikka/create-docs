/**
 * Pure search query operations.
 *
 * Scoring = BM25-lite over tokenized terms + title prefix boost + Levenshtein
 * fuzzy fallback (distance <= 2) when the literal term is not found.
 */

import type { SearchEntry, SearchIndex } from "../../types";
import { tokenize } from "./buildIndex";

export interface SearchQuery {
	readonly term: string;
	readonly limit?: number;
	/** When true, allow fuzzy (Levenshtein <=2) fallback. Default: true. */
	readonly fuzzy?: boolean;
}

export interface SearchHit {
	readonly entry: SearchEntry;
	readonly score: number;
}

const BM25_K1 = 1.2;
const BM25_B = 0.75;
const TITLE_BOOST = 5;
const PREFIX_BOOST = 2;
const FUZZY_PENALTY = 0.5;
export const levenshtein = (a: string, b: string, max = 3): number => {
	if (a === b) return 0;
	const la = a.length;
	const lb = b.length;
	if (Math.abs(la - lb) > max) return max + 1;
	if (la === 0) return lb;
	if (lb === 0) return la;
	const prev: number[] = new Array<number>(lb + 1);
	const curr: number[] = new Array<number>(lb + 1);
	for (let j = 0; j <= lb; j++) prev[j] = j;
	for (let i = 1; i <= la; i++) {
		curr[0] = i;
		let rowMin = curr[0] ?? i;
		for (let j = 1; j <= lb; j++) {
			const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
			const c1 = (curr[j - 1] ?? 0) + 1;
			const c2 = (prev[j] ?? 0) + 1;
			const c3 = (prev[j - 1] ?? 0) + cost;
			curr[j] = Math.min(c1, c2, c3);
			const v = curr[j];
			if (v !== undefined && v < rowMin) rowMin = v;
		}
		if (rowMin > max) return max + 1;
		for (let j = 0; j <= lb; j++) {
			const v = curr[j];
			if (v !== undefined) prev[j] = v;
		}
	}
	return prev[lb] ?? 0;
};

const bm25 = (
	tf: number,
	df: number,
	docLength: number,
	avgDocLength: number,
	totalDocs: number,
): number => {
	if (tf === 0) return 0;
	const idf = Math.log(1 + (totalDocs - df + 0.5) / (df + 0.5));
	const norm = 1 - BM25_B + (BM25_B * docLength) / Math.max(1, avgDocLength);
	return idf * ((tf * (BM25_K1 + 1)) / (tf + BM25_K1 * norm));
};

/** Case-insensitive, tokenized search with BM25-lite scoring. */
export const search = (
	index: SearchIndex,
	query: SearchQuery,
): readonly SearchHit[] => {
	const rawTerm = query.term.trim();
	if (rawTerm.length === 0) return [];
	const fuzzy = query.fuzzy !== false;
	const limit = query.limit ?? 20;

	const terms = tokenize(rawTerm);
	if (terms.length === 0) return [];

	const totalDocs = index.entries.length;
	const avgDoc = index.avgDocLength;
	const idToEntry = new Map<string, SearchEntry>();
	for (const e of index.entries) idToEntry.set(e.id, e);

	interface ScoredDoc {
		score: number;
		matchedExact: boolean;
	}

	const docScores = new Map<string, ScoredDoc>();

	for (const term of terms) {
		// 1. Exact term lookup
		const exact = index.inverted[term];
		if (exact) {
			for (const id of exact) {
				const entry = idToEntry.get(id);
				if (!entry) continue;
				let tf = 0;
				for (const t of entry.terms) if (t === term) tf++;
				const score = bm25(
					tf,
					exact.length,
					entry.terms.length,
					avgDoc,
					totalDocs,
				);
				const prev = docScores.get(id);
				docScores.set(id, {
					score: (prev?.score ?? 0) + score,
					matchedExact: prev?.matchedExact ?? true,
				});
			}
			continue;
		}

		// 2. Fuzzy fallback: find the best matching key per candidate doc.
		if (!fuzzy) continue;
		const seen = new Set<string>();
		const fuzzyHits: { id: string; matchedKey: string; dist: number }[] = [];
		for (const key of Object.keys(index.inverted)) {
			if (Math.abs(key.length - term.length) > 2) continue;
			const d = levenshtein(key, term, 2);
			if (d <= 2) {
				const list = index.inverted[key] ?? [];
				for (const id of list) {
					if (seen.has(id)) continue;
					seen.add(id);
					fuzzyHits.push({ id, matchedKey: key, dist: d });
				}
			}
		}

		// 3. Per candidate, find the closest matching term in the entry's own terms
		//    so we can score via bm25 with a real tf.
		for (const hit of fuzzyHits) {
			const entry = idToEntry.get(hit.id);
			if (!entry) continue;
			// Reuse dist from index key (already a good proxy). Compute tf for that key.
			let tf = 0;
			for (const t of entry.terms) if (t === hit.matchedKey) tf++;
			if (tf === 0) {
				// Fallback: count how many entry terms are within distance 2 of the query term.
				for (const t of entry.terms) {
					if (Math.abs(t.length - term.length) > 2) continue;
					if (levenshtein(t, term, 2) <= 2) tf++;
				}
			}
			const score =
				bm25(tf, fuzzyHits.length, entry.terms.length, avgDoc, totalDocs) *
				FUZZY_PENALTY;
			const prev = docScores.get(hit.id);
			docScores.set(hit.id, {
				score: (prev?.score ?? 0) + score,
				matchedExact: prev?.matchedExact ?? false,
			});
		}
	}

	// Title boost: substring or prefix match on the title gets extra weight.
	for (const e of index.entries) {
		const cur = docScores.get(e.id);
		if (!cur || cur.score === 0) continue;
		const titleLow = e.title.toLowerCase();
		if (titleLow.includes(rawTerm.toLowerCase())) {
			cur.score += TITLE_BOOST;
		}
		if (titleLow.startsWith(terms[0] ?? "")) {
			cur.score += PREFIX_BOOST;
		}
	}

	const hits: SearchHit[] = [];
	for (const [id, cur] of docScores.entries()) {
		if (cur.score <= 0) continue;
		const entry = idToEntry.get(id);
		if (entry) hits.push({ entry, score: cur.score });
	}
	hits.sort((a, b) => b.score - a.score);
	return hits.slice(0, limit);
};

import type { Concept, Expression, LanguageCode } from "@/lib/types";
import { getAllConcepts, getAllExpressions } from "@/lib/data/concepts";

/**
 * Search resolves a query to CONCEPTS, not to strings. A query may be an
 * English phrase ("long time no see"), a paraphrase of the intent
 * ("greet someone you haven't seen"), or an existing Hausa/Igbo/Yorùbá
 * expression ("kwana biyu") — all should land on the same concept.
 *
 * Matching is diacritic-insensitive so "e kaaro" finds "Ẹ káàárọ̀".
 * This folding is used ONLY for matching — displayed text always keeps
 * its full diacritics and tone marks.
 */

export interface SearchHit {
  concept: Concept;
  score: number;
  /** The expression that matched, when the match came from one. */
  matchedExpression?: Expression;
}

/** Fold case, diacritics, and punctuation for matching purposes only. */
export function foldForSearch(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // combining marks (tones, under-dots as marks)
    .replace(/[Ḁ-ỿ]/g, (ch) =>
      // Latin Extended Additional chars that survive NFD (dot-below forms
      // like ẹ/ọ/ṣ decompose, but be defensive about any that don't).
      ch.normalize("NFD").replace(/[̀-ͯ]/g, ""),
    )
    .toLowerCase()
    .replace(/[’'‘"“”!?.,;:()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Dice coefficient over character bigrams — a cheap stand-in for the
 * pg_trgm similarity the Supabase search RPC uses, so near-misses like
 * "e kaaro" → "Ẹ káàárọ̀" (folded "e kaaaro") behave the same in both
 * backends.
 */
function bigramSimilarity(a: string, b: string): number {
  if (a.length < 2 || b.length < 2) return 0;
  const bigrams = new Map<string, number>();
  for (let i = 0; i < a.length - 1; i++) {
    const gram = a.slice(i, i + 2);
    bigrams.set(gram, (bigrams.get(gram) ?? 0) + 1);
  }
  let shared = 0;
  for (let i = 0; i < b.length - 1; i++) {
    const gram = b.slice(i, i + 2);
    const count = bigrams.get(gram) ?? 0;
    if (count > 0) {
      shared++;
      bigrams.set(gram, count - 1);
    }
  }
  return (2 * shared) / (a.length - 1 + (b.length - 1));
}

function scoreText(query: string, candidate: string): number {
  const q = foldForSearch(query);
  const c = foldForSearch(candidate);
  if (!q || !c) return 0;
  if (c === q) return 100;
  if (c.startsWith(q)) return 70;
  if (c.includes(q)) return 55;
  // Token overlap: every query token found somewhere in the candidate.
  const qTokens = q.split(" ");
  const matched = qTokens.filter((t) => t.length > 1 && c.includes(t));
  if (matched.length === qTokens.length && qTokens.length > 1) return 45;
  if (matched.length > 0) return Math.min(35, matched.length * 12);
  const similarity = bigramSimilarity(q, c);
  if (similarity >= 0.5) return Math.round(similarity * 50);
  return 0;
}

export function searchConcepts(query: string): SearchHit[] {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const concepts = getAllConcepts();
  const expressions = getAllExpressions();
  const hits = new Map<string, SearchHit>();

  const record = (
    concept: Concept,
    score: number,
    matchedExpression?: Expression,
  ) => {
    if (score <= 0) return;
    const existing = hits.get(concept.id);
    if (!existing || score > existing.score) {
      hits.set(concept.id, { concept, score, matchedExpression });
    }
  };

  for (const concept of concepts) {
    record(concept, scoreText(trimmed, concept.title));
    record(concept, Math.round(scoreText(trimmed, concept.description) * 0.6));
    for (const term of concept.searchTerms) {
      record(concept, scoreText(trimmed, term));
    }
  }

  const conceptById = new Map(concepts.map((c) => [c.id, c]));
  for (const expression of expressions) {
    const concept = conceptById.get(expression.conceptId);
    if (!concept) continue;
    record(concept, scoreText(trimmed, expression.text), expression);
    record(
      concept,
      Math.round(scoreText(trimmed, expression.naturalMeaning) * 0.8),
      expression,
    );
  }

  return [...hits.values()].sort((a, b) => b.score - a.score);
}

/** Language of a matched expression, for the "matched via …" hint. */
export function matchedLanguageLabel(
  hit: SearchHit,
): { code: LanguageCode; text: string } | null {
  if (!hit.matchedExpression) return null;
  return {
    code: hit.matchedExpression.languageCode,
    text: hit.matchedExpression.text,
  };
}

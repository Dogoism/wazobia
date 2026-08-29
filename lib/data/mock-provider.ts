import type { ConceptWithExpressions, SearchResult } from "@/lib/types";
import {
  getAllConcepts,
  getConceptBySlug as getMockConceptBySlug,
  getExpressionsForConcept,
} from "@/lib/data/concepts";
import { searchConcepts } from "@/lib/search";

/**
 * Mock implementation of the data provider, backed by the typed seed data
 * in lib/data/concepts.ts. Active whenever Supabase env vars are absent,
 * so the app always runs — including fresh clones and CI.
 */

export async function getConceptsWithExpressions(): Promise<
  ConceptWithExpressions[]
> {
  return getAllConcepts().map((concept) => ({
    concept,
    expressions: getExpressionsForConcept(concept.id),
  }));
}

export async function getConceptBySlug(
  slug: string,
): Promise<ConceptWithExpressions | null> {
  return getMockConceptBySlug(slug);
}

export async function getConceptSlugs(): Promise<string[]> {
  return getAllConcepts().map((concept) => concept.slug);
}

export async function searchYarn(query: string): Promise<SearchResult[]> {
  return searchConcepts(query)
    .slice(0, 8)
    .map((hit) => ({
      slug: hit.concept.slug,
      title: hit.concept.title,
      score: hit.score,
      matchedText: hit.matchedExpression?.text,
      matchedLanguageCode: hit.matchedExpression?.languageCode,
    }));
}

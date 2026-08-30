import type { ConceptWithExpressions, SearchResult } from "@/lib/types";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import * as mockProvider from "@/lib/data/mock-provider";
import * as supabaseProvider from "@/lib/data/supabase-provider";

/**
 * The single data access surface for pages and route handlers
 * (server-side only). Backed by Supabase when configured, otherwise by
 * the typed mock data — both implement the same concept-canonical model,
 * so swapping backends never reshapes the product.
 */
function impl(): typeof mockProvider {
  return isSupabaseConfigured() ? supabaseProvider : mockProvider;
}

export function getConceptsWithExpressions(): Promise<
  ConceptWithExpressions[]
> {
  return impl().getConceptsWithExpressions();
}

export function getConceptBySlug(
  slug: string,
): Promise<ConceptWithExpressions | null> {
  return impl().getConceptBySlug(slug);
}

export function getConceptSlugs(): Promise<string[]> {
  return impl().getConceptSlugs();
}

export function searchYarn(query: string): Promise<SearchResult[]> {
  return impl().searchYarn(query);
}

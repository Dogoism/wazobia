import { cache } from "react";
import type {
  AudioAsset,
  Concept,
  ConceptWithExpressions,
  ContributorKind,
  ContributorRef,
  Expression,
  LanguageCode,
  Register,
  SearchResult,
  Source,
  VerificationStatus,
} from "@/lib/types";
import { getSupabase } from "@/lib/supabase/server";

/**
 * Supabase implementation of the data provider.
 *
 * Deliberately uses flat per-table queries joined in TypeScript rather
 * than PostgREST embedded selects: the row shapes below stay hand-typed
 * and checkable, and at dictionary scale (hundreds of rows) the extra
 * round trips are irrelevant. Replace the hand-written row types with
 * `supabase gen types typescript` output once a project is linked.
 */

interface ConceptRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  search_terms: string[];
  position: number;
}

interface ExpressionRow {
  id: string;
  concept_id: string;
  language_code: string;
  variant_id: string;
  text: string;
  literal_meaning: string | null;
  natural_meaning: string;
  usage_note: string | null;
  register: string;
  pronunciation_note: string | null;
  position: number;
  contributor_id: string;
  verification_status: string;
  dispute_note: string | null;
  votes_count: number;
}

interface ContributorRow {
  id: string;
  display_name: string;
  kind: string;
}

interface ExampleRow {
  expression_id: string;
  text: string;
  translation: string;
  position: number;
}

interface SourceRow {
  id: string;
  title: string;
  url: string | null;
  is_placeholder: boolean;
}

interface ExpressionSourceRow {
  expression_id: string;
  source_id: string;
}

interface AudioRow {
  id: string;
  expression_id: string;
  storage_key: string;
  speed: string;
  speaker_name: string | null;
  speaker_gender: string | null;
  variant_id: string | null;
  contributor_id: string | null;
  verification_status: string;
}

interface SearchRow {
  slug: string;
  title: string;
  score: number;
  matched_text: string | null;
  matched_language: string | null;
}

const LANGUAGE_CODES: readonly LanguageCode[] = ["en", "ha", "ig", "yo"];
const REGISTERS: readonly Register[] = [
  "neutral",
  "formal",
  "respectful",
  "casual",
  "intimate",
];
const STATUSES: readonly VerificationStatus[] = [
  "verified",
  "community",
  "pending",
  "disputed",
  "ai_suggestion",
];
const CONTRIBUTOR_KINDS: readonly ContributorKind[] = [
  "seed",
  "native-speaker",
  "learner",
  "ai",
];

function asLanguageCode(value: string): LanguageCode | null {
  return (LANGUAGE_CODES as readonly string[]).includes(value)
    ? (value as LanguageCode)
    : null;
}

function asRegister(value: string): Register {
  return (REGISTERS as readonly string[]).includes(value)
    ? (value as Register)
    : "neutral";
}

/** Unknown statuses degrade to "pending" — never accidentally upgraded. */
function asStatus(value: string): VerificationStatus {
  return (STATUSES as readonly string[]).includes(value)
    ? (value as VerificationStatus)
    : "pending";
}

function asContributorKind(value: string): ContributorKind {
  return (CONTRIBUTOR_KINDS as readonly string[]).includes(value)
    ? (value as ContributorKind)
    : "learner";
}

async function fetchRows<T>(table: string, columns: string): Promise<T[]> {
  const { data, error } = await getSupabase().from(table).select(columns);
  if (error) {
    throw new Error(`Supabase query failed for ${table}: ${error.message}`);
  }
  return (data ?? []) as unknown as T[];
}

/**
 * Fetches and joins the whole dictionary. Wrapped in React cache() so one
 * render pass hits the database once; page-level revalidation controls
 * freshness. Fine at dictionary scale — revisit if content grows large.
 */
const fetchAll = cache(async (): Promise<ConceptWithExpressions[]> => {
  const [concepts, expressions, contributors, examples, sources, links, audio] =
    await Promise.all([
      fetchRows<ConceptRow>(
        "concepts",
        "id, slug, title, description, category, search_terms, position",
      ),
      fetchRows<ExpressionRow>(
        "expressions",
        "id, concept_id, language_code, variant_id, text, literal_meaning, natural_meaning, usage_note, register, pronunciation_note, position, contributor_id, verification_status, dispute_note, votes_count",
      ),
      fetchRows<ContributorRow>("contributors", "id, display_name, kind"),
      fetchRows<ExampleRow>(
        "examples",
        "expression_id, text, translation, position",
      ),
      fetchRows<SourceRow>("sources", "id, title, url, is_placeholder"),
      fetchRows<ExpressionSourceRow>(
        "expression_sources",
        "expression_id, source_id",
      ),
      fetchRows<AudioRow>(
        "audio_assets",
        "id, expression_id, storage_key, speed, speaker_name, speaker_gender, variant_id, contributor_id, verification_status",
      ),
    ]);

  const contributorById = new Map(contributors.map((c) => [c.id, c]));
  const sourceById = new Map(sources.map((s) => [s.id, s]));

  const examplesByExpression = new Map<string, ExampleRow[]>();
  for (const example of examples) {
    const list = examplesByExpression.get(example.expression_id) ?? [];
    list.push(example);
    examplesByExpression.set(example.expression_id, list);
  }

  const sourcesByExpression = new Map<string, Source[]>();
  for (const link of links) {
    const source = sourceById.get(link.source_id);
    if (!source) continue;
    const list = sourcesByExpression.get(link.expression_id) ?? [];
    list.push({
      id: source.id,
      title: source.title,
      url: source.url ?? undefined,
      isPlaceholder: source.is_placeholder || undefined,
    });
    sourcesByExpression.set(link.expression_id, list);
  }

  const audioByExpression = new Map<string, AudioAsset[]>();
  for (const row of audio) {
    const list = audioByExpression.get(row.expression_id) ?? [];
    list.push({
      id: row.id,
      expressionId: row.expression_id,
      storageKey: row.storage_key,
      speed: row.speed === "slow" ? "slow" : "natural",
      speakerName: row.speaker_name ?? undefined,
      speakerGender: row.speaker_gender ?? undefined,
      variantId: row.variant_id ?? undefined,
      contributorId: row.contributor_id ?? undefined,
      verificationStatus: asStatus(row.verification_status),
    });
    audioByExpression.set(row.expression_id, list);
  }

  const mapContributor = (id: string): ContributorRef => {
    const row = contributorById.get(id);
    return row
      ? { displayName: row.display_name, kind: asContributorKind(row.kind) }
      : { displayName: "Unknown contributor", kind: "learner" };
  };

  const expressionsByConcept = new Map<string, Expression[]>();
  for (const row of [...expressions].sort((a, b) => a.position - b.position)) {
    const languageCode = asLanguageCode(row.language_code);
    if (!languageCode) continue; // never render rows in unknown languages
    const firstExample = (examplesByExpression.get(row.id) ?? []).sort(
      (a, b) => a.position - b.position,
    )[0];
    const expression: Expression = {
      id: row.id,
      conceptId: row.concept_id,
      languageCode,
      variantId: row.variant_id,
      text: row.text,
      literalMeaning: row.literal_meaning,
      naturalMeaning: row.natural_meaning,
      usageNote: row.usage_note ?? undefined,
      register: asRegister(row.register),
      example: firstExample
        ? { text: firstExample.text, translation: firstExample.translation }
        : undefined,
      pronunciationNote: row.pronunciation_note ?? undefined,
      audio: audioByExpression.get(row.id) ?? [],
      contributor: mapContributor(row.contributor_id),
      verificationStatus: asStatus(row.verification_status),
      sources: sourcesByExpression.get(row.id) ?? [],
      votes: row.votes_count,
      disputeNote: row.dispute_note ?? undefined,
    };
    const list = expressionsByConcept.get(row.concept_id) ?? [];
    list.push(expression);
    expressionsByConcept.set(row.concept_id, list);
  }

  return [...concepts]
    .sort((a, b) => a.position - b.position)
    .map((row) => {
      const concept: Concept = {
        id: row.id,
        slug: row.slug,
        title: row.title,
        description: row.description,
        searchTerms: row.search_terms,
        category: row.category,
      };
      return {
        concept,
        expressions: expressionsByConcept.get(row.id) ?? [],
      };
    });
});

export async function getConceptsWithExpressions(): Promise<
  ConceptWithExpressions[]
> {
  return fetchAll();
}

export async function getConceptBySlug(
  slug: string,
): Promise<ConceptWithExpressions | null> {
  const all = await fetchAll();
  return all.find((entry) => entry.concept.slug === slug) ?? null;
}

export async function getConceptSlugs(): Promise<string[]> {
  const all = await fetchAll();
  return all.map((entry) => entry.concept.slug);
}

export async function searchYarn(query: string): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];
  const { data, error } = await getSupabase().rpc("search_yarn", {
    q: trimmed,
  });
  if (error) {
    throw new Error(`Supabase search failed: ${error.message}`);
  }
  return ((data ?? []) as SearchRow[]).map((row) => ({
    slug: row.slug,
    title: row.title,
    score: row.score,
    matchedText: row.matched_text ?? undefined,
    matchedLanguageCode: row.matched_language
      ? (asLanguageCode(row.matched_language) ?? undefined)
      : undefined,
  }));
}

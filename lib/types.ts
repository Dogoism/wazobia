/**
 * YARN domain model.
 *
 * These types deliberately mirror the proposed Supabase schema
 * (see docs/supabase-schema.md) so that today's typed mock data can be
 * swapped for database rows without reshaping the product model.
 *
 * Core principle: the CONCEPT (a shared conversational intent) is the
 * canonical object. Expressions in each language attach to a concept.
 * Literal meaning and natural meaning are stored separately, always.
 */

export type LanguageCode = "en" | "ha" | "ig" | "yo";

export interface Language {
  code: LanguageCode;
  /** English display name, e.g. "Yorùbá" */
  name: string;
  /** Endonym, e.g. "Èdè Yorùbá" */
  nativeName: string;
}

/**
 * A regional/dialect variety of a language. Varieties are NOT separate
 * languages — they always hang off a parent language.
 */
export interface LanguageVariant {
  id: string;
  languageCode: LanguageCode;
  name: string;
  /** True for the standard/reference variety shown by default. */
  isStandard: boolean;
  /** Optional geographic note, e.g. "Kano State", "Ghana". */
  regionNote?: string;
}

/**
 * Verification lifecycle of a piece of language data.
 * AI-generated content must NEVER carry the "verified" status.
 */
export type VerificationStatus =
  | "verified" // confirmed by a trusted native-speaker reviewer
  | "community" // submitted by a contributor, not yet fully reviewed
  | "pending" // awaiting any review
  | "disputed" // flagged — accuracy or appropriateness contested
  | "ai_suggestion"; // machine-suggested; unverified by definition

export type Register =
  | "neutral"
  | "formal"
  | "respectful"
  | "casual"
  | "intimate";

export interface Source {
  id: string;
  /** e.g. "Wikivoyage: Hausa phrasebook" or "Seed data — citation pending" */
  title: string;
  url?: string;
  /**
   * True when this is an honest placeholder rather than a primary
   * citation. Placeholder-sourced entries must not be marked verified.
   */
  isPlaceholder?: boolean;
}

export type ContributorKind = "seed" | "native-speaker" | "learner" | "ai";

export interface Contributor {
  id: string;
  displayName: string;
  /** e.g. "seed" for editorial seed data, "native-speaker", "ai" */
  kind: ContributorKind;
}

/**
 * Denormalized attribution carried on each expression for display. The
 * database keeps contributors normalized; this is the joined view.
 */
export interface ContributorRef {
  displayName: string;
  kind: ContributorKind;
}

/**
 * Audio is modeled as a first-class asset so storage can move from
 * Supabase Storage to Cloudflare R2 later by changing only `storageKey`
 * resolution, not the product model.
 */
export interface AudioAsset {
  id: string;
  expressionId: string;
  /** Provider-agnostic object key, resolved to a URL at the edge. */
  storageKey: string;
  speed: "natural" | "slow";
  speakerName?: string;
  /** Voluntarily supplied only. */
  speakerGender?: string;
  variantId?: string;
  contributorId?: string;
  verificationStatus: VerificationStatus;
}

/**
 * One natural expression of a concept in one language variety.
 *
 * Multiple expressions may map to the same concept (synonyms, register
 * variants, dialect forms) — each is its own record.
 */
export interface Expression {
  id: string;
  conceptId: string;
  languageCode: LanguageCode;
  /** The variety this exact form belongs to. */
  variantId: string;
  /**
   * The expression exactly as written by speakers, with full diacritics
   * and tone marks. Never strip tone marks for display.
   */
  text: string;
  /**
   * Word-for-word / morpheme-level meaning, e.g. "Two days" for
   * "Kwana biyu". Null when a faithful literal breakdown has not been
   * verified — never guess one.
   */
  literalMeaning: string | null;
  /** What the phrase actually conveys, in natural English. */
  naturalMeaning: string;
  usageNote?: string;
  register: Register;
  example?: {
    text: string;
    translation: string;
  };
  /** Rough reading aid until audio exists; not IPA. */
  pronunciationNote?: string;
  audio: AudioAsset[];
  contributor: ContributorRef;
  verificationStatus: VerificationStatus;
  sources: Source[];
  /** Community agreement count. */
  votes: number;
  /** Present when status is "disputed" — why it is contested. */
  disputeNote?: string;
}

/**
 * The canonical object: a conversational intent shared across cultures.
 */
export interface Concept {
  id: string;
  /** URL slug, stable identifier. */
  slug: string;
  /** Short intent label, e.g. "Greeting someone you haven't seen in a while". */
  title: string;
  description: string;
  /**
   * Extra search keys: paraphrases, related English phrasings.
   * Expressions' own text is also searched, so "kwana biyu" resolves here.
   */
  searchTerms: string[];
  /** Loose grouping, e.g. "greetings", "gratitude". */
  category: string;
}

/** A concept joined with all of its expressions, ready for display. */
export interface ConceptWithExpressions {
  concept: Concept;
  expressions: Expression[];
}

/** One search hit as shown in the search results list. */
export interface SearchResult {
  slug: string;
  title: string;
  score: number;
  /** Set when the match came from a specific expression. */
  matchedText?: string;
  matchedLanguageCode?: LanguageCode;
}

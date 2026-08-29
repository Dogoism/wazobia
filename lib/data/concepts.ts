import type {
  Concept,
  ConceptWithExpressions,
  Contributor,
  Expression,
  Source,
} from "@/lib/types";

/**
 * SEED DATA — read this before editing.
 *
 * Every entry here follows the language-data rules in AGENTS.md:
 *
 * - Only widely attested, standard-variety phrases are included.
 * - NO dialect-specific forms have been seeded. Regional varieties
 *   (Kano, Sokoto, Gaananci, Enuani, Ika, Ukwuani, Onitsha, Ọ̀yọ́,
 *   Ìjẹ̀bú, Èkìtì, Ondo) intentionally have zero expressions until a
 *   native speaker contributes and verifies them. The UI shows a
 *   "pending native-speaker verification" state instead.
 * - Diacritics and tone marks are preserved exactly; never strip them.
 * - `literalMeaning` is null wherever a faithful morpheme-level gloss
 *   was not confidently attested — a null literal is correct behavior,
 *   not missing data.
 * - "verified" is used only for textbook-level greetings with a real
 *   public source. Anything with lower confidence is "community",
 *   "pending", "disputed", or "ai_suggestion".
 * - Before production launch, every entry (including "verified" seed
 *   rows) must be re-verified by native speakers. Seed status exists to
 *   exercise the UI, not to assert final linguistic authority.
 */

export const CONTRIBUTORS: Contributor[] = [
  { id: "seed-editorial", displayName: "YARN editorial seed", kind: "seed" },
  { id: "ai-assistant", displayName: "AI suggestion (unreviewed)", kind: "ai" },
];

const SRC_WIKIVOYAGE_HAUSA: Source = {
  id: "src-wv-ha",
  title: "Wikivoyage: Hausa phrasebook",
  url: "https://en.wikivoyage.org/wiki/Hausa_phrasebook",
};

const SRC_WIKIVOYAGE_YORUBA: Source = {
  id: "src-wv-yo",
  title: "Wikivoyage: Yoruba phrasebook",
  url: "https://en.wikivoyage.org/wiki/Yoruba_phrasebook",
};

const SRC_WIKIVOYAGE_IGBO: Source = {
  id: "src-wv-ig",
  title: "Wikivoyage: Igbo phrasebook",
  url: "https://en.wikivoyage.org/wiki/Igbo_phrasebook",
};

const SRC_PENDING: Source = {
  id: "src-pending",
  title: "Seed data — primary citation pending",
  isPlaceholder: true,
};

const wiktionary = (id: string, entry: string): Source => ({
  id,
  title: `Wiktionary: ${entry}`,
  url: `https://en.wiktionary.org/wiki/${entry.replaceAll(" ", "_")}`,
});

const CONCEPTS: Concept[] = [
  {
    id: "c-long-time",
    slug: "long-time-no-see",
    title: "Greeting someone you haven't seen in a while",
    description:
      "What you say when you run into a person after a noticeable absence — warmth plus a nod to the time that has passed.",
    searchTerms: [
      "long time no see",
      "it's been a while",
      "it has been long",
      "haven't seen you in ages",
      "greet someone you haven't seen",
      "where have you been",
    ],
    category: "greetings",
  },
  {
    id: "c-good-morning",
    slug: "good-morning",
    title: "Greeting someone in the morning",
    description:
      "The first greeting of the day. In all three Nigerian languages the traditional form asks after the night rather than describing the morning.",
    searchTerms: ["good morning", "morning greeting", "greet in the morning"],
    category: "greetings",
  },
  {
    id: "c-welcome",
    slug: "welcoming-someone",
    title: "Welcoming someone who has just arrived",
    description:
      "Said to a guest or a person returning from a journey, the market, or work — an arrival is acknowledged out loud.",
    searchTerms: [
      "welcome",
      "welcome back",
      "greet a guest",
      "receive a visitor",
      "you are welcome",
    ],
    category: "greetings",
  },
  {
    id: "c-thanks",
    slug: "thanking-someone",
    title: "Thanking someone",
    description:
      "Expressing gratitude. Register matters: Yorùbá in particular changes form depending on the age or status of the person being thanked.",
    searchTerms: ["thank you", "thanks", "show gratitude", "grateful"],
    category: "gratitude",
  },
  {
    id: "c-well-done",
    slug: "acknowledging-work",
    title: "Acknowledging someone at work",
    description:
      "A greeting offered to a person in the middle of labour. Common across Nigerian cultures; Nigerian English carries it as “well done”, said without irony.",
    searchTerms: [
      "well done",
      "well done at work",
      "greet someone working",
      "more grease to your elbow",
      "keep it up",
    ],
    category: "encouragement",
  },
  {
    id: "c-sympathy",
    slug: "expressing-sympathy",
    title: "Expressing sympathy",
    description:
      "What you say when something bad — large or small — happens to someone. In Nigerian usage the speaker need not be at fault to say sorry.",
    searchTerms: [
      "sorry",
      "so sorry",
      "sympathy",
      "condolence",
      "take heart",
      "commiserate",
    ],
    category: "sympathy",
  },
];

const EXPRESSIONS: Expression[] = [
  // ── Greeting someone you haven't seen in a while ────────────────────
  {
    id: "x-en-long-time",
    conceptId: "c-long-time",
    languageCode: "en",
    variantId: "en-standard",
    text: "Long time no see",
    literalMeaning: null,
    naturalMeaning: "It has been a long time since we last met.",
    usageNote:
      "Casual and friendly. “It’s been a while” is the slightly more neutral alternative.",
    register: "casual",
    example: {
      text: "Long time no see! Where have you been hiding?",
      translation: "Warm surprise at meeting someone after an absence.",
    },
    audio: [],
    contributorId: "seed-editorial",
    verificationStatus: "verified",
    sources: [wiktionary("src-wk-ltns", "long time no see")],
    votes: 12,
  },
  {
    id: "x-ha-kwana-biyu",
    conceptId: "c-long-time",
    languageCode: "ha",
    variantId: "ha-standard",
    text: "Kwana biyu",
    literalMeaning: "Two days",
    naturalMeaning: "It’s been a while — long time no see.",
    usageNote:
      "The “two days” are figurative: any noticeable absence counts. A common reply is “Kwana biyu ke nan” — “indeed, it has been a while”.",
    register: "casual",
    example: {
      text: "Kwana biyu! Ina labari?",
      translation: "Long time no see! What’s the news?",
    },
    audio: [],
    contributorId: "seed-editorial",
    verificationStatus: "verified",
    sources: [SRC_WIKIVOYAGE_HAUSA],
    votes: 21,
  },
  {
    id: "x-yo-ojo-meta",
    conceptId: "c-long-time",
    languageCode: "yo",
    variantId: "yo-standard",
    text: "Ẹ kú ọjọ́ mẹ́ta",
    literalMeaning: "Greetings on three days",
    naturalMeaning: "It’s been a while — long time no see.",
    usageNote:
      "Built on the Yorùbá “kú …” greeting pattern; “three days” stands in for any long absence. The “Ẹ” prefix marks respect toward an elder or a group.",
    register: "respectful",
    pronunciationNote: "eh KOO oh-JOH MEH-ta (tone marks matter)",
    audio: [],
    contributorId: "seed-editorial",
    // Well-known greeting, but until a citable primary source is attached
    // it stays below "verified" per the language-data rules.
    verificationStatus: "community",
    sources: [SRC_PENDING],
    votes: 17,
  },
  {
    id: "x-ig-o-dila-anya",
    conceptId: "c-long-time",
    languageCode: "ig",
    variantId: "ig-standard",
    text: "Ọ dịla anya",
    literalMeaning: "It has become far",
    naturalMeaning: "It’s been a long time.",
    usageNote:
      "AI-suggested candidate. Awaiting native-speaker confirmation that this is the natural greeting in this situation — do not treat as reliable yet.",
    register: "neutral",
    audio: [],
    contributorId: "ai-assistant",
    verificationStatus: "ai_suggestion",
    sources: [SRC_PENDING],
    votes: 0,
  },

  // ── Greeting someone in the morning ─────────────────────────────────
  {
    id: "x-en-good-morning",
    conceptId: "c-good-morning",
    languageCode: "en",
    variantId: "en-standard",
    text: "Good morning",
    literalMeaning: null,
    naturalMeaning: "Standard morning greeting.",
    register: "neutral",
    audio: [],
    contributorId: "seed-editorial",
    verificationStatus: "verified",
    sources: [wiktionary("src-wk-gm", "good morning")],
    votes: 9,
  },
  {
    id: "x-ha-ina-kwana",
    conceptId: "c-good-morning",
    languageCode: "ha",
    variantId: "ha-standard",
    text: "Ina kwana?",
    literalMeaning: "How was the sleep / the night?",
    naturalMeaning: "Good morning.",
    usageNote:
      "The traditional morning greeting asks after the night. The usual reply is “Lafiya lau” — “in good health”.",
    register: "neutral",
    example: {
      text: "Ina kwana? — Lafiya lau.",
      translation: "Good morning. — Very well, thank you.",
    },
    audio: [],
    contributorId: "seed-editorial",
    verificationStatus: "verified",
    sources: [SRC_WIKIVOYAGE_HAUSA],
    votes: 24,
  },
  {
    id: "x-ha-barka-safiya",
    conceptId: "c-good-morning",
    languageCode: "ha",
    variantId: "ha-standard",
    text: "Barka da safiya",
    literalMeaning: "Blessings on the morning",
    naturalMeaning: "Good morning.",
    usageNote:
      "Slightly more formal than “Ina kwana?”; the “barka da …” pattern greets someone at a moment or occasion.",
    register: "formal",
    audio: [],
    contributorId: "seed-editorial",
    verificationStatus: "verified",
    sources: [SRC_WIKIVOYAGE_HAUSA],
    votes: 14,
  },
  {
    id: "x-ig-ibola-chi",
    conceptId: "c-good-morning",
    languageCode: "ig",
    variantId: "ig-standard",
    text: "Ị bọọla chi?",
    // Attested greeting, but published glosses of its morphemes differ —
    // leave the literal null until a native speaker settles it.
    literalMeaning: null,
    naturalMeaning: "Good morning.",
    usageNote:
      "A traditional morning greeting asking whether the person came through the night well.",
    register: "neutral",
    audio: [],
    contributorId: "seed-editorial",
    verificationStatus: "community",
    sources: [SRC_PENDING],
    votes: 8,
  },
  {
    id: "x-ig-ututu-oma",
    conceptId: "c-good-morning",
    languageCode: "ig",
    variantId: "ig-standard",
    text: "Ụtụtụ ọma",
    literalMeaning: "Good morning (word for word)",
    naturalMeaning: "Good morning.",
    usageNote: "Very widely used in modern speech and broadcasting.",
    register: "neutral",
    audio: [],
    contributorId: "seed-editorial",
    verificationStatus: "disputed",
    disputeNote:
      "Community discussion: some speakers regard this as a modern calque from English and prefer traditional greetings such as “Ị bọọla chi?”. Both usages are recorded; neither has been struck out.",
    sources: [SRC_WIKIVOYAGE_IGBO],
    votes: 6,
  },
  {
    id: "x-yo-e-kaaro",
    conceptId: "c-good-morning",
    languageCode: "yo",
    variantId: "yo-standard",
    text: "Ẹ káàárọ̀",
    literalMeaning: "Greetings on the morning (respectful)",
    naturalMeaning: "Good morning.",
    usageNote:
      "Use toward elders, superiors, or a group — the “Ẹ” prefix carries the respect. Yorùbá greetings are strongly age-sensitive.",
    register: "respectful",
    pronunciationNote: "eh KAH-ah-raw",
    example: {
      text: "Ẹ káàárọ̀ mà.",
      translation: "Good morning, ma.",
    },
    audio: [],
    contributorId: "seed-editorial",
    verificationStatus: "verified",
    sources: [SRC_WIKIVOYAGE_YORUBA],
    votes: 28,
  },
  {
    id: "x-yo-kaaro",
    conceptId: "c-good-morning",
    languageCode: "yo",
    variantId: "yo-standard",
    text: "Káàárọ̀",
    literalMeaning: "Greetings on the morning",
    naturalMeaning: "Good morning (to a peer or younger person).",
    usageNote:
      "The same greeting without the honorific “Ẹ”. Using this form with an elder would read as rude — pick the respectful record instead.",
    register: "casual",
    audio: [],
    contributorId: "seed-editorial",
    verificationStatus: "verified",
    sources: [SRC_WIKIVOYAGE_YORUBA],
    votes: 19,
  },

  // ── Welcoming someone who has just arrived ──────────────────────────
  {
    id: "x-en-welcome",
    conceptId: "c-welcome",
    languageCode: "en",
    variantId: "en-standard",
    text: "Welcome",
    literalMeaning: null,
    naturalMeaning: "Greeting to someone arriving.",
    usageNote:
      "Nigerian English uses “welcome” freely for any arrival — home from work, back from a trip — not only for guests.",
    register: "neutral",
    audio: [],
    contributorId: "seed-editorial",
    verificationStatus: "verified",
    sources: [wiktionary("src-wk-wel", "welcome")],
    votes: 7,
  },
  {
    id: "x-ha-sannu-da-zuwa",
    conceptId: "c-welcome",
    languageCode: "ha",
    variantId: "ha-standard",
    text: "Sannu da zuwa",
    literalMeaning: "Greetings on (your) coming",
    naturalMeaning: "Welcome.",
    usageNote:
      "The “sannu da …” pattern greets someone in the middle of doing something — here, arriving.",
    register: "neutral",
    audio: [],
    contributorId: "seed-editorial",
    verificationStatus: "verified",
    sources: [SRC_WIKIVOYAGE_HAUSA],
    votes: 16,
  },
  {
    id: "x-ig-nnoo",
    conceptId: "c-welcome",
    languageCode: "ig",
    variantId: "ig-standard",
    text: "Nnọọ",
    literalMeaning: null,
    naturalMeaning: "Welcome.",
    usageNote:
      "The standard Igbo welcome. A faithful word-for-word gloss is awaiting native-speaker verification, so none is shown.",
    register: "neutral",
    audio: [],
    contributorId: "seed-editorial",
    verificationStatus: "verified",
    sources: [SRC_WIKIVOYAGE_IGBO],
    votes: 18,
  },
  {
    id: "x-yo-e-kaabo",
    conceptId: "c-welcome",
    languageCode: "yo",
    variantId: "yo-standard",
    text: "Ẹ káàbọ̀",
    literalMeaning: "Greetings on your arrival",
    naturalMeaning: "Welcome.",
    usageNote:
      "Respectful/plural form. Said to anyone arriving — a guest, or family returning home.",
    register: "respectful",
    pronunciationNote: "eh KAH-ah-baw",
    audio: [],
    contributorId: "seed-editorial",
    verificationStatus: "verified",
    sources: [SRC_WIKIVOYAGE_YORUBA],
    votes: 22,
  },

  // ── Thanking someone ────────────────────────────────────────────────
  {
    id: "x-en-thank-you",
    conceptId: "c-thanks",
    languageCode: "en",
    variantId: "en-standard",
    text: "Thank you",
    literalMeaning: null,
    naturalMeaning: "Expression of gratitude.",
    register: "neutral",
    audio: [],
    contributorId: "seed-editorial",
    verificationStatus: "verified",
    sources: [wiktionary("src-wk-ty", "thank you")],
    votes: 5,
  },
  {
    id: "x-ha-na-gode",
    conceptId: "c-thanks",
    languageCode: "ha",
    variantId: "ha-standard",
    text: "Na gode",
    literalMeaning: "I am grateful",
    naturalMeaning: "Thank you.",
    register: "neutral",
    example: {
      text: "Na gode sosai.",
      translation: "Thank you very much.",
    },
    audio: [],
    contributorId: "seed-editorial",
    verificationStatus: "verified",
    sources: [SRC_WIKIVOYAGE_HAUSA],
    votes: 26,
  },
  {
    id: "x-ig-daalu",
    conceptId: "c-thanks",
    languageCode: "ig",
    variantId: "ig-standard",
    text: "Daalụ",
    literalMeaning: null,
    naturalMeaning: "Thank you.",
    usageNote:
      "General-purpose thanks. A confident morpheme-level gloss is pending verification, so none is shown.",
    register: "neutral",
    audio: [],
    contributorId: "seed-editorial",
    verificationStatus: "verified",
    sources: [SRC_WIKIVOYAGE_IGBO],
    votes: 20,
  },
  {
    id: "x-ig-imela",
    conceptId: "c-thanks",
    languageCode: "ig",
    variantId: "ig-standard",
    text: "Imela",
    literalMeaning: "You have done (well)",
    naturalMeaning: "Thank you — appreciation for something done.",
    usageNote:
      "Thanks that points at a deed. Community-submitted; awaiting reviewer verification.",
    register: "neutral",
    audio: [],
    contributorId: "seed-editorial",
    verificationStatus: "community",
    sources: [SRC_PENDING],
    votes: 4,
  },
  {
    id: "x-yo-e-se",
    conceptId: "c-thanks",
    languageCode: "yo",
    variantId: "yo-standard",
    text: "Ẹ ṣé",
    literalMeaning: "You (respectful) did (it)",
    naturalMeaning: "Thank you (to an elder, superior, or group).",
    usageNote:
      "Gratitude framed as acknowledging what the person did. Never thank an elder with the casual form.",
    register: "respectful",
    audio: [],
    contributorId: "seed-editorial",
    verificationStatus: "verified",
    sources: [SRC_WIKIVOYAGE_YORUBA],
    votes: 25,
  },
  {
    id: "x-yo-o-se",
    conceptId: "c-thanks",
    languageCode: "yo",
    variantId: "yo-standard",
    text: "O ṣé",
    literalMeaning: "You did (it)",
    naturalMeaning: "Thanks (to a peer or younger person).",
    register: "casual",
    audio: [],
    contributorId: "seed-editorial",
    verificationStatus: "verified",
    sources: [SRC_WIKIVOYAGE_YORUBA],
    votes: 15,
  },

  // ── Acknowledging someone at work ───────────────────────────────────
  {
    id: "x-en-well-done",
    conceptId: "c-well-done",
    languageCode: "en",
    variantId: "en-standard",
    text: "Well done",
    literalMeaning: null,
    naturalMeaning:
      "Greeting to someone in the middle of work — solidarity, not appraisal.",
    usageNote:
      "In Nigerian English this is said to anyone working, as a greeting. It does not grade the work.",
    register: "neutral",
    audio: [],
    contributorId: "seed-editorial",
    verificationStatus: "verified",
    sources: [wiktionary("src-wk-wd", "well done")],
    votes: 11,
  },
  {
    id: "x-ha-sannu-da-aiki",
    conceptId: "c-well-done",
    languageCode: "ha",
    variantId: "ha-standard",
    text: "Sannu da aiki",
    literalMeaning: "Greetings on the work",
    naturalMeaning: "Well done — greeting to someone working.",
    register: "neutral",
    audio: [],
    contributorId: "seed-editorial",
    verificationStatus: "verified",
    sources: [SRC_WIKIVOYAGE_HAUSA],
    votes: 18,
  },
  {
    id: "x-ig-jisie-ike",
    conceptId: "c-well-done",
    languageCode: "ig",
    variantId: "ig-standard",
    text: "Jisie ike",
    literalMeaning: "Hold firmly to strength",
    naturalMeaning: "Well done / keep it up — encouragement to keep going.",
    usageNote:
      "Also used to close conversations and letters, wishing continued strength. Community-submitted; awaiting reviewer verification.",
    register: "neutral",
    audio: [],
    contributorId: "seed-editorial",
    verificationStatus: "community",
    sources: [SRC_PENDING],
    votes: 9,
  },
  {
    id: "x-yo-e-ku-ise",
    conceptId: "c-well-done",
    languageCode: "yo",
    variantId: "yo-standard",
    text: "Ẹ kú iṣẹ́",
    literalMeaning: "Greetings on the work",
    naturalMeaning: "Well done — greeting to someone working.",
    usageNote:
      "The same “kú …” greeting pattern as “Ẹ kú ọjọ́ mẹ́ta”, aimed at the situation the person is in.",
    register: "respectful",
    audio: [],
    contributorId: "seed-editorial",
    verificationStatus: "verified",
    sources: [SRC_WIKIVOYAGE_YORUBA],
    votes: 21,
  },

  // ── Expressing sympathy ─────────────────────────────────────────────
  {
    id: "x-en-sorry",
    conceptId: "c-sympathy",
    languageCode: "en",
    variantId: "en-standard",
    text: "Sorry",
    literalMeaning: null,
    naturalMeaning: "Sympathy for a misfortune, large or small.",
    usageNote:
      "In Nigerian English, “sorry” expresses sympathy even when the speaker had nothing to do with the mishap — closer to “what a pity” than an apology.",
    register: "neutral",
    audio: [],
    contributorId: "seed-editorial",
    verificationStatus: "verified",
    sources: [wiktionary("src-wk-sry", "sorry")],
    votes: 10,
  },
  {
    id: "x-ha-sannu-sympathy",
    conceptId: "c-sympathy",
    languageCode: "ha",
    variantId: "ha-standard",
    text: "Sannu",
    literalMeaning: null,
    naturalMeaning: "Sorry — sympathy and gentle acknowledgement.",
    usageNote:
      "“Sannu” is also the everyday hello; context and tone carry the sympathetic sense, often doubled: “sannu, sannu”.",
    register: "neutral",
    audio: [],
    contributorId: "seed-editorial",
    verificationStatus: "verified",
    sources: [SRC_WIKIVOYAGE_HAUSA],
    votes: 13,
  },
  {
    id: "x-ig-ndo",
    conceptId: "c-sympathy",
    languageCode: "ig",
    variantId: "ig-standard",
    text: "Ndo",
    literalMeaning: null,
    naturalMeaning: "Sorry — sympathy for what happened.",
    usageNote: "Said for anything from a stubbed toe to serious loss.",
    register: "neutral",
    audio: [],
    contributorId: "seed-editorial",
    verificationStatus: "verified",
    sources: [SRC_WIKIVOYAGE_IGBO],
    votes: 14,
  },
  {
    id: "x-yo-pele",
    conceptId: "c-sympathy",
    languageCode: "yo",
    variantId: "yo-standard",
    text: "Pẹ̀lẹ́",
    literalMeaning: null,
    naturalMeaning: "Sorry — gentle sympathy.",
    usageNote:
      "So characteristic that Nigerian English borrowed it wholesale: “pele o!”. Prefix “Ẹ” (Ẹ pẹ̀lẹ́) for respect toward elders.",
    register: "neutral",
    pronunciationNote: "PEH-leh (low–high tone)",
    audio: [],
    contributorId: "seed-editorial",
    verificationStatus: "verified",
    sources: [SRC_WIKIVOYAGE_YORUBA],
    votes: 23,
  },
];

export function getAllConcepts(): Concept[] {
  return CONCEPTS;
}

export function getConceptBySlug(slug: string): ConceptWithExpressions | null {
  const concept = CONCEPTS.find((c) => c.slug === slug);
  if (!concept) return null;
  return {
    concept,
    expressions: EXPRESSIONS.filter((e) => e.conceptId === concept.id),
  };
}

export function getExpressionsForConcept(conceptId: string): Expression[] {
  return EXPRESSIONS.filter((e) => e.conceptId === conceptId);
}

export function getAllExpressions(): Expression[] {
  return EXPRESSIONS;
}

export function getContributor(id: string): Contributor | undefined {
  return CONTRIBUTORS.find((c) => c.id === id);
}

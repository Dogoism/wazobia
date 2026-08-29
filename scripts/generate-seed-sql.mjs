/**
 * Generates supabase/migrations/0002_seed_content.sql from the curated
 * mock data in lib/data/concepts.ts, so the database seed and the app's
 * fallback data can never drift apart. Run with:
 *
 *   npm run seed:generate
 *
 * Notes:
 * - UUIDs are derived deterministically (md5 of the mock id), so re-running
 *   the generator is stable and cross-references need no lookups.
 * - votes_count is seeded as 0: the mock vote numbers are illustrative
 *   display data and would be dishonest as real agreement counts.
 */
import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const { getAllConcepts, getAllExpressions } = await import(
  "../lib/data/concepts.ts"
);

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const SEED_CONTRIBUTOR_ID = "11111111-1111-4111-8111-111111111111";
const AI_CONTRIBUTOR_ID = "22222222-2222-4222-8222-222222222222";

function uuidFor(mockId) {
  const hex = createHash("md5").update(`yarn-seed:${mockId}`).digest("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function lit(value) {
  if (value === null || value === undefined) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return String(value);
  return `'${String(value).replace(/'/g, "''")}'`;
}

function textArray(values) {
  return `array[${values.map((v) => lit(v)).join(", ")}]::text[]`;
}

const concepts = getAllConcepts();
const expressions = getAllExpressions();

const lines = [];
lines.push(`-- ============================================================================
-- YARN content seed — GENERATED FILE, do not edit by hand.
-- Regenerate with: npm run seed:generate  (source: lib/data/concepts.ts)
--
-- Language-data rules (AGENTS.md) apply to every row here: attested
-- standard-variety phrases only, diacritics preserved, no invented dialect
-- forms, AI suggestions never verified. votes_count is intentionally 0.
-- ============================================================================
`);

lines.push(`insert into contributors (id, user_id, display_name, kind, is_reviewer) values
  ('${SEED_CONTRIBUTOR_ID}', null, 'YARN editorial seed', 'seed', false),
  ('${AI_CONTRIBUTOR_ID}', null, 'AI suggestion (unreviewed)', 'ai', false);
`);

// Sources, unique by mock id.
const sourcesById = new Map();
for (const expression of expressions) {
  for (const source of expression.sources) {
    sourcesById.set(source.id, source);
  }
}
lines.push("insert into sources (id, title, url, is_placeholder) values");
lines.push(
  [...sourcesById.values()]
    .map(
      (s) =>
        `  ('${uuidFor(s.id)}', ${lit(s.title)}, ${lit(s.url ?? null)}, ${lit(Boolean(s.isPlaceholder))})`,
    )
    .join(",\n") + ";\n",
);

lines.push(
  "insert into concepts (id, slug, title, description, category, search_terms, position) values",
);
lines.push(
  concepts
    .map(
      (c, i) =>
        `  ('${uuidFor(c.id)}', ${lit(c.slug)}, ${lit(c.title)}, ${lit(c.description)}, ${lit(c.category)}, ${textArray(c.searchTerms)}, ${i})`,
    )
    .join(",\n") + ";\n",
);

lines.push(
  "insert into expressions (id, concept_id, language_code, variant_id, text, literal_meaning, natural_meaning, usage_note, register, pronunciation_note, position, contributor_id, verification_status, dispute_note, votes_count) values",
);
lines.push(
  expressions
    .map((e, i) => {
      const contributorId =
        e.contributor.kind === "ai" ? AI_CONTRIBUTOR_ID : SEED_CONTRIBUTOR_ID;
      return `  ('${uuidFor(e.id)}', '${uuidFor(e.conceptId)}', ${lit(e.languageCode)}, ${lit(e.variantId)}, ${lit(e.text)}, ${lit(e.literalMeaning)}, ${lit(e.naturalMeaning)}, ${lit(e.usageNote ?? null)}, ${lit(e.register)}, ${lit(e.pronunciationNote ?? null)}, ${i}, '${contributorId}', ${lit(e.verificationStatus)}, ${lit(e.disputeNote ?? null)}, 0)`;
    })
    .join(",\n") + ";\n",
);

const exampleRows = expressions
  .filter((e) => e.example)
  .map(
    (e) =>
      `  ('${uuidFor(`example:${e.id}`)}', '${uuidFor(e.id)}', ${lit(e.example.text)}, ${lit(e.example.translation)}, '${e.contributor.kind === "ai" ? AI_CONTRIBUTOR_ID : SEED_CONTRIBUTOR_ID}', 0)`,
  );
if (exampleRows.length > 0) {
  lines.push(
    "insert into examples (id, expression_id, text, translation, contributor_id, position) values",
  );
  lines.push(exampleRows.join(",\n") + ";\n");
}

const linkRows = expressions.flatMap((e) =>
  e.sources.map(
    (s) => `  ('${uuidFor(e.id)}', '${uuidFor(s.id)}')`,
  ),
);
lines.push("insert into expression_sources (expression_id, source_id) values");
lines.push(linkRows.join(",\n") + ";\n");

const outPath = join(root, "supabase", "migrations", "0002_seed_content.sql");
writeFileSync(outPath, lines.join("\n"), "utf8");
console.log(
  `wrote ${outPath}: ${concepts.length} concepts, ${expressions.length} expressions, ${sourcesById.size} sources, ${exampleRows.length} examples, ${linkRows.length} source links`,
);

import Link from "next/link";
import SearchBox from "@/components/SearchBox";
import { getConceptsWithExpressions } from "@/lib/data/provider";
import { LANGUAGE_ORDER, getLanguage } from "@/lib/data/languages";

// Content changes only when contributors submit or reviewers act;
// re-render at most every 5 minutes when Supabase is the backend.
export const revalidate = 300;

export default async function HomePage() {
  const entries = await getConceptsWithExpressions();
  const categories = [...new Set(entries.map((e) => e.concept.category))];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <section className="mx-auto max-w-2xl pt-14 pb-10 text-center sm:pt-20">
        <h1 className="font-serif text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          What do you want to say?
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-ink-soft">
          YARN maps a shared idea to the expression people actually use in{" "}
          <strong className="font-semibold">English</strong>,{" "}
          <strong className="font-semibold">Hausa</strong>,{" "}
          <strong className="font-semibold">Igbo</strong>, and{" "}
          <strong className="font-semibold" lang="yo">
            Yorùbá
          </strong>{" "}
          — never a word-for-word translation.
        </p>
        <div className="mt-8 text-left">
          <SearchBox />
        </div>
      </section>

      <section aria-labelledby="browse-heading" id="browse" className="pb-8 pt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-rule-strong pb-3">
          <h2 id="browse-heading" className="font-serif text-2xl font-semibold">
            Browse concepts
          </h2>
          <p className="text-sm text-muted">
            {entries.length} concepts · 4 languages
          </p>
        </div>

        {categories.map((category) => (
          <div key={category} className="mt-8">
            <h3 className="label-caps">{category}</h3>
            <ul className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {entries
                .filter((entry) => entry.concept.category === category)
                .map(({ concept, expressions }, index) => {
                  const coveredLanguages = LANGUAGE_ORDER.filter((code) =>
                    expressions.some((e) => e.languageCode === code),
                  );
                  // Rotate which language the preview quotes so the grid
                  // doesn't read as a Hausa-only dictionary.
                  const previewOrder = (["ha", "ig", "yo"] as const).slice(
                    index % 3,
                  );
                  const preview =
                    previewOrder
                      .map((code) =>
                        expressions.find((e) => e.languageCode === code),
                      )
                      .find(Boolean) ??
                    expressions.find((e) => e.languageCode !== "en");
                  return (
                    <li key={concept.id}>
                      <Link
                        href={`/concept/${concept.slug}`}
                        className="block h-full rounded-md border border-rule bg-paper-raised p-5 transition-colors hover:border-rule-strong"
                      >
                        <span className="font-serif text-lg leading-snug text-ink">
                          {concept.title}
                        </span>
                        {preview && (
                          <span className="mt-2 block font-serif italic text-ink-soft">
                            <span lang={preview.languageCode}>
                              “{preview.text}”
                            </span>{" "}
                            <span className="not-italic text-sm text-muted">
                              — {getLanguage(preview.languageCode).name}
                            </span>
                          </span>
                        )}
                        <span className="mt-3 block text-xs text-muted">
                          {coveredLanguages
                            .map((code) => getLanguage(code).name)
                            .join(" · ")}
                        </span>
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}

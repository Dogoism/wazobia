import type { ConceptWithExpressions } from "@/lib/types";
import { LANGUAGE_ORDER, getLanguage, variantsFor } from "@/lib/data/languages";
import LanguageColumn from "@/components/LanguageColumn";

/**
 * The primary comparison screen: English | Hausa | Igbo | Yorùbá side by
 * side on large screens; a horizontally snapping card scroller below the
 * `lg` breakpoint.
 */
export default function ConceptComparison({
  data,
}: {
  data: ConceptWithExpressions;
}) {
  return (
    <div
      className="card-scroller -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-5 lg:overflow-visible lg:px-0 lg:pb-0"
      role="group"
      aria-label="Expressions by language"
    >
      {LANGUAGE_ORDER.map((code) => (
        <div
          key={code}
          className="w-[85vw] max-w-sm shrink-0 snap-center lg:w-auto lg:max-w-none lg:shrink"
        >
          <LanguageColumn
            language={getLanguage(code)}
            variants={variantsFor(code)}
            expressions={data.expressions.filter(
              (e) => e.languageCode === code,
            )}
          />
        </div>
      ))}
    </div>
  );
}

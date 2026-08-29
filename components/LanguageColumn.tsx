"use client";

import { useId, useMemo, useState } from "react";
import type { Expression, Language, LanguageVariant } from "@/lib/types";
import ExpressionEntry from "@/components/ExpressionEntry";

/**
 * One language's card on the comparison screen, with its own
 * regional/dialect selector. When the selected variety has no data yet,
 * we say so plainly — we never substitute a guessed standard form as if
 * it were the regional one.
 */
export default function LanguageColumn({
  language,
  variants,
  expressions,
}: {
  language: Language;
  variants: LanguageVariant[];
  expressions: Expression[];
}) {
  const selectId = useId();
  const standardVariant = variants.find((v) => v.isStandard) ?? variants[0];
  const [selectedVariantId, setSelectedVariantId] = useState(
    standardVariant.id,
  );

  const selectedVariant =
    variants.find((v) => v.id === selectedVariantId) ?? standardVariant;

  const visibleExpressions = useMemo(
    () => expressions.filter((e) => e.variantId === selectedVariantId),
    [expressions, selectedVariantId],
  );

  const standardExpressions = useMemo(
    () => expressions.filter((e) => e.variantId === standardVariant.id),
    [expressions, standardVariant.id],
  );

  const showSelector = variants.length > 1;
  const isRegionalEmpty =
    visibleExpressions.length === 0 && !selectedVariant.isStandard;

  return (
    <section
      aria-label={language.name}
      className="flex h-full flex-col rounded-md border border-rule bg-paper-raised"
    >
      <header className="border-b border-rule px-5 py-4">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-serif text-lg font-semibold">{language.name}</h2>
          <span
            lang={language.code === "en" ? undefined : language.code}
            className="truncate text-xs text-muted"
          >
            {language.nativeName}
          </span>
        </div>
        {showSelector && (
          <div className="mt-3">
            <label htmlFor={selectId} className="label-caps block">
              Region / dialect
            </label>
            <select
              id={selectId}
              value={selectedVariantId}
              onChange={(event) => setSelectedVariantId(event.target.value)}
              className="mt-1 w-full rounded-sm border border-rule-strong bg-paper px-2 py-1.5 text-sm text-ink"
            >
              {variants.map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {variant.name}
                  {variant.regionNote ? ` — ${variant.regionNote}` : ""}
                </option>
              ))}
            </select>
          </div>
        )}
      </header>

      <div className="flex-1 space-y-5 px-5 py-5">
        {visibleExpressions.length > 0 ? (
          visibleExpressions.map((expression) => (
            <ExpressionEntry key={expression.id} expression={expression} />
          ))
        ) : isRegionalEmpty ? (
          <div>
            <div
              className="rounded-sm px-3 py-3 text-sm"
              style={{ backgroundColor: "var(--pending-bg)" }}
            >
              <p className="font-medium" style={{ color: "var(--pending)" }}>
                {selectedVariant.name} version pending native-speaker
                verification
              </p>
              <p className="mt-1 text-ink-soft">
                No one has verified how this is said in{" "}
                {selectedVariant.name} yet. We don’t fill the gap with a
                guess.
              </p>
            </div>
            {standardExpressions.length > 0 && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-ink-soft underline-offset-4 hover:underline">
                  Show the {standardVariant.name} form for reference
                </summary>
                <div className="mt-4 space-y-5 border-l-2 border-rule pl-4">
                  {standardExpressions.map((expression) => (
                    <ExpressionEntry
                      key={expression.id}
                      expression={expression}
                    />
                  ))}
                </div>
              </details>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted">
            No entry recorded for this concept yet.
          </p>
        )}
      </div>
    </section>
  );
}

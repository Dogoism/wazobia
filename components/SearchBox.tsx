"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { searchConcepts, matchedLanguageLabel } from "@/lib/search";
import { getLanguage } from "@/lib/data/languages";

/**
 * The "What do you want to say?" search. Resolves free text — an English
 * phrase, a paraphrased intent, or an existing Hausa/Igbo/Yorùbá
 * expression — to concepts.
 */
export default function SearchBox({ autoFocus }: { autoFocus?: boolean }) {
  const inputId = useId();
  const [query, setQuery] = useState("");
  const hits = useMemo(() => searchConcepts(query).slice(0, 6), [query]);
  const showResults = query.trim().length >= 2;

  return (
    <div className="w-full">
      <label htmlFor={inputId} className="label-caps mb-2 block">
        Search a phrase, a meaning, or an intent
      </label>
      <input
        id={inputId}
        type="search"
        autoFocus={autoFocus}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Try “long time no see” or “kwana biyu”…"
        autoComplete="off"
        spellCheck={false}
        className="w-full rounded-md border border-rule-strong bg-paper-raised px-4 py-3 font-serif text-lg text-ink placeholder:text-muted/70"
      />

      <div aria-live="polite">
        {showResults && (
          <>
            <p className="sr-only">
              {hits.length === 1
                ? "1 matching concept"
                : `${hits.length} matching concepts`}
            </p>
            {hits.length > 0 ? (
              <ul className="mt-3 divide-y divide-rule rounded-md border border-rule bg-paper-raised">
                {hits.map((hit) => {
                  const matched = matchedLanguageLabel(hit);
                  return (
                    <li key={hit.concept.id}>
                      <Link
                        href={`/concept/${hit.concept.slug}`}
                        className="block px-4 py-3 hover:bg-accent-soft/40"
                      >
                        <span className="font-serif text-base text-ink">
                          {hit.concept.title}
                        </span>
                        {matched && matched.code !== "en" && (
                          <span className="mt-0.5 block text-xs text-muted">
                            matches{" "}
                            <span lang={matched.code} className="font-serif">
                              {matched.text}
                            </span>{" "}
                            ({getLanguage(matched.code).name})
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-3 rounded-md border border-rule bg-paper-raised px-4 py-3 text-sm text-muted">
                Nothing matches yet. The dictionary is young — try a
                greeting, thanks, or sympathy.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

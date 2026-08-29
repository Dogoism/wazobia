"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import type { SearchResult } from "@/lib/types";
import { getLanguage } from "@/lib/data/languages";

interface SearchState {
  /** The query these results answer — stale responses never display. */
  query: string;
  results: SearchResult[];
  failed: boolean;
}

/**
 * The "What do you want to say?" search. Resolves free text — an English
 * phrase, a paraphrased intent, or an existing Hausa/Igbo/Yorùbá
 * expression — to concepts via /api/search (mock or Supabase behind the
 * same contract).
 */
export default function SearchBox() {
  const inputId = useId();
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState<SearchState | null>(null);

  const trimmed = query.trim();

  useEffect(() => {
    if (trimmed.length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error(`search failed: ${response.status}`);
        const body = (await response.json()) as { results: SearchResult[] };
        setSearch({ query: trimmed, results: body.results, failed: false });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setSearch({ query: trimmed, results: [], failed: true });
      }
    }, 150);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [trimmed]);

  const current = search !== null && search.query === trimmed ? search : null;
  const showResults = trimmed.length >= 2 && current !== null;
  const results = current?.results ?? [];
  const failed = current?.failed ?? false;

  return (
    <div className="w-full">
      <label htmlFor={inputId} className="label-caps mb-2 block">
        Search a phrase, a meaning, or an intent
      </label>
      <input
        id={inputId}
        type="search"
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
              {results.length === 1
                ? "1 matching concept"
                : `${results.length} matching concepts`}
            </p>
            {results.length > 0 ? (
              <ul className="mt-3 divide-y divide-rule rounded-md border border-rule bg-paper-raised">
                {results.map((result) => (
                  <li key={result.slug}>
                    <Link
                      href={`/concept/${result.slug}`}
                      className="block px-4 py-3 hover:bg-accent-soft/40"
                    >
                      <span className="font-serif text-base text-ink">
                        {result.title}
                      </span>
                      {result.matchedText &&
                        result.matchedLanguageCode &&
                        result.matchedLanguageCode !== "en" && (
                          <span className="mt-0.5 block text-xs text-muted">
                            matches{" "}
                            <span
                              lang={result.matchedLanguageCode}
                              className="font-serif"
                            >
                              {result.matchedText}
                            </span>{" "}
                            ({getLanguage(result.matchedLanguageCode).name})
                          </span>
                        )}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 rounded-md border border-rule bg-paper-raised px-4 py-3 text-sm text-muted">
                {failed
                  ? "Search is unavailable right now — please try again."
                  : "Nothing matches yet. The dictionary is young — try a greeting, thanks, or sympathy."}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

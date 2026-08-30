import type { Expression } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";

const REGISTER_LABEL: Record<Expression["register"], string> = {
  neutral: "Neutral",
  formal: "Formal",
  respectful: "Respectful",
  casual: "Casual",
  intimate: "Intimate",
};

/**
 * One dictionary entry. The layout keeps literal meaning and natural
 * meaning visually separate — the product's core distinction.
 */
export default function ExpressionEntry({
  expression,
}: {
  expression: Expression;
}) {
  return (
    <article className="border-t border-rule pt-4 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <p
          lang={expression.languageCode === "en" ? undefined : expression.languageCode}
          className="font-serif text-2xl leading-snug text-ink"
        >
          {expression.text}
        </p>
        <StatusBadge status={expression.verificationStatus} />
      </div>

      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted">
        <span className="rounded-sm border border-rule px-1.5 py-0.5">
          {REGISTER_LABEL[expression.register]}
        </span>
        {expression.pronunciationNote && (
          <span aria-label="Pronunciation guide">
            🗣 {expression.pronunciationNote}
          </span>
        )}
      </div>

      <dl className="mt-3 space-y-2 text-sm">
        {expression.literalMeaning !== null ? (
          <div>
            <dt className="label-caps">Literally</dt>
            <dd className="mt-0.5 font-serif italic text-ink-soft">
              “{expression.literalMeaning}”
            </dd>
          </div>
        ) : expression.languageCode !== "en" ? (
          // A null literal for English means "not applicable" (English is
          // the gloss language); for the other languages it means a
          // faithful gloss hasn't been verified yet — say so, don't guess.
          <div>
            <dt className="label-caps">Literally</dt>
            <dd className="mt-0.5 text-muted">
              Word-for-word gloss pending native-speaker verification.
            </dd>
          </div>
        ) : null}
        <div>
          <dt className="label-caps">Naturally means</dt>
          <dd className="mt-0.5 text-ink">{expression.naturalMeaning}</dd>
        </div>
        {expression.usageNote && (
          <div>
            <dt className="label-caps">Usage</dt>
            <dd className="mt-0.5 text-ink-soft">{expression.usageNote}</dd>
          </div>
        )}
        {expression.disputeNote && (
          <div
            className="rounded-sm px-2.5 py-2"
            style={{ backgroundColor: "var(--disputed-bg)" }}
          >
            <dt
              className="label-caps"
              style={{ color: "var(--disputed)" }}
            >
              Why this is disputed
            </dt>
            <dd className="mt-0.5 text-ink-soft">{expression.disputeNote}</dd>
          </div>
        )}
        {expression.example && (
          <div>
            <dt className="label-caps">Example</dt>
            <dd className="mt-0.5">
              <span
                lang={
                  expression.languageCode === "en"
                    ? undefined
                    : expression.languageCode
                }
                className="font-serif text-ink"
              >
                {expression.example.text}
              </span>
              <span className="block text-muted">
                {expression.example.translation}
              </span>
            </dd>
          </div>
        )}
      </dl>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
        <span title="Community agreement">▲ {expression.votes}</span>
        <span aria-hidden="true">·</span>
        <span>{expression.contributor.displayName}</span>
        <span aria-hidden="true">·</span>
        {expression.audio.length > 0 ? (
          <span>Audio available</span>
        ) : (
          <span>No audio yet</span>
        )}
        {expression.sources.map((source) => (
          <span key={source.id} className="basis-full sm:basis-auto">
            {source.url ? (
              <a
                href={source.url}
                className="underline decoration-rule-strong underline-offset-2 hover:text-ink-soft"
                target="_blank"
                rel="noreferrer"
              >
                {source.title}
              </a>
            ) : (
              <span className={source.isPlaceholder ? "italic" : undefined}>
                {source.title}
              </span>
            )}
          </span>
        ))}
      </div>
    </article>
  );
}

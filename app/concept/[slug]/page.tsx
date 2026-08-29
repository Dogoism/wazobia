import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ConceptComparison from "@/components/ConceptComparison";
import { statusLabel } from "@/components/StatusBadge";
import { getAllConcepts, getConceptBySlug } from "@/lib/data/concepts";
import type { VerificationStatus } from "@/lib/types";

export function generateStaticParams() {
  return getAllConcepts().map((concept) => ({ slug: concept.slug }));
}

export async function generateMetadata(
  props: PageProps<"/concept/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const data = getConceptBySlug(slug);
  if (!data) return { title: "Concept not found" };
  return {
    title: data.concept.title,
    description: data.concept.description,
  };
}

const LEGEND_ORDER: VerificationStatus[] = [
  "verified",
  "community",
  "pending",
  "disputed",
  "ai_suggestion",
];

const LEGEND_TEXT: Record<VerificationStatus, string> = {
  verified: "confirmed by a trusted native-speaker reviewer.",
  community: "contributed by a member; review not yet complete.",
  pending: "awaiting review.",
  disputed: "accuracy or usage is contested; the entry says why.",
  ai_suggestion: "machine-suggested; never shown as verified.",
};

export default async function ConceptPage(props: PageProps<"/concept/[slug]">) {
  const { slug } = await props.params;
  const data = getConceptBySlug(slug);
  if (!data) notFound();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <nav aria-label="Breadcrumb" className="pt-8 text-sm text-muted">
        <Link href="/" className="underline-offset-4 hover:underline">
          All concepts
        </Link>{" "}
        <span aria-hidden="true">/</span>{" "}
        <span className="text-ink-soft">{data.concept.category}</span>
      </nav>

      <header className="max-w-3xl pb-10 pt-4">
        <p className="label-caps">Concept</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          {data.concept.title}
        </h1>
        <p className="mt-3 text-base text-ink-soft">
          {data.concept.description}
        </p>
      </header>

      <ConceptComparison data={data} />

      <p className="mt-3 text-center text-xs text-muted lg:hidden">
        Swipe sideways to compare languages →
      </p>

      <section
        aria-labelledby="legend-heading"
        className="mx-auto mt-12 max-w-3xl rounded-md border border-rule bg-paper-raised px-5 py-4"
      >
        <h2 id="legend-heading" className="label-caps">
          How to read the labels
        </h2>
        <ul className="mt-2 space-y-1 text-sm text-ink-soft">
          {LEGEND_ORDER.map((status) => (
            <li key={status}>
              <span className="font-semibold text-ink">
                {statusLabel(status)}
              </span>{" "}
              — {LEGEND_TEXT[status]}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

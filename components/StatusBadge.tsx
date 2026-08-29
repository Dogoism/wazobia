import type { VerificationStatus } from "@/lib/types";

const STATUS_CONFIG: Record<
  VerificationStatus,
  { label: string; fg: string; bg: string; title: string }
> = {
  verified: {
    label: "Verified",
    fg: "var(--verified)",
    bg: "var(--verified-bg)",
    title: "Confirmed by a trusted native-speaker reviewer",
  },
  community: {
    label: "Community",
    fg: "var(--community)",
    bg: "var(--community-bg)",
    title: "Submitted by a contributor; not yet fully reviewed",
  },
  pending: {
    label: "Pending verification",
    fg: "var(--pending)",
    bg: "var(--pending-bg)",
    title: "Awaiting native-speaker review",
  },
  disputed: {
    label: "Disputed",
    fg: "var(--disputed)",
    bg: "var(--disputed-bg)",
    title: "Accuracy or usage is contested — read the dispute note",
  },
  ai_suggestion: {
    label: "AI suggestion",
    fg: "var(--ai)",
    bg: "var(--ai-bg)",
    title: "Machine-suggested and unverified — treat with caution",
  },
};

export function statusLabel(status: VerificationStatus): string {
  return STATUS_CONFIG[status].label;
}

export default function StatusBadge({
  status,
}: {
  status: VerificationStatus;
}) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-wide"
      style={{ color: config.fg, backgroundColor: config.bg }}
      title={config.title}
    >
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: config.fg }}
      />
      {config.label}
    </span>
  );
}

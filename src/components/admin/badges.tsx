import {
  clientStageLabels,
  galleryStatusLabels,
  type ClientStage,
  type GalleryStatus,
} from "@/lib/types";

const stageTone: Record<ClientStage, string> = {
  lead: "border-brass-2/60 text-brass-2",
  awaiting_payment: "border-brass/60 text-ink-2",
  booked: "border-success/50 text-success",
  proofing: "border-ink/40 text-ink",
  delivered: "border-line text-muted",
  archived: "border-line text-muted",
};

export function StageBadge({ stage }: { stage: ClientStage }) {
  return <span className={`badge whitespace-nowrap ${stageTone[stage]}`}>{clientStageLabels[stage]}</span>;
}

const galleryTone: Record<GalleryStatus, string> = {
  draft: "border-line text-muted",
  published: "border-success/50 text-success",
  archived: "border-line text-muted",
};

export function GalleryStatusBadge({ status }: { status: GalleryStatus }) {
  return <span className={`badge whitespace-nowrap ${galleryTone[status]}`}>{galleryStatusLabels[status]}</span>;
}

export function formatDate(value: string | null | undefined, withYear = false) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(withYear ? { year: "numeric" } : {}),
  });
}

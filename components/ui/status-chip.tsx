import { cn } from "@/lib/utils";
import { type DocumentStatus } from "@/lib/types";

const statusMap: Record<DocumentStatus, string> = {
  queued: "bg-slate-100 text-slate-700",
  processing: "bg-amber-100 text-amber-700",
  ready: "bg-emerald-100 text-emerald-700",
  error: "bg-rose-100 text-rose-700",
};

export function StatusChip({ status, label }: { status: DocumentStatus; label: string }) {
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", statusMap[status])}>
      {label}
    </span>
  );
}

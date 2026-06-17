import { cn } from "@/lib/utils";

const presets: Record<string, string> = {
  // generic
  ACTIVE: "bg-green-100 text-green-700",
  INACTIVE: "bg-slate-100 text-slate-600",
  DRAFT: "bg-slate-100 text-slate-600",
  // sample
  PENDING: "bg-yellow-100 text-yellow-700",
  RECEIVED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-indigo-100 text-indigo-700",
  COMPLETED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  DISPOSED: "bg-slate-200 text-slate-500",
  // order
  SUBMITTED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-red-100 text-red-700",
  // result
  ENTERED: "bg-indigo-100 text-indigo-700",
  VALIDATED: "bg-blue-100 text-blue-700",
  APPROVED: "bg-green-100 text-green-700",
  // instrument
  UNDER_MAINTENANCE: "bg-orange-100 text-orange-700",
  DECOMMISSIONED: "bg-slate-200 text-slate-500",
  // method
  UNDER_REVIEW: "bg-yellow-100 text-yellow-700",
  DEPRECATED: "bg-slate-200 text-slate-500",
  // calibration
  CALIBRATED: "bg-green-100 text-green-700",
  DUE_SOON: "bg-yellow-100 text-yellow-700",
  OVERDUE: "bg-red-100 text-red-700",
  NOT_REQUIRED: "bg-slate-100 text-slate-500",
  // finding
  OPEN: "bg-red-100 text-red-700",
  CLOSED: "bg-green-100 text-green-700",
  // severity
  LOW: "bg-slate-100 text-slate-600",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HIGH: "bg-orange-100 text-orange-700",
  CRITICAL: "bg-red-100 text-red-700",
  // report
  ISSUED: "bg-green-100 text-green-700",
  ARCHIVED: "bg-slate-200 text-slate-500",
  // priority
  ROUTINE: "bg-slate-100 text-slate-600",
  URGENT: "bg-orange-100 text-orange-700",
  STAT: "bg-red-100 text-red-700",
};

interface LimsStatusBadgeProps {
  status: string | null | undefined;
  className?: string;
}

export function LimsStatusBadge({ status, className }: LimsStatusBadgeProps) {
  const safeStatus = status ?? "";
  const colors = presets[safeStatus] ?? "bg-slate-100 text-slate-600";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        colors,
        className
      )}
    >
      {safeStatus.replace(/_/g, " ")}
    </span>
  );
}

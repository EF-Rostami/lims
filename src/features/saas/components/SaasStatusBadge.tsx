type SaasStatusBadgeProps = {
  status: "active" | "inactive" | "pending" | "failed" | "success";
};

const statusClasses: Record<SaasStatusBadgeProps["status"], string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-slate-100 text-slate-700",
  pending: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
  success: "bg-green-100 text-green-700",
};

export function SaasStatusBadge({ status }: SaasStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses[status]}`}
    >
      {status}
    </span>
  );
}
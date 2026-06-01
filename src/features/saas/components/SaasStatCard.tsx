type SaasStatCardProps = {
  label: string;
  value: string | number;
  description?: string;
};

export function SaasStatCard({
  label,
  value,
  description,
}: SaasStatCardProps) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>

      <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>

      {description && (
        <p className="mt-2 text-sm text-slate-500">{description}</p>
      )}
    </div>
  );
}
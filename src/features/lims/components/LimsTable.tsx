import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Column<T> {
  header: string;
  className?: string;
  render: (row: T) => ReactNode;
}

interface LimsTableProps<T extends { id: number }> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function LimsTable<T extends { id: number }>({
  columns,
  data,
  isLoading,
  emptyMessage = "No records found.",
}: LimsTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-slate-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.header}
                className={cn("px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500", col.className)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-400">
                Loading…
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={row.id} className="border-b last:border-0 hover:bg-slate-50/60 transition-colors">
                {columns.map((col) => (
                  <td key={col.header} className={cn("px-4 py-3 text-slate-700", col.className)}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

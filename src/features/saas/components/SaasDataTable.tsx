import React from "react";

type Column<T> = {
  header: string;
  accessor?: keyof T;
  render?: (row: T) => React.ReactNode;
};

type SaasDataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
};

export function SaasDataTable<T extends { id: string }>({
  columns,
  data,
}: SaasDataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-slate-50 text-slate-600">
          <tr>
            {columns.map((column) => (
              <th key={column.header} className="px-4 py-3 font-medium">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row) => (
            <tr key={row.id} className="border-b last:border-0">
              {columns.map((column) => (
                <td key={column.header} className="px-4 py-3 text-slate-700">
                  {column.render
                    ? column.render(row)
                    : column.accessor
                      ? String(row[column.accessor])
                      : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
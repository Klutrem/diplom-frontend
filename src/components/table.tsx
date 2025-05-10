import { ReactNode } from "react";

interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: T[keyof T], item: T) => ReactNode;
}

interface TableProps<T> {
  title: string;
  data: T[];
  columns: Column<T>[];
}

export default function Table<T>({ title, data, columns }: TableProps<T>) {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-black">{title}</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              {columns.map((col) => (
                <th key={String(col.key)} className="py-3 px-6 text-left">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {data.map((item, index) => (
              <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                {columns.map((col) => (
                  <td key={String(col.key)} className="py-3 px-6 text-left">
                    {col.render ? (
                      col.render(item[col.key], item)
                    ) : (
                      <span>{String(item[col.key])}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
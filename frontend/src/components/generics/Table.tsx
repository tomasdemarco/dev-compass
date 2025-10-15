import React from "react";
import { Button } from "./Button";
import { BackIcon, FrontIcon } from "./Icons";
import ItemMenu from './ItemMenu';

import { cn } from "@/lib/utils";

// --- Type Definitions for the new API ---

// The 'item' passed to the actions menu needs to have an id
interface ItemWithId {
    id?: string | number;
}

// The menu item type, assuming it's defined in ItemMenu or passed to it
// Re-exporting for convenience in pages that use this Table
export interface MenuItem {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
}

export interface ColumnDef<TData> {
  accessorKey: keyof TData | string; // Allow string for nested access, though we won't implement deep access yet
  header: React.ReactNode;
  // The cell function gets the entire row's data
  cell?: (props: { row: TData }) => React.ReactNode;
}

interface TableProps<TData extends ItemWithId> {
  data: TData[];
  columns: ColumnDef<TData>[];
  onRowClick?: (row: TData) => void; // <-- ADDED PROP
  // Pagination Props
  page?: number;
  numberPages?: number;
  onClickPreviousPage?: () => void;
  onClickNextPage?: () => void;
  disabledButtonPrevious?: boolean;
  disabledButtonNext?: boolean;
  // Actions Prop
  actions?: (item: TData) => MenuItem[];
}

// --- The new Table Component ---

const Table = <TData extends ItemWithId>({
  data,
  columns,
  onRowClick,
  page,
  numberPages,
  onClickPreviousPage,
  onClickNextPage,
  disabledButtonPrevious,
  disabledButtonNext,
  actions,
}: TableProps<TData>) => {

  const showPagination = page !== undefined && numberPages !== undefined;

  if (!data || data.length === 0) {
    return (
      <div className="flex justify-center items-center h-40 rounded-lg shadow-sm shadow-secondary-gp/25 ring-1 ring-inset ring-gray/25">
        <p className="text-muted-foreground">No hay datos para mostrar.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Table container */}
      <div className="overflow-x-auto rounded-lg shadow-sm shadow-secondary-gp/25 ring-1 ring-inset ring-gray/25 text-sm">
        <table className="table-auto w-full text-left">
          <thead className="bg-muted uppercase text-xs text-muted-foreground">
            <tr className="border-b border-border">
              {columns.map((column, index) => (
                <th key={String(column.accessorKey) + index} className="px-4 py-3 font-medium">
                  {column.header}
                </th>
              ))}
              {actions && <th className="px-4 py-3 max-w-sm text-center font-medium">Acciones</th>}
            </tr>
          </thead>
          <tbody className="bg-black/5 dark:bg-white/5 divide-y divide-border">
            {data.map((row, rowIndex) => (
              <tr 
                key={row.id || rowIndex} 
                className={cn(
                  "hover:bg-black/10 dark:hover:bg-white/10",
                  onRowClick && "cursor-pointer"
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column, colIndex) => {
                  // Basic accessor, does not handle dot notation for nested objects yet
                  const value = row[column.accessorKey as keyof TData];
                  return (
                    <td key={String(column.accessorKey) + colIndex} className="px-4 py-3 max-w-sm overflow-hidden text-ellipsis">
                      {column.cell ? column.cell({ row }) : String(value)}
                    </td>
                  );
                })}
                {actions && (
                  <td className="px-4 py-3 max-w-sm text-ellipsis text-center relative">
                    <ItemMenu items={actions(row)} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {showPagination && (
          <div className="flex items-center justify-between mt-4">
              <span className="text-sm font-semibold">{`Página ${page} de ${numberPages}`}</span>
              <div className="flex items-center gap-2">
                  <Button
                      variant="outline"
                      size="sm"
                      onClick={onClickPreviousPage}
                      disabled={disabledButtonPrevious}
                  >
                      Anterior
                  </Button>
                  <Button
                      variant="outline"
                      size="sm"
                      onClick={onClickNextPage}
                      disabled={disabledButtonNext}
                  >
                      Siguiente
                  </Button>
              </div>
          </div>
      )}
    </div>
  );
};

export default Table;
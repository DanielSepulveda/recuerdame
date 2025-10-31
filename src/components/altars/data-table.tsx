"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  // URL state from nuqs
  page: number;
  pageSize: number;
  search: string;
  roleFilter: string;
  sortBy: string;
  sortOrder: string;
  // Setters for URL state
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSearchChange: (search: string) => void;
  onRoleFilterChange: (role: string) => void;
  onSortChange: (sortBy: string, sortOrder: string) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  page,
  pageSize,
  search,
  roleFilter,
  sortBy,
  sortOrder,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  onRoleFilterChange,
  onSortChange,
}: DataTableProps<TData, TValue>) {
  // Build sorting state from URL params
  const sorting: SortingState =
    sortBy && sortOrder
      ? [{ id: sortBy, desc: sortOrder === "desc" }]
      : [{ id: "createdAt", desc: true }]; // Default: newest first

  // Build column filters from URL params
  const columnFilters: ColumnFiltersState = [];
  if (search) {
    columnFilters.push({ id: "title", value: search });
  }
  if (roleFilter && roleFilter !== "all") {
    columnFilters.push({ id: "userRole", value: roleFilter });
  }

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: (updater) => {
      const newSorting =
        typeof updater === "function" ? updater(sorting) : updater;
      if (newSorting.length > 0) {
        const sort = newSorting[0];
        onSortChange(sort.id, sort.desc ? "desc" : "asc");
      }
    },
    state: {
      sorting,
      columnFilters,
      pagination: {
        pageIndex: page - 1, // TanStack uses 0-based
        pageSize,
      },
    },
    manualPagination: false,
  });

  // Sync table page with URL when table changes internally
  const currentTablePage = table.getState().pagination.pageIndex + 1;
  if (currentTablePage !== page) {
    onPageChange(currentTablePage);
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Buscar por título..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2">
          <Select value={roleFilter} onValueChange={onRoleFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="owner">Propietario</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No se encontraron altares.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Página {table.getState().pagination.pageIndex + 1} de{" "}
          {table.getPageCount()} (
          {table.getFilteredRowModel().rows.length} altares)
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              table.previousPage();
              onPageChange(table.getState().pagination.pageIndex);
            }}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              table.nextPage();
              onPageChange(table.getState().pagination.pageIndex + 2);
            }}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}

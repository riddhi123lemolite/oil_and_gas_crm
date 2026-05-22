import { useMemo, useState, type ReactNode } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
} from '@tanstack/react-table';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Download,
  SlidersHorizontal,
  Rows3,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmptyState } from './EmptyState';
import { TableSkeleton } from '@/components/ui/skeleton';
import { exportToExcel } from '@/lib/excel';
import { cn } from '@/lib/utils';

interface DataTableProps<T> {
  columns: ColumnDef<T, unknown>[];
  data: T[];
  getRowId?: (row: T) => string;
  onRowClick?: (row: T) => void;
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  enableSelection?: boolean;
  bulkActions?: (selected: T[], clear: () => void) => ReactNode;
  toolbar?: ReactNode;
  exportName?: string;
  exportMapper?: (row: T) => Record<string, unknown>;
  pageSize?: number;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  rowClassName?: (row: T) => string;
}

type Density = 'compact' | 'normal' | 'comfortable';

const DENSITY_PAD: Record<Density, string> = {
  compact: 'py-1.5',
  normal: 'py-2.5',
  comfortable: 'py-3.5',
};

export function DataTable<T extends object>({
  columns,
  data,
  getRowId,
  onRowClick,
  searchPlaceholder = 'Search…',
  searchKeys,
  enableSelection,
  bulkActions,
  toolbar,
  exportName,
  exportMapper,
  pageSize = 12,
  loading,
  emptyTitle = 'Nothing here yet',
  emptyDescription = 'Records will appear here once added.',
  rowClassName,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [density, setDensity] = useState<Density>('normal');

  const allColumns = useMemo<ColumnDef<T, unknown>[]>(() => {
    if (!enableSelection) return columns;
    const selectCol: ColumnDef<T, unknown> = {
      id: '__select',
      size: 36,
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected()
              ? true
              : table.getIsSomePageRowsSelected()
                ? 'indeterminate'
                : false
          }
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
    };
    return [selectCol, ...columns];
  }, [columns, enableSelection]);

  const table = useReactTable({
    data,
    columns: allColumns,
    state: { sorting, globalFilter, rowSelection },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getRowId: getRowId
      ? (row) => getRowId(row)
      : undefined,
    globalFilterFn: searchKeys
      ? (row, _col, filterValue) => {
          const needle = String(filterValue).toLowerCase();
          return searchKeys.some((key) =>
            String(row.original[key] ?? '')
              .toLowerCase()
              .includes(needle),
          );
        }
      : 'includesString',
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  const selectedRows = table
    .getSelectedRowModel()
    .rows.map((r) => r.original);

  const handleExport = () => {
    const rows = table.getFilteredRowModel().rows.map((r) => r.original);
    const mapped = exportMapper
      ? rows.map(exportMapper)
      : (rows as unknown as Record<string, unknown>[]);
    exportToExcel(mapped, exportName ?? 'export', exportName ?? 'Data');
  };

  return (
    <div className="card overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
        <div className="relative min-w-[180px] flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-content-muted" />
          <Input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 pl-8"
          />
        </div>
        {toolbar}
        <div className="ml-auto flex items-center gap-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon-sm" aria-label="Density">
                <Rows3 />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Row density</DropdownMenuLabel>
              {(['compact', 'normal', 'comfortable'] as Density[]).map((d) => (
                <DropdownMenuCheckboxItem
                  key={d}
                  checked={density === d}
                  onCheckedChange={() => setDensity(d)}
                  className="capitalize"
                >
                  {d}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon-sm" aria-label="Columns">
                <SlidersHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              {table
                .getAllLeafColumns()
                .filter((c) => c.id !== '__select' && c.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(v) => column.toggleVisibility(!!v)}
                    className="capitalize"
                  >
                    {column.id.replace(/_/g, ' ')}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="size-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* Bulk action bar */}
      {enableSelection && selectedRows.length > 0 && bulkActions && (
        <div className="flex flex-wrap items-center gap-2 border-b border-line bg-brand-primary/5 px-3 py-2">
          <span className="text-sm font-medium text-content">
            {selectedRows.length} selected
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            {bulkActions(selectedRows, () => setRowSelection({}))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <TableSkeleton />
        ) : table.getRowModel().rows.length === 0 ? (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-muted">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const sorted = header.column.getIsSorted();
                    return (
                      <th
                        key={header.id}
                        className="whitespace-nowrap border-b border-line px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-content-muted"
                        style={{ width: header.getSize() }}
                      >
                        {header.isPlaceholder ? null : canSort ? (
                          <button
                            className="flex items-center gap-1 hover:text-content"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                            {sorted === 'asc' ? (
                              <ArrowUp className="size-3" />
                            ) : sorted === 'desc' ? (
                              <ArrowDown className="size-3" />
                            ) : (
                              <ArrowUpDown className="size-3 opacity-40" />
                            )}
                          </button>
                        ) : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row.original)}
                  className={cn(
                    'border-b border-line transition-colors last:border-0',
                    rowClassName?.(row.original),
                    onRowClick && 'cursor-pointer hover:bg-muted',
                    row.getIsSelected() && 'bg-brand-primary/5',
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={cn(
                        'px-3 text-content-secondary',
                        DENSITY_PAD[density],
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && table.getRowModel().rows.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 border-t border-line px-3 py-2.5 text-sm">
          <span className="text-content-muted">
            {table.getFilteredRowModel().rows.length} record
            {table.getFilteredRowModel().rows.length === 1 ? '' : 's'}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="h-8 rounded-md border border-line bg-surface px-2 text-xs text-content-secondary"
            >
              {[12, 25, 50, 100].map((s) => (
                <option key={s} value={s}>
                  {s} / page
                </option>
              ))}
            </select>
            <span className="text-content-muted">
              Page {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount() || 1}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

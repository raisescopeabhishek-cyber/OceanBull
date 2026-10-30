import { useMemo, useState } from "react";
import { cn } from "../lib/utils";

import BulkBar from "./BulkBar";
import Card from "./Card";
import DataTable from "./DataTable";
import FilterBar from "./FilterBar";
import PageHeader from "./PageHeader";
import { Drawer } from "./Modal";
import { Readout, ReadoutStrip } from "./StatCard";

/**
 * BlotterPage — the list archetype.
 *
 * Deposits, withdrawals, IB payouts, KYC lists, logs, copy-trading tables and
 * bonus reports are all this shape: readouts across the top, a filter row,
 * then a dense table that collapses to labelled rows on a phone.
 *
 * Selection is opt-in. Pass `selectable` only where the workflow really
 * approves in batches; otherwise the checkbox column is width spent on
 * nothing.
 *
 * Props
 *   title, description, breadcrumb, actions   — page header
 *   readouts: [{ key, label, value, delta, trend, helper }]
 *   filter:   props forwarded to FilterBar (chips, selects, search…)
 *   columns, rows, loading, empty, onRowClick, rowEdge, keyField
 *   selectable, bulkActions: [{ key, label, tone, onClick(selectedRows) }]
 *   footer    — pagination or totals
 *   filterPanel — extra controls for the mobile filter drawer
 */
export const BlotterPage = ({
  title,
  description,
  breadcrumb,
  actions,
  readouts = [],
  filter,
  columns = [],
  rows = [],
  keyField = "_id",
  loading = false,
  empty,
  onRowClick,
  rowEdge,
  selectable = false,
  bulkActions = [],
  footer,
  filterPanel,
  children,
  className,
}) => {
  const [selected, setSelected] = useState(() => new Set());
  const [filtersOpen, setFiltersOpen] = useState(false);

  const rowId = (row, index) => row?.[keyField] ?? index;

  const allSelected = rows.length > 0 && selected.size === rows.length;

  const toggleAll = () =>
    setSelected(
      allSelected ? new Set() : new Set(rows.map((r, i) => rowId(r, i)))
    );

  const toggleOne = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const selectedRows = useMemo(
    () => rows.filter((r, i) => selected.has(rowId(r, i))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows, selected]
  );

  /** Prepend the checkbox column only when selection is switched on. */
  const tableColumns = useMemo(() => {
    if (!selectable) return columns;

    const checkbox = {
      key: "__select",
      header: (
        <button
          type="button"
          onClick={toggleAll}
          aria-label={allSelected ? "Clear selection" : "Select all rows"}
          className={cn(
            "block h-3 w-3 border",
            allSelected ? "border-primary bg-primary" : "border-line-strong"
          )}
        />
      ),
      hideOnCard: true,
      className: "w-8",
      cell: (row, index) => {
        const id = rowId(row, index);
        const on = selected.has(id);
        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleOne(id);
            }}
            aria-label={on ? "Deselect row" : "Select row"}
            className={cn(
              "block h-3 w-3 border",
              on ? "border-primary bg-primary" : "border-line-strong"
            )}
          />
        );
      },
    };

    return [checkbox, ...columns];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns, selectable, selected, allSelected, rows]);

  const hasChrome = readouts.length > 0 || !!filter;

  return (
    <div className={cn("flex flex-col", className)}>
      {title ? (
        <PageHeader
          title={title}
          description={description}
          breadcrumb={breadcrumb}
          actions={actions}
        />
      ) : null}

      {readouts.length ? (
        <ReadoutStrip className="mb-2">
          {readouts.map((r) => (
            <Readout key={r.key ?? r.label} {...r} />
          ))}
        </ReadoutStrip>
      ) : null}

      {/* Filter row and bulk bar share the blotter's own frame, so the three
          read as one panel rather than three floating strips. */}
      {hasChrome || selectable ? (
        <Card className="mb-2 overflow-hidden">
          {filter ? (
            <FilterBar
              {...filter}
              onOpenFilters={filterPanel ? () => setFiltersOpen(true) : undefined}
            />
          ) : null}

          {selectable ? (
            <BulkBar
              count={selected.size}
              total={filter?.selectionTotal}
              onClear={() => setSelected(new Set())}
              actions={bulkActions.map((a) => ({
                ...a,
                onClick: () => a.onClick?.(selectedRows),
              }))}
              className="border-x-0 border-b-0"
            />
          ) : null}
        </Card>
      ) : null}

      {children}

      <DataTable
        columns={tableColumns}
        rows={rows}
        keyField={keyField}
        loading={loading}
        empty={empty}
        onRowClick={onRowClick}
        rowEdge={rowEdge}
      />

      {footer ? (
        <Card className="mt-2 flex flex-wrap items-center justify-between gap-2 px-3 py-2">
          {footer}
        </Card>
      ) : null}

      {filterPanel ? (
        <Drawer
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          title="Filters"
        >
          {filterPanel}
        </Drawer>
      ) : null}
    </div>
  );
};

export default BlotterPage;

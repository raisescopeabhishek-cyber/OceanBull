import { cn } from "../lib/utils";
import Card from "./Card";
import Skeleton from "./Skeleton";
import EmptyState from "./EmptyState";

/**
 * DataTable — one column definition, two layouts.
 *
 * A trading CRM is mostly wide tables, and a horizontally scrolling table is
 * miserable on a phone. So below `lg` each row renders as a compact stacked
 * row built from the same `columns` array; at `lg` and up it's a real
 * <table>. Rows stay dense in both, with an optional coloured left edge
 * carrying state — the blotter convention.
 *
 * Column shape:
 *   {
 *     key:        string                    // required, unique
 *     header:     node
 *     cell:       (row, index) => node      // defaults to row[key]
 *     align:      "left" | "right" | "center"
 *     numeric:    boolean                   // mono tabular figures
 *     className:  string                    // applied to the desktop cell
 *     primary:    boolean                   // row title on mobile
 *     secondary:  boolean                   // row subtitle on mobile
 *     trailing:   boolean                   // right-hand value on mobile
 *     hideOnCard: boolean                   // omit from the mobile row
 *     cardFull:   boolean                   // full-width in the mobile grid
 *   }
 */

const alignClass = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
};

const valueOf = (column, row, index) =>
  column.cell ? column.cell(row, index) : row?.[column.key];

export const DataTable = ({
  columns = [],
  rows = [],
  keyField = "_id",
  getRowKey,
  loading = false,
  skeletonRows = 6,
  empty,
  onRowClick,
  className,
  stickyHeader = true,
  zebra = true,
  /** (row, index) => tone — paints the left edge: "profit" | "loss" | null */
  rowEdge,
  cardActions,
}) => {
  const rowKey = (row, index) =>
    getRowKey?.(row, index) ?? row?.[keyField] ?? index;

  if (loading) {
    return <TableSkeleton columns={columns} rows={skeletonRows} />;
  }

  if (!rows.length) {
    return (
      empty ?? (
        <EmptyState
          title="No records"
          description="Rows will appear here once there is activity."
        />
      )
    );
  }

  const edgeClass = (row, index) => {
    const tone = rowEdge?.(row, index);
    if (tone === "profit") return "border-l-2 border-l-profit";
    if (tone === "loss") return "border-l-2 border-l-loss";
    if (tone === "warning") return "border-l-2 border-l-warning";
    return "border-l-2 border-l-transparent";
  };

  const primary = columns.find((c) => c.primary) ?? columns[0];
  const secondary = columns.find((c) => c.secondary);
  const trailing = columns.find((c) => c.trailing);
  const detail = columns.filter(
    (c) =>
      !c.hideOnCard && c !== primary && c !== secondary && c !== trailing
  );

  const Row = onRowClick ? "button" : "div";

  return (
    <>
      {/* ---- Phone / tablet: dense stacked rows ---- */}
      <Card className={cn("overflow-hidden lg:hidden", className)}>
        <div className={cn(zebra && "zebra")}>
          {rows.map((row, index) => (
            <Row
              key={rowKey(row, index)}
              type={onRowClick ? "button" : undefined}
              onClick={onRowClick ? () => onRowClick(row, index) : undefined}
              className={cn(
                "flex w-full flex-col gap-2.5 border-b border-line px-4 py-3.5 text-left last:border-b-0",
                edgeClass(row, index),
                onRowClick && "cursor-pointer hover:bg-surface-3"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="numeric truncate text-sm font-semibold text-text">
                    {valueOf(primary, row, index)}
                  </div>
                  {secondary ? (
                    <div className="mt-0.5 truncate text-[11px] text-subtle">
                      {valueOf(secondary, row, index)}
                    </div>
                  ) : null}
                </div>

                <div className="flex shrink-0 items-center gap-2 text-right">
                  {trailing ? (
                    <div className="numeric text-[13px] font-semibold">
                      {valueOf(trailing, row, index)}
                    </div>
                  ) : null}
                  {cardActions ? cardActions(row, index) : null}
                </div>
              </div>

              {detail.length ? (
                <dl className="grid grid-cols-3 gap-x-3 gap-y-2 border-t border-line pt-2">
                  {detail.map((column) => (
                    <div
                      key={column.key}
                      className={cn("min-w-0", column.cardFull && "col-span-3")}
                    >
                      <dt className="text-xs text-subtle">{column.header}</dt>
                      <dd
                        className={cn(
                          "mt-0.5 truncate text-xs text-text",
                          column.numeric && "numeric"
                        )}
                      >
                        {valueOf(column, row, index)}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </Row>
          ))}
        </div>
      </Card>

      {/* ---- Desktop: real table ---- */}
      <Card className={cn("hidden overflow-hidden lg:block", className)}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className={cn(
                      "whitespace-nowrap border-b border-line bg-surface-2 px-5 py-2.5",
                      "text-xs font-semibold text-subtle",
                      stickyHeader && "sticky top-0 z-10",
                      alignClass[column.align] ?? "text-left"
                    )}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className={cn(zebra && "zebra")}>
              {rows.map((row, index) => (
                <tr
                  key={rowKey(row, index)}
                  onClick={onRowClick ? () => onRowClick(row, index) : undefined}
                  className={cn(
                    "transition-colors [&:last-child>td]:border-b-0",
                    onRowClick && "cursor-pointer",
                    "hover:bg-surface-3"
                  )}
                >
                  {columns.map((column, ci) => (
                    <td
                      key={column.key}
                      className={cn(
                        "whitespace-nowrap px-5 py-3 align-middle text-[13px] text-text",
                        "border-b border-line",
                        ci === 0 && edgeClass(row, index),
                        alignClass[column.align] ?? "text-left",
                        column.numeric && "numeric",
                        column.className
                      )}
                    >
                      {valueOf(column, row, index)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
};

/** Loading placeholder that mirrors both layouts. */
export const TableSkeleton = ({ columns = [], rows = 6 }) => {
  const cols = columns.length ? columns : Array.from({ length: 5 });

  return (
    <>
      <Card className="overflow-hidden lg:hidden">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="border-b border-line px-3 py-2.5 last:border-b-0"
          >
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="mt-1.5 h-3 w-1/4" />
          </div>
        ))}
      </Card>

      <Card className="hidden overflow-hidden lg:block">
        <div className="flex gap-3 border-b border-line bg-surface-2 px-3 py-2">
          {cols.map((_, i) => (
            <Skeleton key={i} className="h-2.5 flex-1" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 border-b border-line px-3 last:border-b-0"
            style={{ height: "var(--row-h)" }}
          >
            {cols.map((__, j) => (
              <Skeleton key={j} className="h-3 flex-1" />
            ))}
          </div>
        ))}
      </Card>
    </>
  );
};

export default DataTable;

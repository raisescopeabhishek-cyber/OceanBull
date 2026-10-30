import React from "react";
import { cx } from "../utils/copyTradingHelpers";

/**
 * Shared copy-trading table.
 *
 * Rows come from each caller's `renderRow`, so the cells can't be labelled
 * where they're written. Instead the header text is attached to each cell
 * here, at render time: `table-stack` (see styles/base.css) then turns the
 * table into labelled rows below `lg`, and every page using this component
 * becomes readable on a phone without touching its row markup.
 */
const CopyTradingTable = ({
  columns = [],
  rows = [],
  renderRow,
  minWidth = "1000px",
  emptyTitle = "No data found",
  emptySubtitle = "There is no record available right now.",
  footer = null,
}) => {
  const colSpan = Math.max(columns.length, 1);

  /** Attach the matching column header to each <td> of a rendered row. */
  const withLabels = (rowElement) => {
    if (!React.isValidElement(rowElement)) return rowElement;

    const cells = React.Children.toArray(rowElement.props.children);
    let column = 0;

    const labelled = cells.map((cell) => {
      if (!React.isValidElement(cell) || cell.type !== "td") return cell;

      const label = columns[column] ?? "";
      column += cell.props.colSpan ? Number(cell.props.colSpan) : 1;

      // Never override a label the caller set deliberately.
      if (cell.props["data-label"] != null) return cell;
      return React.cloneElement(cell, { "data-label": String(label) });
    });

    return React.cloneElement(rowElement, undefined, labelled);
  };

  return (
    <div className={cx("overflow-hidden rounded-card border", "border-line bg-surface")}>
      <div className="max-w-full overflow-x-auto">
        <table
          className="table-stack w-full text-left text-sm"
          style={{ minWidth }}
        >
          <thead>
            <tr className="border-b border-line bg-surface-2">
              {columns.map((column) => (
                <th key={column} className="lbl whitespace-nowrap px-3 py-2">
                  {column}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.length > 0 ? (
              rows.map((row, index) => withLabels(renderRow(row, index)))
            ) : (
              <tr>
                <td colSpan={colSpan} className="px-3 py-10 text-center">
                  <p className="lbl-sm text-text">{emptyTitle}</p>
                  <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-muted">
                    {emptySubtitle}
                  </p>
                </td>
              </tr>
            )}
          </tbody>

          {footer && <tfoot>{footer}</tfoot>}
        </table>
      </div>
    </div>
  );
};

export default CopyTradingTable;

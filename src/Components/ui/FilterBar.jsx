import { cn } from "../lib/utils";
import { SearchInput, Select } from "./Input";

/**
 * FilterBar — the row above a blotter.
 *
 * Status chips carry their own counts, because on a review queue the count is
 * the reason you click the chip. On a phone the chips scroll horizontally and
 * the selects move into a drawer, which the page opens via `onOpenFilters`.
 *
 * chips:   [{ key, label, count, tone }]
 * selects: [{ key, label, value, options: [{ value, label }], onChange }]
 * extra:   node — further desktop-only controls, e.g. a date range
 */

const chipTone = {
  neutral: "border-line bg-surface text-subtle",
  warning: "border-warning/40 bg-warning-soft text-warning",
  success: "border-success/40 bg-success-soft text-success",
  danger: "border-danger/40 bg-danger-soft text-danger",
  primary: "border-primary/40 bg-primary-soft text-primary",
};

export const FilterBar = ({
  chips = [],
  activeChip,
  onChipChange,
  selects = [],
  extra,
  search,
  onSearchChange,
  searchPlaceholder = "login, email, reference",
  summary,
  onOpenFilters,
  className,
}) => (
  <div
    className={cn(
      "flex items-center gap-2 border-b border-line bg-surface-2 px-3 py-2",
      className
    )}
  >
    {/* Chips scroll rather than wrap: a filter row should stay one line. */}
    <div className="rail-x min-w-0 flex-1 items-center gap-2">
      {onSearchChange ? (
        <div className="w-[190px] shrink-0 sm:w-[240px]">
          <SearchInput
            value={search ?? ""}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="!min-h-8"
          />
        </div>
      ) : null}

      {chips.length ? (
        <>
          <span className="lbl hidden shrink-0 sm:inline">Filter</span>
          {chips.map((chip) => {
            const active = chip.key === activeChip;
            return (
              <button
                key={chip.key}
                type="button"
                onClick={() => onChipChange?.(chip.key)}
                aria-pressed={active}
                className={cn(
                  "lbl-sm inline-flex h-7 shrink-0 items-center gap-1.5 rounded-field border px-2.5 transition-colors",
                  active
                    ? chipTone[chip.tone ?? "primary"]
                    : "border-line bg-surface text-subtle hover:text-text"
                )}
              >
                <span
                  aria-hidden="true"
                  className="h-[5px] w-[5px] bg-current"
                />
                {chip.label}
                {chip.count != null ? (
                  <span className="numeric text-subtle">{chip.count}</span>
                ) : null}
              </button>
            );
          })}
        </>
      ) : null}

      {/* Selects are desktop-only; the drawer carries them on a phone. */}
      {selects.length ? (
        <>
          <span
            aria-hidden="true"
            className="mx-1 hidden h-5 w-px shrink-0 bg-line lg:block"
          />
          {selects.map((sel) => (
            <div key={sel.key} className="hidden w-[150px] shrink-0 lg:block">
              <Select
                value={sel.value}
                onChange={(e) => sel.onChange?.(e.target.value)}
                aria-label={sel.label}
                className="!min-h-8"
              >
                {sel.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {sel.label}: {opt.label}
                  </option>
                ))}
              </Select>
            </div>
          ))}
        </>
      ) : null}

      {/* `extra` is for controls a select cannot express — a date range, a
          numeric field. Desktop-only for the same reason as the selects: on a
          phone the drawer carries them. */}
      {extra ? (
        <>
          <span
            aria-hidden="true"
            className="mx-1 hidden h-5 w-px shrink-0 bg-line lg:block"
          />
          <div className="hidden shrink-0 items-center gap-1.5 lg:flex">
            {extra}
          </div>
        </>
      ) : null}
    </div>

    {onOpenFilters ? (
      <button
        type="button"
        onClick={onOpenFilters}
        className="lbl-sm inline-flex h-8 shrink-0 items-center gap-1.5 rounded-field border border-line bg-surface px-2.5 text-muted hover:text-text lg:hidden"
      >
        Filters
      </button>
    ) : null}

    {summary ? (
      <span className="numeric ml-auto hidden shrink-0 text-[10px] text-subtle sm:block">
        {summary}
      </span>
    ) : null}
  </div>
);

export default FilterBar;

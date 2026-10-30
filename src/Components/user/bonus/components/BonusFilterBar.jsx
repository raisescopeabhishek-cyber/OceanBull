// Components/user/bonus/components/BonusFilterBar.jsx
import React from "react";

const inputCls = (isDark) =>
  [
    "h-11 rounded-card border px-4 text-sm outline-none transition-all","border-line bg-surface-2 text-text placeholder:text-subtle focus:border-line",
  ].join(" ");

const BonusFilterBar = ({
  isDark,
  filters,
  onChange,
  onReset,
  fields = [],
}) => {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
      {fields.map((field) => {
        if (field.type === "select") {
          return (
            <select
              key={field.name}
              value={filters[field.name] || ""}
              onChange={(e) => onChange(field.name, e.target.value)}
              className={inputCls(isDark)}
            >
              <option value="">{field.placeholder || `All ${field.label}`}</option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          );
        }

        return (
          <input
            key={field.name}
            type={field.type || "text"}
            value={filters[field.name] || ""}
            onChange={(e) => onChange(field.name, e.target.value)}
            className={inputCls(isDark)}
            placeholder={field.placeholder || field.label}
          />
        );
      })}

      <button
        type="button"
        onClick={onReset}
        className={[
          "h-11 rounded-card border text-sm font-semibold transition-all","border-line bg-surface-2 hover:bg-surface-2",
        ].join(" ")}
      >
        Reset Filters
      </button>
    </div>
  );
};

export default BonusFilterBar;
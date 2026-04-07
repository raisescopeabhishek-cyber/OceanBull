// Components/user/bonus/components/BonusFilterBar.jsx
import React from "react";

const inputCls = (isDark) =>
  [
    "h-11 rounded-2xl border px-4 text-sm outline-none transition-all",
    isDark
      ? "border-white/10 bg-white/[0.04] text-white placeholder:text-white/30 focus:border-blue-400/30"
      : "border-orange-100 bg-white text-slate-900 placeholder:text-slate-400 focus:border-orange-300",
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
          "h-11 rounded-2xl border text-sm font-semibold transition-all",
          isDark
            ? "border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"
            : "border-orange-100 bg-white hover:bg-orange-50",
        ].join(" ")}
      >
        Reset Filters
      </button>
    </div>
  );
};

export default BonusFilterBar;
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { MoonStar, SunMedium, CheckCircle2 } from "lucide-react";
import { setSuperadminTheme } from "../../../redux/superadminThemeSlice";

const ThemeCard = ({ active, title, desc, icon, onClick, dark }) => {
  return (
    <button
      onClick={onClick}
      className={[
        "relative w-full rounded-3xl border p-6 text-left transition-all duration-300",
        active
          ? dark
            ? "border-blue-400/30 bg-blue-500/10 shadow-[0_16px_40px_rgba(0,0,0,0.28)]"
            : "border-blue-200 bg-blue-50 shadow-[0_16px_40px_rgba(59,130,246,0.08)]"
          : dark
          ? "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
          : "border-slate-200 bg-white hover:bg-slate-50",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div
            className={[
              "mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border",
              active
                ? dark
                  ? "border-blue-400/20 bg-blue-500/10 text-blue-200"
                  : "border-blue-200 bg-blue-50 text-blue-700"
                : dark
                ? "border-white/10 bg-black/20 text-white/80"
                : "border-slate-200 bg-slate-50 text-slate-700",
            ].join(" ")}
          >
            {icon}
          </div>

          <h3
            className={[
              "text-lg font-semibold",
              dark ? "text-white" : "text-slate-900",
            ].join(" ")}
          >
            {title}
          </h3>

          <p
            className={[
              "mt-2 text-sm leading-6",
              dark ? "text-white/55" : "text-slate-500",
            ].join(" ")}
          >
            {desc}
          </p>
        </div>

        {active && (
          <CheckCircle2
            className={dark ? "text-blue-300" : "text-blue-600"}
            size={22}
          />
        )}
      </div>
    </button>
  );
};

const ThemeConfig = () => {
  const dispatch = useDispatch();
  const mode = useSelector((store) => store.superadminTheme?.mode || "dark");
  const isDark = mode === "dark";

  return (
    <div className="space-y-6">
      <div>
        <h2
          className={[
            "text-2xl font-bold",
            isDark ? "text-white" : "text-slate-900",
          ].join(" ")}
        >
          SuperAdmin Theme Configuration
        </h2>
        <p
          className={[
            "mt-2 text-sm",
            isDark ? "text-white/55" : "text-slate-500",
          ].join(" ")}
        >
          Choose a refined interface mode for the SuperAdmin dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ThemeCard
          active={mode === "dark"}
          dark={isDark}
          title="Dark Mode"
          desc="Elegant and premium dark appearance with blue highlights, glass surfaces, and deep contrast."
          icon={<MoonStar className="w-6 h-6" />}
          onClick={() => dispatch(setSuperadminTheme("dark"))}
        />

        <ThemeCard
          active={mode === "light"}
          dark={isDark}
          title="Light Mode"
          desc="Clean, bright and professional workspace with soft shadows and subtle blue accents."
          icon={<SunMedium className="w-6 h-6" />}
          onClick={() => dispatch(setSuperadminTheme("light"))}
        />
      </div>

      <div
        className={[
          "rounded-3xl border p-6",
          isDark
            ? "border-white/10 bg-white/[0.03]"
            : "border-slate-200 bg-white",
        ].join(" ")}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3
              className={[
                "text-lg font-semibold",
                isDark ? "text-white" : "text-slate-900",
              ].join(" ")}
            >
              Active Theme
            </h3>
            <p
              className={[
                "mt-1 text-sm",
                isDark ? "text-white/55" : "text-slate-500",
              ].join(" ")}
            >
              Current mode is{" "}
              <span className="font-semibold capitalize">{mode}</span>.
            </p>
          </div>

          <div
            className={[
              "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em]",
              mode === "dark"
                ? "border-blue-400/20 bg-blue-500/10 text-blue-300"
                : "border-blue-200 bg-blue-50 text-blue-700",
            ].join(" ")}
          >
            {mode} mode enabled
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeConfig;
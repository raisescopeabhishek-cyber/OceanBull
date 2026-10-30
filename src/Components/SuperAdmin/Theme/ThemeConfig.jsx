import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { MoonStar, SunMedium, CheckCircle2 } from "lucide-react";
import { useTheme } from "@/theme/ThemeProvider";

const ThemeCard = ({ active, title, desc, icon, onClick, dark }) => {
  return (
    <button
      onClick={onClick}
      className={[
        "relative w-full rounded-card border p-6 text-left transition-all duration-300",
        active
          ? dark
            ? "border-line bg-primary-soft shadow-[0_16px_40px_rgba(0,0,0,0.28)]"
            : "border-line bg-primary-soft shadow-[0_16px_40px_rgba(59,130,246,0.08)]"
          : dark
          ? "border-line bg-surface-2 hover:bg-surface-2"
          : "border-line bg-surface hover:bg-surface-2",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div
            className={[
              "mb-4 inline-flex h-12 w-12 items-center justify-center rounded-card border",
              active
                ? dark
                  ? "border-line bg-primary-soft text-primary"
                  : "border-line bg-primary-soft text-primary"
                : dark
                ? "border-line bg-black/60 text-muted"
                : "border-line bg-surface-2 text-muted",
            ].join(" ")}
          >
            {icon}
          </div>

          <h3
            className={[
              "text-lg font-semibold",
              dark ? "text-text" : "text-text",
            ].join(" ")}
          >
            {title}
          </h3>

          <p
            className={[
              "mt-2 text-sm leading-6",
              dark ? "text-subtle" : "text-subtle",
            ].join(" ")}
          >
            {desc}
          </p>
        </div>

        {active && (
          <CheckCircle2
            className={dark ? "text-primary" : "text-primary"}
            size={22}
          />
        )}
      </div>
    </button>
  );
};

const ThemeConfig = () => {
  const dispatch = useDispatch();
  const { setMode: setThemeMode } = useTheme();
  const mode = useSelector((store) => store.superadminTheme?.mode || "dark");
  const isDark = mode === "dark";

  return (
    <div className="space-y-6">
      <div>
        <h2
          className={[
            "text-2xl font-bold","text-text",
          ].join(" ")}
        >
          SuperAdmin Theme Configuration
        </h2>
        <p
          className={[
            "mt-2 text-sm","text-subtle",
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
          onClick={() => setThemeMode("dark")}
        />

        <ThemeCard
          active={mode === "light"}
          dark={isDark}
          title="Light Mode"
          desc="Clean, bright and professional workspace with soft shadows and subtle blue accents."
          icon={<SunMedium className="w-6 h-6" />}
          onClick={() => setThemeMode("light")}
        />
      </div>

      <div
        className={[
          "rounded-card border p-6","border-line bg-surface-2",
        ].join(" ")}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3
              className={[
                "text-lg font-semibold","text-text",
              ].join(" ")}
            >
              Active Theme
            </h3>
            <p
              className={[
                "mt-1 text-sm","text-subtle",
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
                ? "border-line bg-primary-soft text-primary"
                : "border-line bg-primary-soft text-primary",
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
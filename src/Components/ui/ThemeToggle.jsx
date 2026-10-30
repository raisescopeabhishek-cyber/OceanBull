import { useTheme } from "@/theme/ThemeProvider";
import { cn } from "../lib/utils";

const SunIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="10" cy="10" r="3.75" stroke="currentColor" strokeWidth="1.6" />
    <path
      d="M10 1.5v2M10 16.5v2M1.5 10h2M16.5 10h2M4 4l1.4 1.4M14.6 14.6 16 16M16 4l-1.4 1.4M5.4 14.6 4 16"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

const MoonIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path
      d="M16.5 12.6A7 7 0 0 1 7.4 3.5a7 7 0 1 0 9.1 9.1Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MonitorIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <rect x="2.5" y="3.5" width="15" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M7 16.5h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

/**
 * ThemeToggle — one-tap light/dark switch for headers and nav bars.
 */
export const ThemeToggle = ({ className }) => {
  const { isDark, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={cn(
        "relative grid place-items-center rounded-field border border-line bg-surface text-muted",
        "h-11 w-11 sm:h-[38px] sm:w-[38px]",
        "transition-[background-color,color,border-color,transform] duration-150",
        "hover:bg-surface-3 hover:text-text hover:border-line-strong active:scale-95",
        className
      )}
    >
      {/* Both icons are mounted and cross-faded, so there's no layout shift. */}
      <SunIcon
        className={cn(
          "absolute h-5 w-5 transition-all duration-300",
          isDark ? "scale-50 opacity-0 -rotate-90" : "scale-100 opacity-100 rotate-0"
        )}
      />
      <MoonIcon
        className={cn(
          "absolute h-5 w-5 transition-all duration-300",
          isDark ? "scale-100 opacity-100 rotate-0" : "scale-50 opacity-0 rotate-90"
        )}
      />
    </button>
  );
};

/**
 * ThemeModeSelect — three-way control including "System", for a settings page
 * where the choice should be explicit.
 */
export const ThemeModeSelect = ({ className }) => {
  const { mode, setMode } = useTheme();

  const options = [
    { value: "light", label: "Light", Icon: SunIcon },
    { value: "dark", label: "Dark", Icon: MoonIcon },
    { value: "system", label: "System", Icon: MonitorIcon },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={cn("inline-flex rounded-field bg-surface-2 p-1", className)}
    >
      {options.map(({ value, label, Icon }) => {
        const active = mode === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setMode(value)}
            className={cn(
              "flex items-center gap-1.5 rounded-[calc(var(--radius-field)-3px)] px-3 py-1.5 text-sm font-medium transition-all",
              active
                ? "bg-surface text-text shadow-sm"
                : "text-muted hover:text-text"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        );
      })}
    </div>
  );
};

export default ThemeToggle;

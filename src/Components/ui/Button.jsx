import { forwardRef } from "react";
import { cn } from "../lib/utils";

/**
 * Button — 40px tall, 10px radius, semibold 14px, per the prototype.
 *
 * Variants map onto semantic tokens, so each is theme-correct in light and
 * dark with no `dark:` override. The press ripple is added by the global
 * interaction layer, which needs the relative/overflow-hidden base here.
 */

const variants = {
  primary:
    "bg-primary text-primary-on hover:bg-primary-hover shadow-[inset_0_1px_0_rgb(255_255_255/.12),0_1px_2px_rgb(15_26_44/.15)]",
  secondary:
    "bg-surface text-text border border-line hover:bg-surface-3 hover:border-line-strong",
  ghost: "text-muted hover:bg-surface-3 hover:text-text",
  soft: "bg-primary-soft text-primary-text hover:bg-primary/15",
  outline:
    "border border-primary/40 text-primary-text hover:bg-primary-soft hover:border-primary",
  danger:
    "bg-surface text-loss border border-line hover:bg-loss-soft hover:border-loss/40",
  "danger-solid": "bg-danger text-white hover:bg-danger/90",
  "danger-soft": "bg-loss-soft text-loss hover:bg-danger/15",
  success: "bg-success text-white hover:bg-success/90",
  "success-soft": "bg-profit-soft text-profit hover:bg-success/15",
  link: "text-primary-text underline-offset-4 hover:underline p-0 h-auto min-h-0",
};

const sizes = {
  xs: "h-7 px-2.5 text-[12px] gap-1.5 rounded-[8px]",
  sm: "h-8 px-3 text-[13px] gap-1.5 rounded-[8px]",
  md: "min-h-11 px-4 text-sm gap-2 sm:min-h-10",
  lg: "min-h-12 px-5 text-[15px] gap-2 sm:min-h-11",
  icon: "h-11 w-11 sm:h-[38px] sm:w-[38px] shrink-0",
};

const Spinner = () => (
  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".3" strokeWidth="3" />
    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const Button = forwardRef(
  (
    {
      as: Tag = "button",
      variant = "primary",
      size = "md",
      className,
      children,
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      fullWidth = false,
      ...props
    },
    ref
  ) => (
    <Tag
      ref={ref}
      disabled={Tag === "button" ? disabled || loading : undefined}
      aria-busy={loading || undefined}
      className={cn(
        "relative overflow-hidden inline-flex items-center justify-center",
        "rounded-field font-semibold whitespace-nowrap select-none",
        "transition-[background-color,border-color,color,transform] duration-150",
        "active:scale-[0.97]",
        "disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {loading ? <Spinner /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </Tag>
  )
);

Button.displayName = "Button";

/** Square icon button for header actions — 38px, matching the prototype. */
export const IconButton = forwardRef(
  ({ className, children, label, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "relative grid place-items-center rounded-field border border-line bg-surface text-muted",
        "h-11 w-11 sm:h-[38px] sm:w-[38px]",
        "transition-[background-color,color,border-color,transform] duration-150",
        "hover:bg-surface-3 hover:text-text hover:border-line-strong active:scale-95",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
);
IconButton.displayName = "IconButton";

export default Button;
export { Button };

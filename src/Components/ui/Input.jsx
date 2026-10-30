import { forwardRef, useId } from "react";
import { cn } from "../lib/utils";

/**
 * Form controls — 40px tall, 10px radius, 3px brand focus ring, per the
 * prototype.
 *
 * The font is 16px on mobile and 14px from `sm:` up. That isn't cosmetic:
 * iOS Safari force-zooms the viewport on focus for any field under 16px,
 * which is the most common mobile-form bug there is.
 */

const controlBase = cn(
  "w-full rounded-field border border-line-strong bg-surface text-text",
  "text-base sm:text-sm",
  "transition-[border-color,box-shadow] duration-150",
  "focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-[color:var(--ring)]",
  "disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-subtle",
  "aria-[invalid=true]:border-danger"
);

/** Wraps a control with its label, hint and error text. */
export const Field = ({
  label,
  hint,
  error,
  required,
  htmlFor,
  action,
  className,
  children,
}) => (
  <div className={cn("flex flex-col", className)}>
    {label || action ? (
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        {label ? (
          <label
            htmlFor={htmlFor}
            className="flex items-center gap-1 text-[13px] font-medium text-muted"
          >
            {label}
            {required ? <span className="text-danger">*</span> : null}
          </label>
        ) : (
          <span />
        )}
        {action}
      </div>
    ) : null}

    {children}

    {error ? (
      <p className="mt-1.5 text-xs font-medium text-danger">{error}</p>
    ) : hint ? (
      <p className="mt-1.5 text-xs text-subtle">{hint}</p>
    ) : null}
  </div>
);

export const Input = forwardRef(
  (
    {
      className,
      label,
      hint,
      error,
      required,
      action,
      leftIcon,
      rightIcon,
      numeric = false,
      id,
      ...props
    },
    ref
  ) => {
    const autoId = useId();
    const fieldId = id ?? autoId;

    const control = (
      <div className="relative">
        {leftIcon ? (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle">
            {leftIcon}
          </span>
        ) : null}

        <input
          ref={ref}
          id={fieldId}
          aria-invalid={error ? true : undefined}
          className={cn(
            controlBase,
            "min-h-11 px-3.5 sm:min-h-10",
            numeric && "numeric",
            leftIcon && "pl-10",
            rightIcon && "pr-10",
            className
          )}
          {...props}
        />

        {rightIcon ? (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-subtle">
            {rightIcon}
          </span>
        ) : null}
      </div>
    );

    // Used bare when the caller supplies its own label layout.
    if (!label && !hint && !error && !action) return control;

    return (
      <Field
        label={label}
        hint={hint}
        error={error}
        required={required}
        action={action}
        htmlFor={fieldId}
      >
        {control}
      </Field>
    );
  }
);
Input.displayName = "Input";

export const Textarea = forwardRef(({ className, rows = 4, ...props }, ref) => (
  <textarea
    ref={ref}
    rows={rows}
    className={cn(controlBase, "resize-y px-3.5 py-2.5", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Select = forwardRef(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(
        controlBase,
        "min-h-11 appearance-none pl-3.5 pr-9 sm:min-h-10",
        className
      )}
      {...props}
    >
      {children}
    </select>
    <svg
      className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  </div>
));
Select.displayName = "Select";

/** Search field with a leading magnifier. */
export const SearchInput = forwardRef(
  ({ className, placeholder = "Search", ...props }, ref) => (
    <div className="relative">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle"
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </span>
      <input
        ref={ref}
        type="search"
        placeholder={placeholder}
        className={cn(controlBase, "min-h-11 pl-10 pr-3.5 sm:min-h-10", className)}
        {...props}
      />
    </div>
  )
);
SearchInput.displayName = "SearchInput";

export default Input;

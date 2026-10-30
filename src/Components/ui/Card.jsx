import { forwardRef } from "react";
import { cn } from "../lib/utils";

/**
 * Card — 16px radius, hairline border, soft elevation, per the prototype.
 *
 * `spot` opts into the pointer spotlight: a soft light follows the cursor
 * across the card and lights its edge. The pointer position is set by the
 * global interaction layer, so the card only needs the class.
 */

const Card = forwardRef(
  ({ className, as: Tag = "div", interactive = false, spot = false, ...props }, ref) => (
    <Tag
      ref={ref}
      className={cn(
        "relative rounded-card border border-line bg-surface shadow-card",
        "transition-[box-shadow,border-color] duration-250",
        spot && "spot",
        interactive && !spot && "hover:border-line-strong hover:shadow-raised",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

/** Header bar: title and subtitle left, actions right, hairline beneath. */
export const CardHeader = ({ title, subtitle, actions, className, children }) => (
  <div
    className={cn(
      "flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4",
      className
    )}
  >
    <div className="min-w-0">
      {title ? (
        <h3 className="truncate text-[14.5px] font-semibold text-text">{title}</h3>
      ) : null}
      {subtitle ? (
        <p className="mt-0.5 truncate text-[12.5px] text-subtle">{subtitle}</p>
      ) : null}
      {children}
    </div>
    {actions ? (
      <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
    ) : null}
  </div>
);

export const CardBody = ({ className, ...props }) => (
  <div className={cn("p-5", className)} {...props} />
);

export const CardFooter = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-wrap items-center gap-2 border-t border-line bg-surface-2 px-5 py-3",
      className
    )}
    {...props}
  />
);

/** Well — a nested inset panel inside a card. */
export const Well = ({ className, ...props }) => (
  <div
    className={cn("rounded-xl border border-line bg-surface-2 px-3.5 py-3", className)}
    {...props}
  />
);

export default Card;
export { Card, Card as Panel };

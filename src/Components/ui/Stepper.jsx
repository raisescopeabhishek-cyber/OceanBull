import { cn } from "../lib/utils";

/**
 * Stepper — the numbered progress rail a form page opens with.
 *
 * On desktop each step heads its own section (see SectionStep); this rail is
 * the compact phone version, and doubles as a desktop summary for long forms.
 *
 * steps: [{ key, label, state: "done" | "active" | "todo" }]
 */
export const Stepper = ({ steps = [], className }) => (
  <ol
    className={cn("flex border-b border-line bg-surface-2", className)}
  >
    {steps.map((step, i) => {
      const done = step.state === "done";
      const active = step.state === "active";
      return (
        <li
          key={step.key}
          aria-current={active ? "step" : undefined}
          className={cn(
            "flex-1 border-r border-t-2 border-line px-2.5 py-1.5 last:border-r-0",
            active
              ? "border-t-primary"
              : done
              ? "border-t-success"
              : "border-t-transparent"
          )}
        >
          <div
            className={cn(
              "numeric text-[9px] font-bold",
              active ? "text-primary" : done ? "text-success" : "text-subtle"
            )}
          >
            {done ? "✓" : i + 1}
          </div>
          <div
            className={cn(
              "lbl-sm mt-0.5 truncate",
              active ? "text-text" : "text-subtle"
            )}
          >
            {step.label}
          </div>
        </li>
      );
    })}
  </ol>
);

/**
 * SectionStep — a numbered heading for one block of a form, with its fields
 * indented under the marker so the grouping reads at a glance.
 */
export const SectionStep = ({ index, title, hint, children, className }) => (
  <section className={cn("mt-5 first:mt-0", className)}>
    <div className="flex items-baseline gap-2">
      <span className="numeric grid h-[18px] w-[18px] shrink-0 place-items-center bg-primary text-[10px] font-bold text-primary-on">
        {index}
      </span>
      <div className="min-w-0">
        <h2 className="text-sm font-bold tracking-[-0.01em] text-text">
          {title}
        </h2>
        {hint ? <p className="mt-0.5 text-[11px] text-muted">{hint}</p> : null}
      </div>
    </div>

    <div className="mt-2.5 sm:ml-[27px]">{children}</div>
  </section>
);

export default Stepper;

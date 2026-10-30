import { cn } from "../lib/utils";

import Button from "./Button";
import Card from "./Card";
import PageHeader from "./PageHeader";
import { Stepper } from "./Stepper";

/**
 * FormPage — the entry archetype.
 *
 * Deposit, withdraw, transfer, profile, password changes and every
 * super-admin config screen are this shape: a single column of grouped
 * fields, with a summary beside it that states what will actually happen.
 *
 * On a wide screen the summary is a sticky rail. On a phone it moves inline
 * and the action becomes a bottom bar, because a submit button that scrolls
 * away above an open keyboard is the usual reason mobile forms fail.
 *
 * Props
 *   title, description, breadcrumb, actions
 *   steps:   [{ key, label, state }] — shown as a rail on phones
 *   summary: { title, rows: [{label, value, tone, weight}], total, checks }
 *   submit:  { label, onClick, disabled, reason, loading, tone }
 *   children — the form sections (see SectionStep)
 *   below    — anything after the form, e.g. recent requests
 */

const toneClass = {
  text: "text-text",
  muted: "text-muted",
  primary: "text-primary",
  profit: "text-profit",
  loss: "text-loss",
};

const SummaryRows = ({ rows = [], total }) => (
  <>
    {rows.map((row) => (
      <div
        key={row.label}
        className="flex min-h-[34px] items-center justify-between gap-3 border-b border-line px-3"
      >
        <span className="lbl truncate">{row.label}</span>
        <span
          className={cn(
            "numeric shrink-0 text-xs",
            row.weight === "bold" ? "font-bold" : "font-semibold",
            toneClass[row.tone ?? "text"]
          )}
        >
          {row.value}
        </span>
      </div>
    ))}

    {total ? (
      <div className="flex min-h-[44px] items-center justify-between gap-3 border-b border-line bg-surface-2 px-3">
        <span className="lbl-sm text-text">{total.label}</span>
        <span
          className={cn(
            "numeric text-[17px] font-bold",
            toneClass[total.tone ?? "profit"]
          )}
        >
          {total.value}
        </span>
      </div>
    ) : null}
  </>
);

const SummaryChecks = ({ checks = [] }) => {
  if (!checks.length) return null;

  return (
    <div className="p-3">
      <div className="lbl mb-2">Before you submit</div>
      {checks.map((check, i) => (
        <div key={i} className="mb-1.5 flex items-start gap-2">
          <span
            aria-hidden="true"
            className={cn(
              "numeric shrink-0 text-[11px] font-bold",
              check.ok ? "text-profit" : "text-warning"
            )}
          >
            {check.ok ? "✓" : "!"}
          </span>
          <span
            className={cn(
              "text-[11px] leading-snug",
              check.ok ? "text-muted" : "text-text"
            )}
          >
            {check.text}
          </span>
        </div>
      ))}
    </div>
  );
};

export const FormPage = ({
  title,
  description,
  breadcrumb,
  actions,
  steps = [],
  summary,
  submit,
  children,
  below,
  wide = false,
  className,
}) => {
  const submitButton = submit ? (
    <>
      <Button
        variant={submit.tone ?? "primary"}
        fullWidth
        size="lg"
        onClick={submit.onClick}
        disabled={submit.disabled}
        loading={submit.loading}
      >
        {submit.label ?? "Submit"}
      </Button>
      {submit.disabled && submit.reason ? (
        <p className="numeric mt-1.5 text-center text-[9px] leading-snug text-subtle">
          {submit.reason}
        </p>
      ) : null}
    </>
  ) : null;

  return (
    <div className={cn("flex flex-col", className)}>
      {title ? (
        <PageHeader
          title={title}
          description={description}
          breadcrumb={breadcrumb}
          actions={actions}
        />
      ) : null}

      {steps.length ? (
        <Card className="mb-2 overflow-hidden lg:hidden">
          <Stepper steps={steps} className="border-b-0" />
        </Card>
      ) : null}

      <div className="flex flex-col gap-2 lg:flex-row lg:items-start">
        {/* The form itself, capped so lines stay readable. `wide` lifts the
            cap for pages that lay out their own columns inside. */}
        <Card className="min-w-0 flex-1 p-4 sm:p-5">
          <div className={wide ? "min-w-0" : "max-w-[720px]"}>{children}</div>
        </Card>

        {/* Summary: a sticky rail from lg, inline below it. */}
        {summary ? (
          <Card className="shrink-0 overflow-hidden lg:sticky lg:top-3 lg:w-[352px]">
            <div className="flex h-[30px] items-center justify-between gap-2 border-b border-line bg-surface-2 px-3">
              <span className="lbl-sm text-text">
                {summary.title ?? "Summary"}
              </span>
              {summary.meta ? (
                <span className="numeric text-[10px] text-subtle">
                  {summary.meta}
                </span>
              ) : null}
            </div>

            <SummaryRows rows={summary.rows} total={summary.total} />
            <SummaryChecks checks={summary.checks} />

            {/* The action sits in the rail on desktop only; on a phone it is
                the bottom bar below, so it is never scrolled past. */}
            {submitButton ? (
              <div className="hidden border-t border-line bg-surface-2 p-3 lg:block">
                {submitButton}
              </div>
            ) : null}
          </Card>
        ) : null}
      </div>

      {below ? <div className="mt-2">{below}</div> : null}

      {/* Phone action bar. Safe-area padded so it clears the home indicator. */}
      {submitButton ? (
        <div className="pad-safe-b sticky bottom-0 z-20 -mx-3 mt-2 border-t border-line bg-surface-2 px-3 py-2.5 lg:hidden">
          {summary?.total ? (
            <div className="mb-2 flex items-baseline justify-between">
              <span className="lbl">{summary.total.label}</span>
              <span
                className={cn(
                  "numeric text-sm font-bold",
                  toneClass[summary.total.tone ?? "profit"]
                )}
              >
                {summary.total.value}
              </span>
            </div>
          ) : null}
          {submitButton}
        </div>
      ) : null}
    </div>
  );
};

export default FormPage;

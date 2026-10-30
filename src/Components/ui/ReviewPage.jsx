import { useState } from "react";
import { cn } from "../lib/utils";

import Card from "./Card";
import { Drawer } from "./Modal";

/**
 * ReviewPage — the record archetype.
 *
 * KYC review, deposit detail, user detail and ticket chat are all this shape:
 * a queue you work down, the record in the middle, and the decision beside
 * it. The queue stays on screen so reviewing is continuous rather than
 * list → record → back → list.
 *
 * The queue collapses: it is a pane at `xl`, and a drawer below that, which
 * keeps the record readable on a laptop and on a phone.
 *
 * Props
 *   breadcrumb, title            — identity of the record
 *   queue: { title, count, items, renderItem }
 *   aside: { title, children }   — the decision column
 *   prev / next                  — { label, onClick, disabled }
 *   children                     — the record itself
 */

const PaneHeader = ({ title, meta, children }) => (
  <div className="flex h-[30px] shrink-0 items-center justify-between gap-2 border-b border-line bg-surface-2 px-3">
    <span className="lbl-sm text-text">{title}</span>
    {meta ? <span className="numeric text-[10px] text-subtle">{meta}</span> : null}
    {children}
  </div>
);

export const ReviewPage = ({
  breadcrumb,
  title,
  queue,
  aside,
  prev,
  next,
  children,
  className,
}) => {
  const [queueOpen, setQueueOpen] = useState(false);

  /* The queue owns its own search and paging: a reviewer narrows the queue
     without leaving the record they are reading. */
  const queueBody = queue ? (
    <>
      {queue.toolbar ? (
        <div className="shrink-0 border-b border-line bg-surface p-2">
          {queue.toolbar}
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto bg-surface">
        {queue.items?.length
          ? queue.items.map((item, index) => (
              <div key={item.key ?? item.id ?? index}>
                {queue.renderItem?.(item, index, () => setQueueOpen(false))}
              </div>
            ))
          : queue.empty ?? null}
      </div>

      {queue.footer ? (
        <div className="flex shrink-0 items-center justify-between gap-2 border-t border-line bg-surface-2 px-2 py-1.5">
          {queue.footer}
        </div>
      ) : null}
    </>
  ) : null;

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      {/* Record bar: identity on the left, queue movement on the right. */}
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {queue ? (
            <button
              type="button"
              onClick={() => setQueueOpen(true)}
              className="lbl-sm inline-flex min-h-8 items-center gap-1.5 rounded-field border border-line bg-surface px-2.5 text-muted hover:text-text xl:hidden"
            >
              Queue
              {queue.count != null ? (
                <span className="numeric text-warning">{queue.count}</span>
              ) : null}
            </button>
          ) : null}

          <div className="min-w-0">
            {breadcrumb ? (
              <nav className="lbl" aria-label="Breadcrumb">
                {breadcrumb}
              </nav>
            ) : null}
            {title ? (
              <h1 className="numeric truncate text-base font-bold text-text">
                {title}
              </h1>
            ) : null}
          </div>
        </div>

        {prev || next ? (
          <div className="flex shrink-0 overflow-hidden rounded-field border border-line">
            <button
              type="button"
              onClick={prev?.onClick}
              disabled={prev?.disabled}
              className="lbl-sm min-h-8 border-r border-line px-2.5 text-muted hover:text-text disabled:opacity-40"
            >
              &larr; {prev?.label ?? "Prev"}
            </button>
            <button
              type="button"
              onClick={next?.onClick}
              disabled={next?.disabled}
              className="lbl-sm min-h-8 px-2.5 text-text hover:text-primary disabled:opacity-40"
            >
              {next?.label ?? "Next"} &rarr;
            </button>
          </div>
        ) : null}
      </div>

      {/* Three panes on a wide screen; the record alone on a narrow one. */}
      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        {queue ? (
          <div className="hidden w-[268px] shrink-0 flex-col border-r border-line xl:flex">
            <PaneHeader
              title={queue.title ?? "Queue"}
              meta={queue.count != null ? `${queue.count} pending` : undefined}
            />
            {queueBody}
          </div>
        ) : null}

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {children}
        </div>

        {aside ? (
          <div className="flex min-h-0 shrink-0 flex-col border-t border-line lg:w-[380px] lg:border-l lg:border-t-0">
            <PaneHeader title={aside.title ?? "Decision"} meta={aside.meta} />
            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              {aside.children}
            </div>
          </div>
        ) : null}
      </Card>

      {queue ? (
        <Drawer
          open={queueOpen}
          onClose={() => setQueueOpen(false)}
          side="left"
          title={queue.title ?? "Queue"}
        >
          <div className="-m-3">{queueBody}</div>
        </Drawer>
      ) : null}
    </div>
  );
};

/** A section inside the record pane, with its own header bar. */
export const ReviewSection = ({ title, meta, children, className }) => (
  <section className={cn("border-b border-line last:border-b-0", className)}>
    {title ? <PaneHeader title={title} meta={meta} /> : null}
    <div className="p-3">{children}</div>
  </section>
);

/**
 * CompareTable — declared value against what the document says, with a match
 * mark per field. The mark is a glyph as well as a colour, so a red/green
 * difference is not the only signal.
 *
 * rows: [{ label, declared, document, match: boolean }]
 */
export const CompareTable = ({ rows = [], className }) => (
  <div className={cn("overflow-hidden border border-line", className)}>
    <div className="grid grid-cols-[1.1fr_1fr_1fr_64px] border-b border-line bg-surface-2">
      <span className="lbl px-2.5 py-1.5">Field</span>
      <span className="lbl px-2.5 py-1.5">Declared</span>
      <span className="lbl px-2.5 py-1.5">On document</span>
      <span className="lbl px-2.5 py-1.5 text-center">Match</span>
    </div>

    <div className="zebra">
      {rows.map((row) => (
        <div
          key={row.label}
          className="grid grid-cols-[1.1fr_1fr_1fr_64px] items-center border-b border-line last:border-b-0"
        >
          <span className="lbl px-2.5 py-2 text-muted">{row.label}</span>
          <span className="numeric px-2.5 py-2 text-xs text-text">
            {row.declared}
          </span>
          <span
            className={cn(
              "numeric px-2.5 py-2 text-xs",
              row.match ? "text-text" : "text-warning"
            )}
          >
            {row.document}
          </span>
          <span
            className={cn(
              "numeric px-2.5 py-2 text-center text-[11px] font-bold",
              row.match ? "text-profit" : "text-loss"
            )}
          >
            {row.match ? "✓" : "✗"}
          </span>
        </div>
      ))}
    </div>
  </div>
);

export default ReviewPage;

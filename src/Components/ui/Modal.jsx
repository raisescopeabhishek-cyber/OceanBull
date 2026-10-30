import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { cn } from "../lib/utils";

/**
 * Modal — centred dialog on desktop, bottom sheet on phones.
 *
 * Bottom-sheet behaviour isn't decoration: a centred dialog with the keyboard
 * open on a short viewport pushes its own actions off-screen. Anchoring to
 * the bottom keeps the primary button in thumb reach.
 *
 * Overlays are the one place this direction uses elevation — everything on
 * the page itself separates with hairlines.
 */

const sizes = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
};

const CloseIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path
      d="m5 5 10 10M15 5 5 15"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
  </svg>
);

export const Modal = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  className,
}) => (
  <Dialog open={!!open} onClose={onClose} className="relative z-50">
    <div
      className="fixed inset-0 bg-[color:var(--scrim)] backdrop-blur-[2px]"
      aria-hidden="true"
    />

    <div className="fixed inset-0 flex items-end justify-center sm:items-center sm:p-4">
      <DialogPanel
        className={cn(
          "flex w-full flex-col border-line bg-surface shadow-pop",
          // Sheet on mobile: capped height, safe-area padded.
          "max-h-[92dvh] rounded-t-sheet border-t pad-safe-b",
          // Dialog from sm: fully bordered, centred.
          "sm:max-h-[85dvh] sm:rounded-sheet sm:border",
          sizes[size],
          className
        )}
      >
        {/* Drag affordance, mobile only. */}
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-line-strong sm:hidden" />

        {title ? (
          <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
            <div className="min-w-0">
              <DialogTitle className="text-base font-semibold text-text">{title}</DialogTitle>
              {description ? (
                <p className="mt-1 text-[13px] text-muted">{description}</p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="tap -mr-1.5 -mt-1.5 flex shrink-0 items-center justify-center rounded-field text-subtle transition-colors hover:bg-surface-3 hover:text-text sm:min-h-8 sm:min-w-8"
            >
              <CloseIcon />
            </button>
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {children}
        </div>

        {footer ? (
          <div className="flex flex-col-reverse gap-2 border-t border-line bg-surface-2 px-5 py-3.5 sm:flex-row sm:justify-end">
            {footer}
          </div>
        ) : null}
      </DialogPanel>
    </div>
  </Dialog>
);

/**
 * Drawer — slides in from the side, used for filters and mobile navigation.
 */
export const Drawer = ({
  open,
  onClose,
  title,
  children,
  side = "right",
  className,
}) => (
  <Dialog open={!!open} onClose={onClose} className="relative z-50">
    <div
      className="fixed inset-0 bg-[color:var(--scrim)] backdrop-blur-[2px]"
      aria-hidden="true"
    />

    <div
      className={cn(
        "fixed inset-y-0 flex max-w-full",
        side === "right" ? "right-0" : "left-0"
      )}
    >
      <DialogPanel
        className={cn(
          "flex w-[86vw] max-w-xs flex-col border-line bg-surface shadow-pop pad-safe-b",
          side === "right" ? "border-l" : "border-r",
          className
        )}
      >
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          <DialogTitle className="text-base font-semibold text-text">{title}</DialogTitle>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="tap flex items-center justify-center rounded-field text-subtle hover:bg-surface-3 hover:text-text sm:min-h-8 sm:min-w-8"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>
      </DialogPanel>
    </div>
  </Dialog>
);

export default Modal;

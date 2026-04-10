import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

export const AlertDialog = ({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) => {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => onOpenChange(false)}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px]" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            {children}
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export const AlertDialogContent = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <Transition.Child
      as={Fragment}
      enter="ease-out duration-300"
      enterFrom="opacity-0 scale-95"
      enterTo="opacity-100 scale-100"
      leave="ease-in duration-200"
      leaveFrom="opacity-100 scale-100"
      leaveTo="opacity-0 scale-95"
    >
      <Dialog.Panel
        className={cn(
          "w-full max-w-md overflow-hidden rounded-2xl bg-neutral-900/95 p-6 text-left align-middle text-white shadow-xl transition-all",
          className
        )}
      >
        {children}
      </Dialog.Panel>
    </Transition.Child>
  );
};

export const AlertDialogHeader = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={cn("mb-4", className)}>{children}</div>;

export const AlertDialogTitle = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <Dialog.Title className={cn("text-2xl font-bold", className)}>
    {children}
  </Dialog.Title>
);

export const AlertDialogDescription = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={cn("text-sm", className)}>{children}</div>;

export const AlertDialogFooter = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("mt-4 flex flex-wrap items-center justify-end gap-3", className)}>
    {children}
  </div>
);

export const AlertDialogCancel = ({
  children,
  onClick,
  className = "",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) => (
  <button
    type="button"
    disabled={disabled}
    className={cn(
      "rounded-md bg-gray-200 px-4 py-2 text-black transition hover:bg-gray-300/80 disabled:cursor-not-allowed disabled:opacity-60",
      className
    )}
    onClick={onClick}
  >
    {children}
  </button>
);

export const AlertDialogAction = ({
  children,
  onClick,
  className = "",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) => (
  <button
    type="button"
    disabled={disabled}
    className={cn(
      "rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-600/80 disabled:cursor-not-allowed disabled:opacity-60",
      className
    )}
    onClick={onClick}
  >
    {children}
  </button>
);
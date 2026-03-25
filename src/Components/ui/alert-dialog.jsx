import React from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

export const AlertDialog = ({ open, onOpenChange, children }) => {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
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
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-full p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-neutral-900/90 text-white shadow-xl rounded-2xl">
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export const AlertDialogContent = ({ children }) => <>{children}</>;
export const AlertDialogHeader = ({ children }) => (
  <div className="mb-4">{children}</div>
);
export const AlertDialogTitle = ({ children }) => (
  <h2 className="text-2xl mb-2 font-bold">{children}</h2>
);
export const AlertDialogDescription = ({ children }) => (
  <p className="text-sm">{children}</p>
);
export const AlertDialogFooter = ({ children }) => (
  <div className="mt-4">{children}</div>
);
export const AlertDialogCancel = ({ children, onClick }) => (
  <button
    className="px-4 py-2 text-black bg-gray-200 rounded-md hover:bg-gray-300/80"
    onClick={onClick}
  >
    {children}
  </button>
);
export const AlertDialogAction = ({ children, onClick }) => (
  <button
    className="px-4 mx-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-600/80"
    onClick={onClick}
  >
    {children}
  </button>
);

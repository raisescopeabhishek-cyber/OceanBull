import React, { useState } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

type PasswordInputProps = {
  id?: string;
  placeholder?: string;
  registration: UseFormRegisterReturn;
  error?: string;
};

export const PasswordInput: React.FC<PasswordInputProps> = ({
  id = "password",
  placeholder = "••••••••",
  registration,
  error,
}) => {
  const [show, setShow] = useState(false);

  return (
    <>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 pr-12 text-white placeholder-white/40 outline-none backdrop-blur transition focus:border-fuchsia-400/50 focus:ring-2 focus:ring-fuchsia-400/30"
          {...registration}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-2 my-auto inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {error && <p className="mt-1 text-xs font-medium text-rose-300">{error}</p>}
    </>
  );
};

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 3l18 18" />
    <path d="M10.6 10.6a3 3 0 104.24 4.24" />
    <path d="M9.88 4.24A10.94 10.94 0 0112 4c7 0 11 8 11 8a18.17 18.17 0 01-3.23 4.52M6.79 6.79A18.1 18.1 0 001 12s4 7 11 7a10.86 10.86 0 005.21-1.39" />
  </svg>
);

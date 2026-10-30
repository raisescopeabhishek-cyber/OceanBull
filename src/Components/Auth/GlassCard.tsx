import React from "react";

export const GlassCard: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  className = "",
  children,
}) => {
  return (
    <div
      className={
        "relative overflow-hidden rounded-2xl border border-line bg-surface-2 p-8 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl ring-1 ring-line " +
        className
      }
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-1 -z-10 opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(60% 60% at 30% 20%, rgba(23, 157, 166,0.25), transparent 60%), radial-gradient(50% 60% at 80% 50%, rgba(236,72,153,0.2), transparent 70%)",
        }}
      />
      {children}
    </div>
  );
};

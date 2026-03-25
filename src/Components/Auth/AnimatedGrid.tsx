import React from "react";

export const AnimatedGrid: React.FC = () => {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(rgba(129,140,248,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(129,140,248,0.08) 1px, transparent 1px)",
          backgroundSize: "44px 44px, 44px 44px",
          backgroundPosition: "0 0, 0 0",
          animation: "grid-move 40s linear infinite",
        }}
      />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.35)_60%,rgba(0,0,0,0.75)_100%)]" />
      <style>{`
        @keyframes grid-move {
          0% { background-position: 0px 0px, 0px 0px; }
          100% { background-position: 44px 44px, 44px 44px; }
        }
      `}</style>
    </>
  );
};

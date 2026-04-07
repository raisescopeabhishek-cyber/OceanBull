// Components/user/bonus/components/BonusTableLoader.jsx
import React from "react";

const BonusTableLoader = ({ rows = 6 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className="h-14 animate-pulse rounded-2xl bg-slate-200/60 dark:bg-white/[0.06]"
        />
      ))}
    </div>
  );
};

export default BonusTableLoader;
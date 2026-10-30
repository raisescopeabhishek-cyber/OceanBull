// Components/user/bonus/components/BonusTableLoader.jsx
import React from "react";
import { useSelector } from "react-redux";

const BonusTableLoader = ({ rows = 6 }) => {
  const mode = useSelector((store) => store.userTheme?.mode || "light");
  const isDark = mode === "dark";

  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className={[
            "h-14 animate-pulse rounded-card border","border-line bg-surface-2",
          ].join(" ")}
        />
      ))}
    </div>
  );
};

export default BonusTableLoader;
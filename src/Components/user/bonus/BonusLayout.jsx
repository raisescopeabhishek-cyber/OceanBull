// Components/user/bonus/BonusLayout.jsx
import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowLeft } from "lucide-react";
import BonusMiniSidebar from "./components/BonusMiniSidebar";

const BonusLayout = () => {
  const navigate = useNavigate();

  const mode = useSelector((store) => store.userTheme?.mode || "light");
  const isDark = mode === "dark";

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[280px_minmax(0,1fr)] p-3 sm:p-4">
      <BonusMiniSidebar isDark={isDark} />

      <div
        className={[
          "min-h-[720px] overflow-hidden rounded-[28px] border backdrop-blur-xl",
          isDark
            ? "border-white/10 bg-white/[0.03]"
            : "border-orange-100/80 bg-white/70",
        ].join(" ")}
      >
        {/* Top Header */}
        <div
          className={[
            "flex items-center justify-between border-b px-4 py-3 sm:px-6",
            isDark ? "border-white/10" : "border-orange-100",
          ].join(" ")}
        >
          <button
            type="button"
            onClick={() => navigate("/user/dashboard")}
            className={[
              "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all",
              isDark
                ? "bg-white/5 text-white hover:bg-white/10"
                : "bg-orange-50 text-orange-600 hover:bg-orange-100",
            ].join(" ")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
        </div>

        <Outlet />
      </div>
    </div>
  );
};

export default BonusLayout;
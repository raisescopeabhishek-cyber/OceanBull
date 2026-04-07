// Components/user/bonus/BonusDepositsTab.jsx
import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useBonusDeposits } from "./hooks/useBonusDeposits";
import BonusHero from "./components/BonusHero";
import BonusSectionCard from "./components/BonusSectionCard";
import BonusFilterBar from "./components/BonusFilterBar";
import BonusEmptyState from "./components/BonusEmptyState";
import BonusStatusBadge from "./components/BonusStatusBadge";
import BonusTableLoader from "./components/BonusTableLoader";
import { formatCurrency, formatDate } from "./utils/bonusHelpers";

const BonusDepositsTab = () => {
  const mode = useSelector((store) => store.userTheme?.mode || "light");
  const isDark = mode === "dark";

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: "",
    mt5Account: "",
    from: "",
    to: "",
  });

  const { data, loading } = useBonusDeposits(filters);

  const fields = useMemo(
    () => [
      {
        name: "status",
        label: "Status",
        type: "select",
        placeholder: "All Status",
        options: [
          { label: "Approved", value: "approved" },
          { label: "Pending", value: "pending" },
          { label: "Rejected", value: "rejected" },
        ],
      },
      {
        name: "mt5Account",
        label: "MT5 Account",
        placeholder: "Search MT5 account",
      },
      { name: "from", label: "From Date", type: "date" },
      { name: "to", label: "To Date", type: "date" },
    ],
    []
  );

  const onChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1,
    }));
  };

  const onReset = () => {
    setFilters({
      page: 1,
      limit: 10,
      status: "",
      mt5Account: "",
      from: "",
      to: "",
    });
  };

  return (
    <div>
      <BonusHero
        isDark={isDark}
        title="Deposit Bonus History"
        subtitle="Track every deposit bonus entry account-wise, including deposit amount, bonus earned, bonus percentage, status, and approval timing."
        rightContent={<h3 className="text-2xl font-bold">{data.length}</h3>}
      />

      <div className="space-y-5 p-5 sm:p-6">
        <BonusSectionCard
          isDark={isDark}
          title="Filter Deposit History"
          subtitle="Use date, account, and status filters to find deposit bonus records quickly"
        >
          <BonusFilterBar
            isDark={isDark}
            filters={filters}
            onChange={onChange}
            onReset={onReset}
            fields={fields}
          />
        </BonusSectionCard>

        <BonusSectionCard
          isDark={isDark}
          title="Deposit Bonus"
          subtitle="All deposit bonus records for the logged in user"
        >
          {loading ? (
            <BonusTableLoader rows={8} />
          ) : data.length === 0 ? (
            <BonusEmptyState
              isDark={isDark}
              title="No deposit bonus records found"
              subtitle="Try changing the filters or wait for approved deposits to appear."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1100px] w-full text-left">
                <thead>
                  <tr
                    className={[
                      "text-xs uppercase tracking-[0.16em]",
                      isDark ? "text-white/40" : "text-slate-500",
                    ].join(" ")}
                  >
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">MT5 Account</th>
                    <th className="px-4 py-3">Deposit</th>
                    <th className="px-4 py-3">Bonus</th>
                    <th className="px-4 py-3">Bonus %</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {data.map((item) => (
                    <tr
                      key={item._id}
                      className={[
                        "border-t",
                        isDark ? "border-white/10" : "border-orange-100",
                      ].join(" ")}
                    >
                      <td className="px-4 py-4">{formatDate(item.createdAt)}</td>
                      <td className="px-4 py-4 font-semibold">{item.mt5Account}</td>
                      <td className="px-4 py-4">{formatCurrency(item.deposit)}</td>
                      <td className="px-4 py-4">{formatCurrency(item.bonus)}</td>
                      <td className="px-4 py-4">{item.bonusPercent}%</td>
                      <td className="px-4 py-4 capitalize">{item.method || "-"}</td>
                      <td className="px-4 py-4">
                        <BonusStatusBadge isDark={isDark} status={item.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </BonusSectionCard>
      </div>
    </div>
  );
};

export default BonusDepositsTab;
// Components/user/bonus/BonusTradesTab.jsx
import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useBonusTrades } from "./hooks/useBonusTrades";
import BonusHero from "./components/BonusHero";
import BonusSectionCard from "./components/BonusSectionCard";
import BonusFilterBar from "./components/BonusFilterBar";
import BonusEmptyState from "./components/BonusEmptyState";
import BonusStatusBadge from "./components/BonusStatusBadge";
import BonusTableLoader from "./components/BonusTableLoader";
import { formatDate, formatNumber } from "./utils/bonusHelpers";

const BonusTradesTab = () => {
  const mode = useSelector((store) => store.userTheme?.mode || "light");
  const isDark = mode === "dark";

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    mt5Account: "",
    bonusProcessed: "",
    isBonusEligible: "",
    from: "",
    to: "",
  });

  const { data, loading } = useBonusTrades(filters);

  const fields = useMemo(
    () => [
      { name: "mt5Account", label: "MT5 Account", placeholder: "Search MT5 account" },
      {
        name: "bonusProcessed",
        label: "Processed",
        type: "select",
        placeholder: "All Processed Status",
        options: [
          { label: "Processed", value: "true" },
          { label: "Unprocessed", value: "false" },
        ],
      },
      {
        name: "isBonusEligible",
        label: "Eligible",
        type: "select",
        placeholder: "All Eligibility",
        options: [
          { label: "Eligible", value: "true" },
          { label: "Not Eligible", value: "false" },
        ],
      },
      { name: "from", label: "From Date", type: "date" },
      { name: "to", label: "To Date", type: "date" },
    ],
    []
  );

  const onChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const onReset = () => {
    setFilters({
      page: 1,
      limit: 10,
      mt5Account: "",
      bonusProcessed: "",
      isBonusEligible: "",
      from: "",
      to: "",
    });
  };

  return (
    <div>
      <BonusHero
        isDark={isDark}
        title="Bonus Trade Tracking"
        subtitle="Inspect close trades included in bonus logic, track processed vs pending rows, and monitor batch linkage."
        rightContent={<h3 className="text-2xl font-bold">{data.length}</h3>}
      />

      <div className="space-y-5 p-5 sm:p-6">
        <BonusSectionCard
          isDark={isDark}
          title="Filter Bonus Trades"
          subtitle="Use account, eligibility, processing state, and date range"
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
          title="Bonus Trade Table"
          subtitle="Trades involved in your bonus payout workflow"
        >
          {loading ? (
            <BonusTableLoader rows={8} />
          ) : data.length === 0 ? (
            <BonusEmptyState
              isDark={isDark}
              title="No bonus trade records found"
              subtitle="Tracked close trades will appear here."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1300px] w-full text-left">
                <thead>
                  <tr
                    className={[
                      "text-xs uppercase tracking-[0.16em]",
                      isDark ? "text-white/40" : "text-slate-500",
                    ].join(" ")}
                  >
                    <th className="px-4 py-3">Close Time</th>
                    <th className="px-4 py-3">MT5 Account</th>
                    <th className="px-4 py-3">Position ID</th>
                    <th className="px-4 py-3">Symbol</th>
                    <th className="px-4 py-3">Lot</th>
                    <th className="px-4 py-3">Profit</th>
                    <th className="px-4 py-3">Eligible</th>
                    <th className="px-4 py-3">Processed</th>
                    <th className="px-4 py-3">Batch ID</th>
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
                      <td className="px-4 py-4">{formatDate(item.closeTimeDate)}</td>
                      <td className="px-4 py-4 font-semibold">{item.mt5Account}</td>
                      <td className="px-4 py-4">{item.positionId}</td>
                      <td className="px-4 py-4">{item.symbol}</td>
                      <td className="px-4 py-4">{formatNumber(item.lotSize)}</td>
                      <td className="px-4 py-4">{formatNumber(item.profit)}</td>
                      <td className="px-4 py-4">
                        <BonusStatusBadge
                          isDark={isDark}
                          status={item.isBonusEligible ? "eligible" : "not eligible"}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <BonusStatusBadge
                          isDark={isDark}
                          status={item.bonusProcessed ? "processed" : "pending"}
                        />
                      </td>
                      <td className="px-4 py-4">{item.bonusBatchId || "-"}</td>
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

export default BonusTradesTab;
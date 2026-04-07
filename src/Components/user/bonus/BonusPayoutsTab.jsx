// Components/user/bonus/BonusPayoutsTab.jsx
import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Eye } from "lucide-react";
import { useBonusPayouts } from "./hooks/useBonusPayouts";
import BonusHero from "./components/BonusHero";
import BonusSectionCard from "./components/BonusSectionCard";
import BonusFilterBar from "./components/BonusFilterBar";
import BonusStatusBadge from "./components/BonusStatusBadge";
import BonusEmptyState from "./components/BonusEmptyState";
import BonusTableLoader from "./components/BonusTableLoader";
import BonusPayoutDetailsModal from "./BonusPayoutDetailsModal";
import { formatCurrency, formatDate, formatNumber } from "./utils/bonusHelpers";

const BonusPayoutsTab = () => {
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

  const {
    data,
    loading,
    selected,
    setSelected,
    detailsLoading,
    fetchDetails,
  } = useBonusPayouts(filters);

  const fields = useMemo(
    () => [
      {
        name: "status",
        label: "Status",
        type: "select",
        placeholder: "All Status",
        options: [
          { label: "Success", value: "success" },
          { label: "Skipped", value: "skipped" },
          { label: "Failed", value: "failed" },
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
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
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
        title="Trade Bonus Payouts"
        subtitle="Track batch-wise bonus payout records, matched lot slabs, wallet movement, and detailed trade coverage."
        rightContent={<h3 className="text-2xl font-bold">{data.length}</h3>}
      />

      <div className="space-y-5 p-5 sm:p-6">
        <BonusSectionCard
          isDark={isDark}
          title="Filter Payout History"
          subtitle="Find payout records using account, status, and date filters"
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
          title="Trade Bonus Payout"
          subtitle="Payout records created from your close trade bonus processing"
        >
          {loading ? (
            <BonusTableLoader rows={8} />
          ) : data.length === 0 ? (
            <BonusEmptyState
              isDark={isDark}
              title="No payout records found"
              subtitle="Payout records will appear once trade bonus processing runs."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1200px] w-full text-left">
                <thead>
                  <tr
                    className={[
                      "text-xs uppercase tracking-[0.16em]",
                      isDark ? "text-white/40" : "text-slate-500",
                    ].join(" ")}
                  >
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">MT5 Account</th>
                    <th className="px-4 py-3">Total Lot</th>
                    <th className="px-4 py-3">Matched Range</th>
                    <th className="px-4 py-3">Bonus Amount</th>
                    <th className="px-4 py-3">Wallet Flow</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Action</th>
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
                      <td className="px-4 py-4">{formatNumber(item.totalLot)}</td>
                      <td className="px-4 py-4">
                        {item?.matchedRange?.minLot ?? "-"} -{" "}
                        {item?.matchedRange?.maxLot ?? "-"}
                      </td>
                      <td className="px-4 py-4 font-semibold">
                        {formatCurrency(item.bonusAmount)}
                      </td>
                      <td className="px-4 py-4">
                        {formatCurrency(item.walletBefore)} →{" "}
                        {formatCurrency(item.walletAfter)}
                      </td>
                      <td className="px-4 py-4">
                        <BonusStatusBadge isDark={isDark} status={item.status} />
                      </td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => fetchDetails(item._id)}
                          className={[
                            "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-all",
                            isDark
                              ? "border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"
                              : "border-orange-100 bg-orange-50 hover:bg-orange-100",
                          ].join(" ")}
                        >
                          <Eye size={16} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </BonusSectionCard>
      </div>

      <BonusPayoutDetailsModal
        isDark={isDark}
        open={!!selected || detailsLoading}
        onClose={() => setSelected(null)}
        data={selected}
        loading={detailsLoading}
      />
    </div>
  );
};

export default BonusPayoutsTab;
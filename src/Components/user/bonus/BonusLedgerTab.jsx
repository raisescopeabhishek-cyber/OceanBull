// Components/user/bonus/BonusLedgerTab.jsx
import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useBonusLedger } from "./hooks/useBonusLedger";
import BonusHero from "./components/BonusHero";
import BonusSectionCard from "./components/BonusSectionCard";
import BonusFilterBar from "./components/BonusFilterBar";
import BonusTableLoader from "./components/BonusTableLoader";
import BonusEmptyState from "./components/BonusEmptyState";
import { formatCurrency, formatDate } from "./utils/bonusHelpers";

const BonusLedgerTab = () => {
  const mode = useSelector((store) => store.userTheme?.mode || "light");
  const isDark = mode === "dark";

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    type: "",
    from: "",
    to: "",
  });

  const { data, loading } = useBonusLedger(filters);

  const fields = useMemo(
    () => [
      {
        name: "type",
        label: "Ledger Type",
        type: "select",
        placeholder: "All Types",
        options: [
          { label: "Deposit Bonus", value: "deposit_bonus" },
          { label: "Trade Bonus Credit", value: "trade_bonus_credit" },
          { label: "Trade Bonus Debit", value: "trade_bonus_debit" },
          { label: "Manual Adjustment", value: "manual_adjustment" },
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
      type: "",
      from: "",
      to: "",
    });
  };

  return (
    <div>
      <BonusHero
        isDark={isDark}
        title="Bonus Wallet Ledger"
        subtitle="Full ledger trail of every wallet movement, including deposit bonus additions, trade bonus debits, credits, and manual adjustments."
        rightContent={<h3 className="text-2xl font-bold">{data.length}</h3>}
      />

      <div className="space-y-5 p-5 sm:p-6">
        <BonusSectionCard
          isDark={isDark}
          title="Filter Wallet Ledger"
          subtitle="Narrow down wallet movements using type and date"
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
          title="Wallet Ledger"
          subtitle="Detailed history of wallet changes"
        >
          {loading ? (
            <BonusTableLoader rows={8} />
          ) : data.length === 0 ? (
            <BonusEmptyState
              isDark={isDark}
              title="No ledger records found"
              subtitle="Wallet activity will appear here once bonus flows are triggered."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1100px] w-full text-left table-stack">
                <thead>
                  <tr
                    className={[
                      "text-xs uppercase tracking-[0.16em]","text-subtle",
                    ].join(" ")}
                  >
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Before</th>
                    <th className="px-4 py-3">After</th>
                    <th className="px-4 py-3">Reference Model</th>
                    <th className="px-4 py-3">Note</th>
                  </tr>
                </thead>

                <tbody>
                  {data.map((item) => (
                    <tr
                      key={item._id}
                      className={[
                        "border-t","border-line",
                      ].join(" ")}
                    >
                      <td data-label="Date" className="px-4 py-4">{formatDate(item.createdAt)}</td>
                      <td data-label="Type" className="px-4 py-4 capitalize">{item.type}</td>
                      <td data-label="Amount" className="px-4 py-4 font-semibold">
                        {formatCurrency(item.amount)}
                      </td>
                      <td data-label="Before" className="px-4 py-4">
                        {formatCurrency(item.balanceBefore)}
                      </td>
                      <td data-label="After" className="px-4 py-4">
                        {formatCurrency(item.balanceAfter)}
                      </td>
                      <td data-label="Reference Model" className="px-4 py-4">{item.referenceModel || "-"}</td>
                      <td data-label="Note" className="px-4 py-4">{item.note || "-"}</td>
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

export default BonusLedgerTab;
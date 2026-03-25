import { useState } from "react";
import { ConvertUnixTimestamp } from "@/utils/CustomFunctions";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";

export default function UserMt5Transactions({
  transactionData,
  tableVariants,
  rowVariants,
}) {
  const [filterType, setFilterType] = useState("all");
  const [filterAccount, setFilterAccount] = useState("");
  const [filterDateRange, setFilterDateRange] = useState("all");

  const getDateLimit = () => {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    switch (filterDateRange) {
      case "today":
        return todayStart;
      case "last3":
        return new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      case "last7":
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case "last30":
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return null;
    }
  };

  const filteredTransactionData = transactionData?.filter((item) => {
    const isDeposit = item.Profit > 0;
    const itemType = isDeposit ? "deposit" : "withdrawal";
    const itemDate = new Date(item.Time * 1000);

    const matchesType = filterType === "all" || filterType === itemType;

    const matchesAccount =
      filterAccount === "" ||
      item?.Login?.toString().includes(filterAccount.trim());

    const dateLimit = getDateLimit();
    const matchesDate = !dateLimit || itemDate >= dateLimit;

    return item.Action === 2 && matchesType && matchesAccount && matchesDate;
  });

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex flex-wrap gap-4 items-center text-sm">
        {/* Type Filter Dropdown */}
        <div>
          <label className="block mb-1 text-gray-300">Transaction Type</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-secondary-800/60 text-sm px-3 py-1 rounded-full text-white focus:outline-none"
          >
            <option className=" bg-secondary-900 border-none" value="all">
              All
            </option>
            <option className=" bg-secondary-900 border-none" value="deposit">
              Deposit
            </option>
            <option
              className=" bg-secondary-900 border-none"
              value="withdrawal"
            >
              Withdrawal
            </option>
          </select>
        </div>

        {/* Date Filter Dropdown */}
        <div>
          <label className="block mb-1 text-gray-300">Date Range</label>
          <select
            value={filterDateRange}
            onChange={(e) => setFilterDateRange(e.target.value)}
            className="bg-secondary-800/60 text-sm px-3 py-1 rounded-full text-white focus:outline-none"
          >
            <option className=" bg-secondary-900 border-none" value="all">
              All Time
            </option>
            <option className=" bg-secondary-900 border-none" value="today">
              Today
            </option>
            <option className=" bg-secondary-900 border-none" value="last3">
              Last 3 Days
            </option>
            <option className=" bg-secondary-900 border-none" value="last7">
              Last 7 Days
            </option>
            <option className=" bg-secondary-900 border-none" value="last30">
              Last 30 Days
            </option>
          </select>
        </div>

        {/* Account No Input */}
        <div>
          <label className="block mb-1 text-gray-300">Account No</label>
          <input
            type="text"
            placeholder="e.g. 123456"
            value={filterAccount}
            onChange={(e) => setFilterAccount(e.target.value)}
            className="bg-secondary-800/60 text-sm px-3 py-1 rounded-full text-white focus:outline-none"
          />
        </div>
      </div>

      {/* Transaction Table */}
      <table className="w-full whitespace-nowrap text-sm overflow-x-auto user-custom-scrollbar">
        <thead>
          <tr className="text-gray-400 border-b border-gray-700">
            <th className="text-center py-3 px-4">Type</th>
            <th className="text-center py-3 px-4">AC No</th>
            <th className="text-center py-3 px-4">Amount</th>
            <th className="text-center py-3 px-4">Comment</th>
            <th className="text-center py-3 px-4">Timestamp</th>
          </tr>
        </thead>
        <AnimatePresence>
          <motion.tbody variants={tableVariants}>
            {filteredTransactionData?.map((item, index) => {
              const isDeposit = item.Profit > 0;
              const typeLabel = isDeposit ? "Deposit" : "Withdrawal";
              const Icon = isDeposit ? ArrowUpCircle : ArrowDownCircle;
              const typeColor = isDeposit ? "text-green-400" : "text-red-400";
              const bgColor = isDeposit ? "bg-green-400/10" : "bg-red-400/10";
              const prefix = isDeposit ? "+" : "–";

              return (
                <motion.tr
                  key={index}
                  variants={rowVariants}
                  className="border-b border-gray-700/60 hover:bg-secondary-800 transition-all"
                  whileHover={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    transition: { duration: 0.2 },
                  }}
                >
                  <td className="py-2 px-4 text-center">
                    <div
                      className={`flex items-center justify-center gap-2 px-3 py-1 rounded-full font-medium ${bgColor} ${typeColor}`}
                    >
                      <Icon className="w-4 h-4" />
                      {typeLabel}
                    </div>
                  </td>
                  <td className="py-2 px-4 text-center">
                    <motion.div
                      className="bg-secondary-500-10 whitespace-nowrap rounded-full px-3 py-1 inline-block"
                      whileHover={{ scale: 1.05 }}
                    >
                      {item?.Login}
                    </motion.div>
                  </td>
                  <td className="py-2 px-4 text-center font-semibold">
                    <span className={typeColor}>
                      {prefix} {Math.abs(item?.Profit).toFixed(2)}
                    </span>
                  </td>
                  <td className="py-2 text-center">{item?.Comment}</td>
                  <td className="py-2 px-4 text-center capitalize">
                    {ConvertUnixTimestamp(item?.Time)}
                  </td>
                </motion.tr>
              );
            })}
          </motion.tbody>
        </AnimatePresence>
      </table>
    </div>
  );
}

import React from "react";
import { motion } from "framer-motion";
import {
  Scale,
  Activity,
  TrendingUp,
  TrendingDown,
  Target,
} from "lucide-react";
import { useSelector, useStore } from "react-redux";

const BalanceCard = ({
  icon: Icon,
  title,
  value,
  gradient,
  delay,
  isProfit,
}) => (
  <motion.div
    className="flex flex-col justify-between p-6 bg-secondary-700/90 rounded-xl shadow-lg overflow-hidden relative"
    style={{
      background: `linear-gradient(135deg, ${gradient})`,
    }}
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, delay }}
  >
    <div className="flex justify-between items-start mb-4">
      <div className="text-white">
        <p className="text-sm font-semibold mb-1">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <Icon className="w-8 h-8 text-white opacity-80" />
    </div>
    {isProfit !== undefined && (
      <div
        className={`text-sm font-medium ${
          isProfit ? "text-green-400" : "text-red-300"
        }`}
      >
        {isProfit ? "▲ 2.5%" : "▼ 1.8%"} from last trade
      </div>
    )}
    <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-white opacity-10" />
  </motion.div>
);

const UserDashboardCards = ({
  depositBalance,
  availableBalance,
  profitNloss,
}) => {
  const isPositive = parseFloat(profitNloss) >= 0;
  const loggedUser = useSelector((store) => store.user.loggedUser);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 rounded-2xl">
      <BalanceCard
        icon={Scale}
        title="Account Size"
        value={`${"999"} $USD`}
        gradient="#f97316, #fb923c"
        delay={0.1}
      />
      <BalanceCard
        icon={Activity}
        title="Available Balance"
        value={`${availableBalance} $UkkSD`}
        gradient="#3b82f6, #60a5fa"
        delay={0.2}
      />
      <BalanceCard
        icon={isPositive ? TrendingUp : TrendingDown}
        title="Profit/Loss"
        value={`${profitNloss} USD`}
        gradient={isPositive ? "#22c55e, #4ade80" : "#ef4444, #f87171"}
        delay={0.3}
        isProfit={isPositive}
      />
      <BalanceCard
        icon={Target}
        title="Target"
        value="6,000.00 USD"
        gradient="#a855f7, #d8b4fe"
        delay={0.4}
      />
    </div>
  );
};

export default UserDashboardCards;

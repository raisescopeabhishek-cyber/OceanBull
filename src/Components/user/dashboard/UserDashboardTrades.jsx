import { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {  userApi } from "@/utils/apiClients";
import ModernText from "../../lib/ModernText";
import { setOpenTrades } from "../../../redux/user/userSlice";

export default function UserDashboardTrades() {
  const navigate = useNavigate();
  const rawOpenTrades = useSelector((store) => store.user.openTrades);
  const openTrades = Array.isArray(rawOpenTrades) ? rawOpenTrades : [];

  const ProfitTradesData = openTrades.filter((value) => value.Profit > 0);
  const calculateWinningRatio = () => {
    const positiveTradesCount = openTrades.filter(
      (entry) => entry.Profit > 0
    ).length;

    const totalTradesCount = openTrades.length;
    if (totalTradesCount === 0) {
      return 0;
    }

    return (positiveTradesCount / totalTradesCount) * 100;
  };
  const loggedUser = useSelector((store) => store.user.loggedUser);

  const dispatch = useDispatch();

  const calculateTotalNetProfit = () => {
    const totalNetProfit = openTrades.reduce(
      (sum, entry) => sum + entry.Profit,
      0
    );

    return totalNetProfit;
  };

  const fetchOpenTrades = async () => {
    try {
      if (loggedUser.accounts.length > 0) {
        let data = [];
        for (const account of loggedUser.accounts) {
          // console.log("open trade api called");
          const res = await userApi.get(
            `/server-fetch-open-trade?MT5Accont=${account.accountNumber}`
          );
          if (Array.isArray(res.data.data)) {
            data = data.concat(res.data.data);
            dispatch(setOpenTrades(data));
          }
        }
      } else {
        console.log("No account found");
      }
    } catch (error) {
      console.log("error in openTrades", error);
      setTimeout(fetchOpenTrades, 1000); // Call again after 1 second
    }
  };

  const tradesSummary = {
    totalTrades: openTrades?.length,
    profitableTrades: ProfitTradesData?.length,
    winRate: calculateWinningRatio(),
    netProfit: calculateTotalNetProfit(),
  };

  useEffect(() => {
    const fetchBalance = setInterval(() => {
      fetchOpenTrades();
    }, 3000);
    return () => clearInterval(fetchBalance);
  }, []);

  return (
    <div className="bg-gradient-to-b from-indigo-900 to-indigo-950 mt-7 rounded-t-md  p-6  shadow-lg  text-white">
      <div className="flex justify-between items-center mb-6">
        <div className="">
          <ModernText text={"Open Trades Summary"}></ModernText>
        </div>
        <button
          onClick={() => navigate("/user/trade-history")}
          className="flex items-center text-blue-400 hover:text-blue-500 transition-colors"
        >
          View History
          <ArrowRight className="ml-1" size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-secondary-700/30  p-4 rounded-lg">
          <p className="text-gray-100 mb-1">Total Trades</p>
          <p className="text-2xl font-bold">{tradesSummary.totalTrades}</p>
        </div>
        <div className="bg-secondary-700/30 p-4 rounded-lg">
          <p className="text-gray-100 whitespace-nowrap mb-1">Profit Trades</p>
          <p className="text-2xl font-bold text-green-500">
            {tradesSummary.profitableTrades}
          </p>
        </div>
        <div className="bg-secondary-700/30 p-4 rounded-lg">
          <p className="text-gray-100 mb-1">PnL floating</p>
          <p className="text-2xl font-bold text-yellow-500">
            {tradesSummary.winRate.toFixed(2)}%
          </p>
        </div>
        <div className="bg-secondary-700/30 p-4 rounded-lg">
          <p className="text-gray-100 mb-1">Net Profit</p>
          <p
            className={`text-2xl font-bold ${
              tradesSummary.netProfit >= 0 ? "text-green-500" : "text-red-400"
            }`}
          >
            {tradesSummary.netProfit.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}

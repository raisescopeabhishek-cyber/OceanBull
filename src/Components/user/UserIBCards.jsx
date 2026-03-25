import { ArrowRight } from "lucide-react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { PiHandWithdrawBold } from "react-icons/pi";
import UseIbWithdrawalHistory from "@/hooks/user/ib/UseIbWithdrawalHistory";

const UserIBcards = ({ commissionsData }) => {
  const totalCommissionLength = commissionsData?.length;
  const totalCommissionValue = commissionsData.reduce(
    (increment, value) => increment + Number(value.totalCommission),
    0
  );
  const loggedUser = useSelector((store) => store.user.loggedUser);
  const { totalApprovedWithdrawal } = UseIbWithdrawalHistory();

  const stats = {
    totalIBs: Number(totalCommissionLength), // Assuming it's already an integer
    totalCommission: Number(totalCommissionValue).toFixed(4),
    availableCommission: Number(loggedUser?.ibBalance).toFixed(4),
    pendingWithdrawals: `$${Number(totalApprovedWithdrawal || 0).toFixed(4)}`,
  };

  return (
    <div className="p-6 w-full max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {/* Total Commission Card */}
        <div className="bg-secondary-600/10  rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium text-gray-300">
                Total Commission
              </span>
              <span className="text-2xl font-bold text-gray-100">
                ${Number(stats?.totalCommission || 0).toFixed(4)}
              </span>
            </div>

            <div className="p-3 bg-green-200 rounded-full">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-green-300/80 flex items-center">
              <span>Lifetime Commission Earnings</span>
            </div>
          </div>
        </div>
        {/* Withdrawal History Card */}
        <div className="bg-secondary-600/10  rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium text-gray-300">
                Withdrawals History
              </span>
              <span className="text-2xl font-bold text-gray-100">
                {stats.pendingWithdrawals}
              </span>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <PiHandWithdrawBold
                size={26}
                wi
                className=" text-blue-500"
              ></PiHandWithdrawBold>
            </div>
          </div>
          <div className="mt-4">
            <Link to={"/user/referrals/withdrawal-history"}>
              <div className="text-sm text-blue-400 hover:text-blue-500 hover:pl-1  transition-all flex gap-1 items-center">
                <span>Withdrawal History </span>
                <ArrowRight></ArrowRight>
              </div>
            </Link>
          </div>
        </div>

        {/* Available Commission Card */}
        <div className="bg-secondary-600/10  rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium text-gray-300">
                Withdrawable balance
              </span>
              <span className="text-2xl font-bold text-green-500/70">
                ${Number(loggedUser?.ibBalance || 0).toFixed(4)}
              </span>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <Link to={"/user/referrals/withdraw"}>
              <button className="w-full bg-green-600/80 hover:bg-green-700 text-white py-2 px-4 rounded-full transition-colors duration-200 flex items-center justify-center font-medium">
                Withdraw
              </button>
            </Link>
          </div>
        </div>

        {/*  IB Details Card */}
        <div className="bg-secondary-600/10 rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium text-gray-300">
                IB Details
              </span>
              <span className=" text-gray-300/60 text-sm py-2">
                Users with IB's
              </span>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">
              <svg
                className="w-6 h-6 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <Link to={"/user/referrals/referrals-details"}>
              <button
                className="w-full bg-indigo-600/80 hover:bg-indigo-700 text-white py-2 px-4 rounded-full transition-colors duration-200 flex items-center justify-center font-medium"
                onClick={() => console.log("View Clients clicked")}
              >
                View Details
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserIBcards;

import React, { useEffect, useState } from "react";
import { ArrowUpRight, Star, TrendingUp, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { copyApi } from "@/utils/apiClients";

const UserCopierCT = () => {
  const [hoveredId, setHoveredId] = useState(null);
  const [masterAccounts, setMasterAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMastersData();
  }, []);

  const fetchMastersData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await copyApi.post(`/getAllMasterByManagerIndex`, {
        Manager_Index: import.meta.env.VITE_COPY_MANAGER_INDEX,
      });
      setMasterAccounts(res.data.masterAccounts);
    } catch (error) {
      console.error("Error fetching master accounts:", error);
      setError("Failed to fetch master accounts. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderTableHeader = () => (
    <thead>
      <tr className="bg-secondary-500-80">
        <th className="text-left p-4 text-sm font-medium text-gray-100 w-[30%] first:rounded-tl-xl">
          TRADER
        </th>
        <th className="text-left p-4 text-sm font-medium text-gray-100 w-[15%]">
          RISK SCORE
        </th>
        <th className="text-left p-4 text-sm font-medium text-gray-100 w-[15%]">
          GAIN
          <span className="text-xs block text-gray-300">All time</span>
        </th>
        <th className="text-left p-4 text-sm font-medium text-gray-100 w-[25%]">
          COPIERS
        </th>
        <th className="text-left p-4 text-sm font-medium text-gray-100 w-[15%] last:rounded-tr-xl">
          COMMISSION
        </th>
      </tr>
    </thead>
  );

  const renderTableRow = (trader) => (
    <tr
      key={trader.id}
      onClick={() => navigate(`/user/copy-trading/master-user/${trader.login}`)}
      className="transition-colors hover:bg-secondary-500-20 cursor-pointer"
      onMouseEnter={() => setHoveredId(trader.id)}
      onMouseLeave={() => setHoveredId(null)}
    >
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
              <img
                src={`https://i.pinimg.com/736x/82/9e/6d/829e6d37c5845732e657d25ff8950a67.jpg`}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-gray-100 truncate">
              {trader?.name}
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 flex-shrink-0 text-yellow-500" />
              <span className="text-sm text-gray-300 truncate">{"Expert"}</span>
            </div>
          </div>
        </div>
      </td>
      <td className="p-4">
        <span
          className={`
          inline-flex items-center px-3 py-1 text-sm font-medium text-white rounded-full
          ${trader?.riskScore <= 2 ? "bg-green-500" : "bg-red-500"}
          transition-transform duration-200
          ${hoveredId === trader.id ? "scale-105" : ""}
        `}
        >
          {trader?.riskScore} risk
        </span>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-1 text-green-500 font-semibold whitespace-nowrap">
          <TrendingUp
            className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${
              hoveredId === trader?.id ? "translate-y-[-2px]" : ""
            }`}
          />
          +{trader?.gain}%
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{trader?.copiers}</span>
          <ArrowUpRight className="w-4 h-4 text-green-500 flex-shrink-0" />
        </div>
      </td>
      <td className="p-4 text-center">
        <span className="font-medium">{trader?.commission}%</span>
      </td>
    </tr>
  );

  const renderLoader = () => (
    <div className="flex justify-center items-center h-64">
      <div className="animate-pulse flex space-x-4">
        <div className="rounded-full bg-slate-700 h-10 w-10"></div>
        <div className="flex-1 space-y-6 py-1">
          <div className="h-2 bg-slate-700 rounded"></div>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="h-2 bg-slate-700 rounded col-span-2"></div>
              <div className="h-2 bg-slate-700 rounded col-span-1"></div>
            </div>
            <div className="h-2 bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderError = () => (
    <div className="flex justify-center items-center h-64">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-500 font-semibold">{error}</p>
        <button
          onClick={fetchMastersData}
          className="mt-4 px-4 py-2  text-blue-400 hover:text-blue-500 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <div className="w-full bg-secondary-800/40 rounded-xl shadow-xl">
        {isLoading ? (
          renderLoader()
        ) : error ? (
          renderError()
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              {renderTableHeader()}
              <tbody className="divide-y divide-secondary-500/60">
                {masterAccounts?.map(renderTableRow)}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCopierCT;

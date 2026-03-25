import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useSelector } from "react-redux";

const UserDashboardAccountStats = () => {
  const [openDropdowns, setOpenDropdowns] = useState({});
  const loggedUser = useSelector((store) => store.user.loggedUser);
  const phaseStats = useSelector((store) => store.user.phaseStats);
  // console.log("phase stats account stats dashboard--", phaseStats);
  const phaseOverallLossInNumber =
    (loggedUser?.calculatedLoss / 100) * loggedUser.accountSize;
  // console.log(object);

  const phaseDailyLossInNumber =
    (phaseStats?.min / 100) * loggedUser.accountSize;

  const phaseMaxValueInNumber =
    (phaseStats?.max / 100) * loggedUser.accountSize;

  // console.log("phase max value##--", phaseMaxValueInNumber);
  // console.log("phase max value##--", phaseMinValueInNumber);

  const toggleDropdown = (id) => {
    setOpenDropdowns((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const stats = [
    {
      id: "Maximum Profit",
      label: "Maximum Profit",
      value: `${
        phaseMaxValueInNumber === Infinity
          ? "No Limit" || null
          : `${phaseMaxValueInNumber} (${phaseStats?.max}%)` || null
      }`,
      status: "Reached",
      description:
        "Maximize your trading potential with our advanced CRM. Track your trades, manage accounts, and secure Max Profit on every move!",
    },
    {
      id: "Overall Loss",
      label: "Overall Loss",
      value: `${phaseOverallLossInNumber} (${loggedUser?.calculatedLoss}%)`,
      status: "Passing",
      description:
        "Protect your account from excessive losses! Our CRM helps you track your positions and ensures you stay within your Overall Loss limit, keeping your trading on the right path.",
    },
    {
      id: "Daily Loss",
      label: "Daily Loss",
      value: `${
        phaseDailyLossInNumber === Infinity
          ? "No Limit" || null
          : `${phaseDailyLossInNumber} (${phaseStats?.min}%)` || null
      }`,
      status: "Passing",
      description:
        "Take control of your trading discipline! Our CRM actively monitors your positions and ensures your account is automatically closed when your Daily Loss limit is reached, protecting you from further losses.",
    },
  ];

  return (
    <div className="bg-secondary-800/70 shadow-md rounded-lg p-4 sm:p-6 max-w-full sm:max-w-4xl mx-auto">
      <h2
        className="text-2xl sm:text-3xl text-center font-semibold text-gray-100 
             mb-6 tracking-wide"
      >
        Account Stats
        {loggedUser.phase > 0 && (
          <span
            className="font-bold text-transparent bg-clip-text 
               bg-gradient-to-r from-gray-200 to-secondary-500"
          >
            {" "}
            - {loggedUser.accountType}
          </span>
        )}
      </h2>
      <div className="space-y-2">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className=" border-b border-secondary-600/30 rounded-md overflow-hidden"
          >
            <div
              className="flex justify-between items-center p-3 cursor-pointer text-sm sm:text-base"
              onClick={() => toggleDropdown(stat.id)}
            >
              <span
                className="font-semibold text-gradient bg-clip-text text-transparent 
             bg-gradient-to-r from-gray-200 to-secondary-500 
             text-lg tracking-wide hover:scale-105 transition-transform duration-300"
              >
                {stat.label}
              </span>
              <div
                className="flex items-center justify-between bg-secondary-500-10 text-gray-200 hover:text-secondary-500 
             p-2 rounded-full px-3 shadow-sm transition-all duration-100"
              >
                <span
                  className="mr-2 text-sm font-medium
               transition-colors duration-300"
                >
                  {loggedUser.phase > 0 && stat.value}
                </span>
                <div
                  className="text-gray-500 hover:text-blue-600 cursor-pointer 
               transition-transform duration-300"
                >
                  {openDropdowns[stat.id] ? (
                    <ChevronUp
                      size={20}
                      className="transform hover:scale-110"
                    />
                  ) : (
                    <ChevronDown
                      size={20}
                      className="transform hover:scale-110"
                    />
                  )}
                </div>
              </div>
            </div>
            <div
              className={`transition-all duration-300 ease-in-out ${
                openDropdowns[stat.id]
                  ? "max-h-40 opacity-100"
                  : "max-h-0 opacity-0"
              } overflow-hidden`}
            >
              {stat.description && (
                <div className="p-3 bg-secondary-700/20 text-sm sm:text-base">
                  {stat.description}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserDashboardAccountStats;

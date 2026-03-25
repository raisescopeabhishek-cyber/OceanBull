import React, { useEffect, useState } from "react";
import axios from "axios";
import StatCards from "./Cards/UserStatCards";
import DepositSummary from "./DepositSummary";
import WithdrawalSummary from "./WithdrawalSummary";
import IbWithdrawalSummary from "./IbWithdrawalSummary";
import RecentActivities from "./RecentActivities";

const DashboardBase = () => {
  const [userReport, setUserReport] = useState(null);
  const [ibWithdrawalReport, setIbWithdrawalReport] = useState(null);
  const [depositReport, setDepositReport] = useState(null);
  const [withdrawalReport, setWithdrawalReport] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("admin_password_ref");

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-api-key": "@#demo-ncrm",
        },
      };

      const [userRes, ibWithdrawalRes, depositRes, withdrawalRes] =
        await Promise.all([
          axios.get(
            "https://demo-ncrm.testcrm.top/api/auth/user-report",
            config
          ),
          axios.get(
            "https://demo-ncrm.testcrm.top/api/auth/ib-withdrawal-report",
            config
          ),
          axios.get(
            "https://demo-ncrm.testcrm.top/api/auth/deposit-report",
            config
          ),
          axios.get(
            "https://demo-ncrm.testcrm.top/api/auth/withdrawal-report",
            config
          ),
        ]);

      setUserReport(userRes.data.data);
      setIbWithdrawalReport(ibWithdrawalRes.data.data);
      setDepositReport(depositRes.data.data);
      setWithdrawalReport(withdrawalRes.data.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="p-8 min-h-screen w-full mx-auto">
      <h2 className="text-4xl flex flex-col text-center  text-white font-thin  mb-8 tracking-tight">
        <span>📈 Forex CRM Dashboard</span>
        <span className="border-b-2 mt-5 w-28 mx-auto opacity-20 "></span>
      </h2>

      <StatCards
        userReport={userReport}
        depositReport={depositReport}
        withdrawalReport={withdrawalReport}
        ibWithdrawalReport={ibWithdrawalReport}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <DepositSummary report={depositReport} />
        <WithdrawalSummary report={withdrawalReport} />
      </div>

      <IbWithdrawalSummary report={ibWithdrawalReport} />
      <RecentActivities />
    </div>
  );
};

export default DashboardBase;

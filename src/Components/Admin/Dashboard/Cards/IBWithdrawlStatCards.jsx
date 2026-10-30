import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Users2,
  UserCheck,
  UserX,
  MailCheck,
  MailX,
  Wallet,
  Banknote,
} from "lucide-react";

const IBWithdrawlStatCards = () => {
  const [ibWithdrawalReport, setIbWithdrawalReport] = useState({});
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const API_KEY = import.meta.env.VITE_API_KEY;

  const formatNumber = (num) => (num || num === 0 ? num.toLocaleString() : "-");

  const fetchIbWithdrawalReport = async () => {
    try {
      const token = localStorage.getItem("admin_password_ref");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-api-key": API_KEY,
        },
      };

      const res = await axios.get(`${API_URL}/api/auth/ib-withdrawal-report`, config);
      setIbWithdrawalReport(res?.data?.data || {});
    } catch (err) {
      console.error("❌ Failed to fetch IB withdrawal report:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIbWithdrawalReport();
  }, []);

  const cards = [
    {
      title: "Approved",
      value: formatNumber(ibWithdrawalReport?.approved),
      icon: <Users2 className="text-text" size={26} />,
    },
    {
      title: "Last Month Approved",
      value: formatNumber(ibWithdrawalReport?.lastMonthApproved),
      icon: <UserCheck className="text-text" size={26} />,
    },
    {
      title: "Last Week Approved",
      value: formatNumber(ibWithdrawalReport?.lastWeekApproved),
      icon: <UserX className="text-text" size={26} />,
    },
    {
      title: "Pending",
      value: formatNumber(ibWithdrawalReport?.pending),
      icon: <MailCheck className="text-text" size={26} />,
    },
    {
      title: "Rejected",
      value: formatNumber(ibWithdrawalReport?.rejected),
      icon: <MailX className="text-text" size={26} />,
    },
    {
      title: "Today Approved",
      value: formatNumber(ibWithdrawalReport?.todayApproved),
      icon: <Wallet className="text-text" size={26} />,
    },
    {
      title: "Total",
      value: formatNumber(ibWithdrawalReport?.total),
      icon: <Banknote className="text-text" size={26} />,
    },
  ];

  return (
    <div className="p-4 rounded-field">
      <h2 className="text-lg font-semibold text-text mb-6">IB Withdrawal Report</h2>

      {loading ? (
        <p className="text-text text-center">Loading report...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="rounded-card p-6 text-text flex flex-col items-center justify-center transition hover:scale-[1.02] duration-300"
            >
              {/* Icon */}
              <div className="mb-3">{card.icon}</div>

              {/* Title */}
              <h4 className="text-sm font-medium opacity-90 text-center">
                {card.title}
              </h4>

              {/* Value */}
              <p className="text-xl mt-1 font-bold text-center">{card.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IBWithdrawlStatCards;

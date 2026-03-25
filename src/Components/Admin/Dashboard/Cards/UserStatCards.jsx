import React, { useEffect, useState } from "react";
import {
  Users2,
  UserCheck,
  UserX,
  MailCheck,
  MailX,
  Wallet,
  Banknote,
  CreditCard,
} from "lucide-react";
import axios from "axios";

const UserStatCards = () => {
  const [userReport, setUserReport] = useState();
const API_URL =  import.meta.env.VITE_API_BASE_URL;
const API_KEY =  import.meta.env.VITE_API_KEY;

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("admin_password_ref");

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-api-key": API_KEY,
        },
      };

      const [userRes] = await Promise.all([
        axios.get(`${API_URL}/api/auth/user-report`, config),
      ]);

      setUserReport(userRes.data.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatNumber = (num) => (num || num === 0 ? num.toLocaleString() : "-");

  const statCards = [
    {
      title: "Total Users",
      value: formatNumber(userReport?.totalUsers),
      icon: <Users2 className="text-white" size={26} />,
      color: "bg-gradient-to-br from-indigo-900 via-indigo-950 to-indigo-900",
    },
    {
      title: "KYC Verified",
      value: formatNumber(userReport?.kycVerified),
      icon: <UserCheck className="text-white" size={26} />,
      color: "bg-gradient-to-br from-indigo-900 via-indigo-950 to-indigo-900",
    },
    {
      title: "KYC Unverified",
      value: formatNumber(userReport?.kycUnverified),
      icon: <UserX className="text-white" size={26} />,
      color: "bg-gradient-to-br from-indigo-900 via-indigo-950 to-indigo-900",
    },
    {
      title: "Email Verified",
      value: formatNumber(userReport?.emailVerified),
      icon: <MailCheck className="text-white" size={26} />,
      color: "bg-gradient-to-br from-indigo-900 via-indigo-950 to-indigo-900",
    },
    {
      title: "Email Unverified",
      value: formatNumber(userReport?.emailUnverified),
      icon: <MailX className="text-white" size={26} />,
      color: "bg-gradient-to-br from-indigo-900 via-indigo-950 to-indigo-900",
    },

    {
      title: "Today Registered users",
      value: formatNumber(userReport?.emailUnverified),
      icon: <MailX className="text-white" size={26} />,
      color: "bg-gradient-to-br from-indigo-900 via-indigo-950 to-indigo-900",
    },

    {
      title: "Last Week Users",
      value: formatNumber(userReport?.emailUnverified),
      icon: <MailX className="text-white" size={26} />,
      color: "bg-gradient-to-br from-indigo-900 via-indigo-950 to-indigo-900",
    },

    {
      title: "Last Month Users",
      value: formatNumber(userReport?.emailUnverified),
      icon: <MailX className="text-white" size={26} />,
      color: "bg-gradient-to-br from-indigo-900 via-indigo-950 to-indigo-900",
    },

    {
      title: "Total IB Users",
      value: formatNumber(userReport?.totalIbUsers),
      icon: <Wallet className="text-white" size={26} />,
      color: "bg-gradient-to-br from-indigo-900 via-indigo-950 to-indigo-900",
    },
    {
      title: "Total Referrals",
      value: formatNumber(userReport?.totalReferralUsers),
      icon: <Banknote className="text-white" size={26} />,
      color: "bg-gradient-to-br from-indigo-900 via-indigo-950 to-indigo-900",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
      {statCards.map((card, idx) => (
        <div
          key={idx}
          className={`rounded-2xl p-6 text-white flex flex-col items-center justify-center shadow-md transition hover:scale-[1.02] duration-300 ${card.color}`}
        >
          {/* 1st Row: Icon */}
          <div className="mb-3">{card.icon}</div>

          {/* 2nd Row: Title */}
          <h4 className=" text-sm font-medium opacity-90 text-center">
            {card.title}
          </h4>

          {/* 3rd Row: Value */}
          <p className="text-xl mt-1 font-bold text-center">{card.value}</p>
        </div>
      ))}
    </div>
  );
};

export default UserStatCards;

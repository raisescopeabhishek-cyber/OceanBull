import { useEffect } from "react";
import { motion } from "framer-motion";
import UserDashboardAccount from "./dashboard/UserDashboardAccount";
import UserDashboardBanner from "./dashboard/UserDashboardBanner";
import UserDashboardTrades from "./dashboard/UserDashboardTrades";
import UserDashboardBalanceCards from "./dashboard/UserDashboardCards";
import TradingViewWidget from "./dashboard/TradingViewWidget";
import UseUserHook from "../../hooks/user/UseUserHook";
import { Card, CardContent } from "../Admin/ui/card";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import TradingViewWidget2 from "./dashboard/TradingViewWidget2";
import UserDashboardTransaction from "./dashboard/UserDashboardTransaction";

export default function UserDashboard() {
  const { getUpdateLoggedUser } = UseUserHook();

  const lineData = [
    { name: "Jan", sales: 4000 },
    { name: "Feb", sales: 3000 },
    { name: "Mar", sales: 5000 },
    { name: "Apr", sales: 7000 },
  ];

  const barData = [
    { category: "Trade", orders: 25 },
    { category: "Profit Trade", orders: 15 },
    { category: "Pnl Floating", orders: 30 },

    { category: "Net Profit", orders: 30 },
  ];

  const pieData = [
    { name: "New Users", value: 300 },
    { name: "Returning", value: 200 },
    { name: "Guest", value: 100 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getUpdateLoggedUser();
      } catch (error) {
        console.error("Error in dashboard:", error);
      }
    };
    fetchData();
    const intervalId = setInterval(() => {
      fetchData();
    }, 3000);

    return () => clearInterval(intervalId);
  }, []);
  const COLORS = ["#4f46e5", "#38bdf8", "#10b981"];

  return (
    <motion.div
      className="pb-10 p-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Main 2-column layout */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column */}
        <div className="md:w-1/3 w-full ">
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <UserDashboardBalanceCards />
            <UserDashboardTrades />
            {/* <UserDashboardTransaction /> */}

          </motion.div>
        </div>

        {/* Right Column */}
        <div className="md:w-2/3 w-full flex flex-col gap-6">
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-6`}>
            <Card className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-indigo-900 p-3 rounded-sm text-white shadow-md">
              <CardContent className="p-0">
                <div className="p-4">
                  <h2 className="text-lg text-white font-semibold mb-4">
                    Open Trade Analysis
                  </h2>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={barData}>
                      <XAxis dataKey="category" stroke="#fff" />
                      <YAxis stroke="#fff" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e1b4b",
                          border: "none",
                          color: "#fff",
                        }}
                      />
                      <Bar dataKey="orders" fill="#38bdf8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <UserDashboardAccount />
            

            {/* <Card className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-indigo-900 p-3 rounded-sm text-white shadow-md">
               <CardContent className="p-4">
                 <h2 className="text-lg text-white font-semibold mb-4">
                   User Types
                 </h2>
                 <ResponsiveContainer width="100%" height={250}>
                   <PieChart>
                     <Pie
                       data={pieData}
                       dataKey="value"
                       nameKey="name"
                       cx="50%"
                       cy="50%"
                       outerRadius={80}
                       label
                     >
                       {pieData.map((entry, index) => (
                         <Cell
                           key={`cell-${index}`}
                           fill={COLORS[index % COLORS.length]}
                         />
                       ))}
                     </Pie>
                     <Tooltip />
                   </PieChart>
                 </ResponsiveContainer>
               </CardContent>
             </Card> */}


          </div>

          {/* <UserDashboardAccount /> */}
          {/* <TradingViewWidget /> */}

          <motion.div
            className="grid md:grid-cols-2 grid-cols-1 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >

            <UserDashboardTransaction />
            <UserDashboardBanner />

          </motion.div>

          {/* <motion.div>
            <Card className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-indigo-900 p-3 rounded-sm text-white shadow-md">
              <CardContent className="p-0">
                <div className="p-4">
                  <h2 className="text-lg text-white font-semibold mb-4">
                    MT5 Account
                  </h2>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={barData}>
                      <XAxis dataKey="category" stroke="#fff" />
                      <YAxis stroke="#fff" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e1b4b",
                          border: "none",
                          color: "#fff",
                        }}
                      />
                      <Bar dataKey="orders" fill="#38bdf8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div> */}
{/* 
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold mb-4">
                  Orders by Category
                </h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={barData}>
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#38bdf8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold mb-4">User Types</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div> */}
        </div>
      </div>
    </motion.div>
  );
}

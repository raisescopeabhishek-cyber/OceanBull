import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import UserStatCards from "../../Admin/Dashboard/Cards/UserStatCards";
import WithdrawalSummary from "../../Admin/Dashboard/WithdrawalSummary";
import RecentActivities from "../../Admin/Dashboard/RecentActivities";
import IBWithdrawlStatCards from "../../Admin/Dashboard/Cards/IBWithdrawlStatCards";
import DepositeStatCards from "../../Admin/Dashboard/Cards/DepositeStatCards";
import UserBarChart from "../../Admin/Dashboard/Cards/UserBarChart";
import { Card, CardContent } from "../../Admin/ui/card";











const theme =
  "bg-gradient-to-br from-indigo-900 via-indigo-950 to-indigo-900 p-3 rounded-sm";
// Sample data
const lineData = [
  { name: "Jan", sales: 4000 },
  { name: "Feb", sales: 3000 },
  { name: "Mar", sales: 5000 },
  { name: "Apr", sales: 7000 },
];

const barData = [
  { category: "Electronics", orders: 40 },
  { category: "Grocery", orders: 25 },
  { category: "Pharmacy", orders: 15 },
  { category: "Clothing", orders: 30 },

  { category: "Clothing", orders: 30 },
  { category: "Clothing", orders: 30 },
  { category: "Clothing", orders: 30 },
  { category: "Clothing", orders: 30 },
  { category: "Clothing", orders: 30 },
  { category: "Clothing", orders: 30 },
  { category: "Clothing", orders: 30 },
  { category: "Clothing", orders: 30 },
  { category: "Clothing", orders: 30 },
  { category: "Clothing", orders: 30 },
  { category: "Clothing", orders: 30 },
];

const pieData = [
  { name: "New Users", value: 300 },
  { name: "Returning", value: 200 },
  { name: "Guest", value: 100 },
];

const COLORS = ["#4f46e5", "#38bdf8", "#10b981"];

const DashboardBase = ({
  userReport,
  depositReport,
  withdrawalReport,
  ibWithdrawalReport,
}) => {
  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white">
      {/* LEFT COLUMN */}
      <div className="lg:col-span-1 space-y-6 shadow-2xl ">
        <div className={theme}>
          <h1 className="text-2xl mb-4">User Infomation</h1>
          {/* ✅ Replaced with StatCards */}
          <UserStatCards
            userReport={userReport}
            depositReport={depositReport}
            withdrawalReport={withdrawalReport}
            ibWithdrawalReport={ibWithdrawalReport}
          />
        </div>

        <div>
          <UserBarChart />
        </div>

        <div className={theme}>
          <h1 className="text-2xl mb-4">Deposit & Withdraw Report</h1>
          {/* ✅ Replaced with StatCards */}
          <DepositeStatCards
            userReport={userReport}
            depositReport={depositReport}
            withdrawalReport={withdrawalReport}
            ibWithdrawalReport={ibWithdrawalReport}
          />
        </div>

        <div className={theme}>
          <h1 className="text-2xl mb-4">IB Withdrawal Report</h1>
          {/* ✅ Replaced with StatCards */}
          <IBWithdrawlStatCards
            userReport={userReport}
            depositReport={depositReport}
            withdrawalReport={withdrawalReport}
            ibWithdrawalReport={ibWithdrawalReport}
          />
        </div>

        {/* ✅ Withdrawal Summary Card */}
        <WithdrawalSummary report={withdrawalReport} />

        {/* ✅ Recent Activities */}
        <RecentActivities />
      </div>

      {/* RIGHT COLUMN */}
      <div className="lg:col-span-2 space-y-6 shadow-2xl">
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6`}>
          <Card className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-indigo-900 p-3 rounded-sm text-white shadow-md">
            <CardContent className="p-0">
              <div className="p-4">
                <h2 className="text-lg text-white font-semibold mb-4">
                  Orders by Category
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

          <Card className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-indigo-900 p-3 rounded-sm text-white shadow-md">
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
          </Card>
        </div>

        {/* <div className={theme}>
          <h1 className="text-2xl mb-4">MT5 Accounts Report</h1>
          <MT5AccountStatCards
            userReport={userReport}
            depositReport={depositReport}
            withdrawalReport={withdrawalReport}
            ibWithdrawalReport={ibWithdrawalReport}
          />
        </div> */}

        {/* Bar and Pie Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-4">Orders by Category</h2>
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
        </div>

        {/* Line Chart */}
        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-4">Monthly Sales Trend</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={lineData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#4f46e5"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardBase;

import {
  Wallet,
  CreditCard,
  ArrowLeftRight,
  Users,
  BoxIcon,
} from "lucide-react";
import UserInfoForm from "@/components/admin/user-detail/UserForm";
import { useParams } from "react-router-dom";
import UserTradeAccounts from "@/components/admin/user-detail/UserTradeAccounts";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { adminApi } from "@/utils/apiClients";
import { useMt5Accounts } from "../../../hooks/useMt5Accounts";

const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const StatCard = ({ icon, amount, label, bgColor }) => (
  <motion.div
    variants={cardVariants}
    className={`p-4 px-10  rounded-full shadow-lg transition-all duration-300 hover:bg-black/40 ${bgColor} text-white`}
    style={{
      backgroundImage:
        "url('https://png.pngtree.com/background/20230109/original/pngtree-white-abstract-carbon-fiber-texture-background-picture-image_1996167.jpg')", // More visible pattern
      overlay: "auto",
      backgroundBlendMode: "overlay",
      backgroundSize: "cover",
    }}
  >
    <div className="flex justify-center items-center">
      <div className="flex items-center">
        {icon}
        <div className="ml-3">
          <p className="text-2xl font-bold">{amount}</p>
          <p className="text-sm opacity-80">{label}</p>
        </div>
      </div>
    </div>
  </motion.div>
);

const UserDetailDashboard = ({ username }) => {
  const { id } = useParams();
  const [userData, setUserData] = useState();
  const [totalDeposit, setTotalDeposit] = useState([]);
  const [totalWithdrwal, setTotalWithdrwal] = useState([]);
  const totalTransactions = [...totalDeposit, ...totalWithdrwal];
  const totalTransactionsLength = totalTransactions.length;
  const [loading, setLoading] = useState(true);
  const userRequestRef = useRef(0);
  const accountNumbers = useMemo(
    () => String(userData?._id) === String(id)
      ? (userData?.accounts || []).map((account) => account.accountNumber)
      : [],
    [userData, id]
  );
  const { byLogin, isReady } = useMt5Accounts(accountNumbers);
  const equityLoading = loading || accountNumbers.some((account) => !isReady(account, ["Equity"]));
  const totalBalance = accountNumbers.reduce(
    (total, account) => total + (byLogin[String(account)]?.Equity ?? 0),
    0
  );
  const totalInvestAmount = totalDeposit.reduce(
    (total, value) => total + (Number(value.deposit) || 0),
    0
  );
  const totalWithdrwalAmount = totalWithdrwal.reduce(
    (total, value) => total + (Number(value.amount) || 0),
    0
  );
  const fetchUserData = async () => {
    const request = ++userRequestRef.current;
    setLoading(true);
    try {
      const res = await adminApi.get(`/get-user?id=${id}`);
      const depositRes = await adminApi.get(`/deposits`);
      const withdrwalRes = await adminApi.get(`/withdrawals`);
      if (request !== userRequestRef.current) return;

      setUserData(res.data.data);
      setTotalDeposit(
        depositRes.data.data.filter(
          (value) => value?.userId?._id === res.data.data._id
        )
      );

      setTotalWithdrwal(
        withdrwalRes.data.data.filter(
          (value) => value?.userId?._id === res.data.data._id
        )
      );
    } catch (error) {
      if (request !== userRequestRef.current) return;
      console.log("error in fetch user data", error);
    } finally {
      if (request === userRequestRef.current) setLoading(false);
    }
  };

  const stats = [
    {
      icon: <BoxIcon size={24} />,
      amount: `${userData?.accounts?.length}`,
      label: "Total MT5 ID",
      bgColor: "bg-green-800",
    },
    {
      icon: <CreditCard size={24} />,
      amount: equityLoading ? "Updating..." : `$${totalBalance.toFixed(2)}`,
      label: "Total Available Balance",
      bgColor: "bg-indigo-800",
    },
    {
      icon: <ArrowLeftRight size={24} />,
      amount: `$${totalWithdrwalAmount}`,
      label: "Withdrawals",
      bgColor: "bg-teal-800",
    },
    {
      icon: <ArrowLeftRight size={24} />,
      amount: `${totalTransactionsLength}`,
      label: "Transactions",
      bgColor: "bg-purple-900",
    },
    {
      icon: <Wallet size={24} />,
      amount: `$${totalInvestAmount}`,
      label: "Deposits",
      bgColor: "bg-sky-900",
    },
    {
      icon: <Users size={24} />,
      amount: "$0",
      label: "Total Referral Commission",
      bgColor: "bg-yellow-900/80",
    },
  ];

  // useEffect ----------------------

  useEffect(() => {
    if (id) fetchUserData();
    return () => { userRequestRef.current += 1; };
  }, [id]);

  return (
    <div className=" w-full mx-auto px-10 py-5 rounded-lg bg-primary-700 shadow-lg">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
      >
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </motion.div>
      <UserInfoForm userData={userData}></UserInfoForm>
      <UserTradeAccounts
        fetchUserData={fetchUserData}
        userData={userData}
      ></UserTradeAccounts>
    </div>
  );
};

export default UserDetailDashboard;

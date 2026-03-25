import { motion } from "framer-motion";
import {
  User,
  Key,
  Shield,
  CheckCircle,
  Info,
  PanelTopInactiveIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState } from "react";
import { MdOutlineAccountBalanceWallet } from "react-icons/md";
import { useGetIdInfo } from "../../../hooks/user/UseGetIdInfo";
import { CiMoneyBill } from "react-icons/ci";

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (delay) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay },
  }),
};

const CredentialItem = ({
  icon: Icon,
  label,
  value,
  badgeColor = "",
  delay,
  link,
}) => (
  <motion.div
    className="flex items-center justify-between py-2"
    variants={itemVariants}
    custom={delay}
    initial="hidden"
    animate="visible"
  >
    <div className="flex items-center space-x-3">
      <Icon className="w-5 h-5 text-gray-300" />
      <span className="text-sm font-medium text-gray-200">{label}</span>
    </div>
    <Link to={link || "#"}>
      <motion.div
        className="flex items-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.1 }}
      >
        <span
          className={`text-sm font-medium px-3 py-1 rounded-full ${badgeColor} bg-opacity-80`}
        >
          {value}
        </span>
      </motion.div>
    </Link>
  </motion.div>
);

const UserDashboardAccount = () => {
  const loggedUser = useSelector((store) => store.user.loggedUser);
  const siteConfig = useSelector((store) => store.user.siteConfig);
  const [currentAccount, setCurrentAccount] = useState(() => {
    if (loggedUser?.accounts?.length > 0) {
      return loggedUser.accounts[0];
    }
    return { accountNumber: "000", leverage: "00" };
  });
  const { info, loading } = useGetIdInfo(currentAccount.accountNumber);

  const handleAccountChange = (e) => {
    const selectedAccount = loggedUser.accounts.find(
      (account) => account.accountNumber === e.target.value
    );
    setCurrentAccount(
      selectedAccount || { accountNumber: "000", leverage: "N/A" }
    );
  };

  return (
    <motion.div
      className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-indigo-900  shadow-lg rounded-lg p-6 min-w-md "
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="text-2xl flex justify-between items-center gap-5 mb-2 whitespace-nowrap text-gray-200"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="font-semibold justify-center items-center flex sm:flex-row flex-col text-lg">
          <p>Server :</p>
          <span className="bg-secondary-500-10 text-sm md:text-lg mt-1 rounded-full py-1 px-3">
            {siteConfig?.serverName}
          </span>
        </div>

        
        <div className="text-sm">
          {Array.isArray(loggedUser?.accounts) &&
            loggedUser.accounts.length > 0 && (
              <select
                onChange={handleAccountChange}
                id="accountNumber"
                name="accountNumber"
                className="w-full border-none py-1 rounded-full bg-secondary-500-10 px-2 outline-none font-semibold border-gray-700 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
              >
                <option
                  disabled
                  className="bg-blue-950 text-white"
                  value=""
                >
                  Select Account
                </option>
                {loggedUser.accounts?.map((account, index) => (
                  <option
                    key={index}
                    className="bg-blue-950  font-semibold text-white"
                    value={account.accountNumber}
                  >
                    {account.accountNumber}
                  </option>
                ))}
              </select>
            )}
        </div>
      </motion.div>

      <motion.div
        className="space-y-1"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
      >
        <CredentialItem
          icon={User}
          label="Trading Account"
          value={currentAccount.accountNumber}
          badgeColor="bg-blue-100 text-blue-800"
          delay={0.2}
        />
        <CredentialItem
          icon={MdOutlineAccountBalanceWallet}
          label="Balance"
          value={`$${info?.Balance || 0}`}
          badgeColor="bg-sky-100 text-sky-800"
          delay={0.3}
        />
        <CredentialItem
          icon={CiMoneyBill}
          label="Equity"
          value={`$${info?.Equity || 0}`}
          badgeColor="bg-sky-100 text-sky-800"
          delay={0.4}
        />
        <CredentialItem
          icon={CheckCircle}
          label="Leverage"
          value={currentAccount.leverage}
          badgeColor="bg-indigo-100 text-indigo-800"
          delay={0.5}
        />
        <CredentialItem
          icon={PanelTopInactiveIcon}
          label="Account Type"
          value={currentAccount.accountType || "N/A"}
          badgeColor="bg-orange-100 text-orange-800"
          delay={0.6}
        />
        <CredentialItem
          icon={Info}
          label="KYC Status"
          value={loggedUser?.kycVerified ? "Active" : "Inactive"}
          badgeColor={
            loggedUser?.kycVerified
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-700"
          }
          delay={0.7}
        />
      </motion.div>
    </motion.div>
  );
};

export default UserDashboardAccount;

import  { useState } from "react";
import {  GraduationCap, User, Wallet } from "lucide-react";
import UserCopierCT from "./copy-trading/UserCopierCT";
import UserMasterCT from "./copy-trading/UserMasterCT";
import ModernHeading from "../lib/ModernHeading";




const TabButton = ({ active, onClick, children, icon: Icon }) => (
  <motion.button
    className={`flex items-center justify-center px-3 p-2 sm:p-3 rounded-full text-sm sm:text-base font-medium transition-all duration-300 ${
      active
        ? "bg-secondary-500-80 text-white shadow-lg"
        : "text-gray-400 hover:text-white hover:bg-secondary-700/20 hover:px-4"
    }`}
    onClick={onClick}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <Icon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
    {children}
  </motion.button>
);

const UserCopyTrading = () => {
  const [activeTab, setActiveTab] = useState("copier");

  const tabs = [
    { id: "copier", label: "Copier", icon: User },
    { id: "master", label: "Master", icon: GraduationCap },
  ];

  return (
    <div className="max-w-full mx-auto ">
      <div className=" mb-6">
        <ModernHeading text={"Copy Trading"}></ModernHeading>
      </div>
      <div className="flex flex-col sm:flex-row justify-start sm:justify-center mb-6 space-y-2 sm:space-y-0 sm:space-x-4">
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            icon={tab.icon}
          >
            {tab.label}
          </TabButton>
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-xl mb-10 "
      >
        {activeTab === "copier" && <UserCopierCT />}
        {activeTab === "master" && <UserMasterCT />}
      </motion.div>
    </div>
  );
};

export default UserCopyTrading;

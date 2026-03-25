import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import UseUserHook from "@/hooks/user/UseUserHook";
import { userApi } from "@/utils/apiClients";

const InputField = ({ label, placeholder, value, onChange, name }) => (
  <div className="mb-6 w-full">
    <label className="block text-sm font-medium text-white mb-2">{label}</label>
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      name={name}
      className="w-full px-4 py-3 border bg-gradient-to-br from-indigo-950  via-blue-950 to-indigo-950 text-gray-100 bg-secondary-900/80 border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 transition-all duration-300"
    />
  </div>
);

const UserWalletDetails = () => {
  const loggedUser = useSelector((store) => store.user.loggedUser);
  const [formData, setFormData] = useState({
    tetherAddress: loggedUser?.walletDetails?.tetherAddress || "",
    ethAddress: loggedUser?.walletDetails?.ethAddress || "",
    accountNumber: loggedUser?.walletDetails?.accountNumber || "",
    trxAddress: loggedUser?.walletDetails?.trxAddress || "",
  });
  const { getUpdateLoggedUser } = UseUserHook();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const submitHandler = async () => {
    const toastId = toast.loading("Plese wait..");
    // console.log(formData);
    try {
      const res = await userApi.put(`/wallet-details`, {
        tetherAddress: formData.tetherAddress,
        accountNumber: formData.accountNumber,
        trxAddress: formData.trxAddress,
        ethAddress: formData.ethAddress,
      });
      // console.log(res);
      getUpdateLoggedUser();
      toast.success("Details updated", { id: toastId });
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!!", { id: toastId });
    }
  };
  useEffect(() => {
    getUpdateLoggedUser();
  }, []);
  return (
    <div className="mx-auto p-4 bg-secondary-800/40 rounded-2xl ">
      <div className=" text-black p-4 rounded-xl ">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <InputField
            label="USDT (Trc20)"
            placeholder="Enter USDT(Trc20) address"
            value={formData.tetherAddress}
            onChange={handleInputChange}
            name="tetherAddress"
          />
          <InputField
            label="USDT (Bep20)"
            placeholder="Enter USDT(Bep20) address"
            value={formData.ethAddress}
            onChange={handleInputChange}
            name="ethAddress"
          />
          <InputField
            label="Binance ID"
            placeholder="Enter Binance ID"
            value={formData.accountNumber}
            onChange={handleInputChange}
            name="accountNumber"
          />
          <InputField
            label="BTC Address"
            placeholder="Enter BTC address"
            value={formData.trxAddress}
            onChange={handleInputChange}
            name="trxAddress"
          />
        </div>
        <div className="flex items-center justify-center mt-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={submitHandler}
            className="px-6 py-3 bg-gradient-to-br from-indigo-950  via-violet-950 to-indigo-950 text-white font-semibold rounded-full hover:bg-secondary-500-80 hover:px-8 transition-all shadow-lg"
          >
            Update Details
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default UserWalletDetails;

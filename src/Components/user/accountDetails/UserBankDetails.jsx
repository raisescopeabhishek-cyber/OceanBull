import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import UseUserHook from "@/hooks/user/UseUserHook";
import toast from "react-hot-toast";
import axios from "axios";
import { userApi } from "@/utils/apiClients";

const InputField = ({ label, placeholder, value, onChange, name }) => (
  <div className="mb-6">
    <label className="block text-sm font-medium text-white mb-2">{label}</label>
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      name={name}
      className="w-full px-4 py-3  bg-gradient-to-br from-indigo-950  via-blue-950 to-indigo-950 border text-gray-100 bg-secondary-900/80 border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 transition-all duration-300"
    />
  </div>
);

const UserBankDetails = () => {
  const loggedUser = useSelector((store) => store.user.loggedUser);
  const { getUpdateLoggedUser } = UseUserHook();

  const [formData, setFormData] = useState({
    bankName: loggedUser?.bankDetails?.bankName || "",
    holderName: loggedUser?.bankDetails?.holderName || "",
    accountNumber: loggedUser?.bankDetails?.accountNumber || "",
    ifscCode: loggedUser?.bankDetails?.ifscCode || "",
    swiftCode: loggedUser?.bankDetails?.swiftCode || "",
    upiId: loggedUser?.bankDetails?.upiId || "",
    comment: loggedUser?.bankDetails?.comment || "",
  });
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const submitHandler = async () => {
    const toastId = toast.loading("Please wait..");
    try {
      const res = await userApi.put(
        `/bank-details`,
        formData
      );
      console.log(res);
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
    <div className=" p-4 bg-secondary-800/40  rounded-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 p-4 gap-6 text-white">
        <InputField
          label="Name of Bank"
          placeholder="Enter bank name"
          value={formData.bankName}
          onChange={handleInputChange}
          name="bankName"
        />
        <InputField
          label="Name of Account Holder"
          placeholder="Enter account holder name"
          value={formData.holderName}
          onChange={handleInputChange}
          name="holderName"
        />
        <InputField
          label="Account Number"
          placeholder="Enter account number"
          value={formData.accountNumber}
          onChange={handleInputChange}
          name="accountNumber"
        />
        <InputField
          label="IFSC Code"
          placeholder="Enter IFSC code"
          value={formData.ifscCode}
          onChange={handleInputChange}
          name="ifscCode"
        />
        <InputField
          label="Swift Code"
          placeholder="Enter Swift code"
          value={formData.swiftCode}
          onChange={handleInputChange}
          name="swiftCode"
        />
        <InputField
          label="UPI ID"
          placeholder="Enter UPI ID"
          value={formData.upiId}
          onChange={handleInputChange}
          name="upiId"
        />
      </div>
      <div className="col-span-full">
        <InputField
          label="Comments"
          placeholder="Enter any comments"
          value={formData.comment}
          onChange={handleInputChange}
          name="comment"
        />
      </div>

      <div className="flex items-center justify-center">
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
  );
};

export default UserBankDetails;

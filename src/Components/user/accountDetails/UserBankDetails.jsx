import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  BadgeIndianRupee,
  Building2,
  CreditCard,
  Hash,
  Landmark,
  Loader2,
  MessageSquareText,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import UseUserHook from "@/hooks/user/UseUserHook";
import { userApi } from "@/utils/apiClients";

const cx = (...classes) => classes.filter(Boolean).join(" ");

const getTheme = (isDark) => ({
  text:"text-text",
  muted:"text-subtle",
  softText:"text-muted",

  card:"border-line bg-surface-2",

  input:"border-line bg-surface-2 text-text placeholder:text-subtle focus:border-line focus:ring-primary",

  icon:"border-line bg-primary-soft text-primary",

  badge:"border-line bg-surface-2 text-subtle",

  successBadge:"border-success bg-success-soft text-success",

  button:"bg-primary text-text hover:bg-primary focus:ring-primary",

  buttonDisabled:"bg-surface-3 text-subtle",
});

const InputField = ({
  theme,
  label,
  placeholder,
  value,
  onChange,
  name,
  icon,
}) => (
  <div>
    <label
      className={cx(
        "mb-2 block text-xs font-semibold uppercase tracking-[0.14em]",
        theme.muted
      )}
    >
      {label}
    </label>

    <div className="relative">
      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-primary">
        {icon}
      </div>

      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        name={name}
        className={cx(
          "w-full rounded-card border py-3 pl-10 pr-4 text-sm outline-none transition-all duration-200 focus:ring-4",
          theme.input
        )}
      />
    </div>
  </div>
);

const UserBankDetails = () => {
  const loggedUser = useSelector((store) => store.user.loggedUser);
  const mode = useSelector((store) => store.userTheme?.mode || "light");
  const isDark = mode === "dark";
  const theme = useMemo(() => getTheme(isDark), [isDark]);

  const { getUpdateLoggedUser } = UseUserHook();

  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    bankName: loggedUser?.bankDetails?.bankName || "",
    holderName: loggedUser?.bankDetails?.holderName || "",
    accountNumber: loggedUser?.bankDetails?.accountNumber || "",
    ifscCode: loggedUser?.bankDetails?.ifscCode || "",
    swiftCode: loggedUser?.bankDetails?.swiftCode || "",
    upiId: loggedUser?.bankDetails?.upiId || "",
    comment: loggedUser?.bankDetails?.comment || "",
  });

  useEffect(() => {
    setFormData({
      bankName: loggedUser?.bankDetails?.bankName || "",
      holderName: loggedUser?.bankDetails?.holderName || "",
      accountNumber: loggedUser?.bankDetails?.accountNumber || "",
      ifscCode: loggedUser?.bankDetails?.ifscCode || "",
      swiftCode: loggedUser?.bankDetails?.swiftCode || "",
      upiId: loggedUser?.bankDetails?.upiId || "",
      comment: loggedUser?.bankDetails?.comment || "",
    });
  }, [loggedUser]);

  useEffect(() => {
    getUpdateLoggedUser();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const submitHandler = async () => {
    const toastId = toast.loading("Please wait...");
    setIsLoading(true);

    try {
      await userApi.put("/bank-details", formData);

      await getUpdateLoggedUser();
      toast.success("Bank details updated", { id: toastId });
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const fields = [
    {
      label: "Name of Bank",
      placeholder: "Enter bank name",
      name: "bankName",
      icon: <Landmark size={16} />,
    },
    {
      label: "Name of Account Holder",
      placeholder: "Enter account holder name",
      name: "holderName",
      icon: <UserRound size={16} />,
    },
    {
      label: "Account Number",
      placeholder: "Enter account number",
      name: "accountNumber",
      icon: <CreditCard size={16} />,
    },
    {
      label: "IFSC Code",
      placeholder: "Enter IFSC code",
      name: "ifscCode",
      icon: <Hash size={16} />,
    },
    {
      label: "Swift Code",
      placeholder: "Enter Swift code",
      name: "swiftCode",
      icon: <Building2 size={16} />,
    },
    {
      label: "UPI ID",
      placeholder: "Enter UPI ID",
      name: "upiId",
      icon: <BadgeIndianRupee size={16} />,
    },
  ];

  return (
    <div className={cx("rounded-card border p-4 sm:p-5", theme.card)}>
      <div className="mb-5 flex items-start gap-3">
        <div
          className={cx(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-card border",
            theme.icon
          )}
        >
          <Landmark className="h-5 w-5" />
        </div>

        <div>
          <h3 className={cx("text-lg font-semibold", theme.text)}>
            Bank Details
          </h3>
          <p className={cx("mt-1 text-sm leading-6", theme.muted)}>
            Add or update your bank account information for withdrawals and account verification.
          </p>
        </div>
      </div>

      <div
        className={cx(
          "mb-5 rounded-card border px-4 py-3",
          theme.successBadge
        )}
      >
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="text-sm leading-6">
            Please make sure your bank details are accurate before submitting.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {fields.map((field) => (
          <InputField
            key={field.name}
            theme={theme}
            label={field.label}
            placeholder={field.placeholder}
            value={formData[field.name]}
            onChange={handleInputChange}
            name={field.name}
            icon={field.icon}
          />
        ))}
      </div>

      <div className="mt-5">
        <InputField
          theme={theme}
          label="Comments"
          placeholder="Enter any comments"
          value={formData.comment}
          onChange={handleInputChange}
          name="comment"
          icon={<MessageSquareText size={16} />}
        />
      </div>

      <div className="mt-7 flex justify-center">
        <motion.button
          type="button"
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
          onClick={submitHandler}
          disabled={isLoading}
          className={cx(
            "inline-flex items-center justify-center gap-2 rounded-card px-7 py-3 text-sm font-bold outline-none transition focus:ring-4 disabled:cursor-not-allowed",
            isLoading ? theme.buttonDisabled : theme.button
          )}
        >
          {isLoading ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <Save size={17} />
          )}
          {isLoading ? "Updating..." : "Update Details"}
        </motion.button>
      </div>
    </div>
  );
};

export default UserBankDetails;
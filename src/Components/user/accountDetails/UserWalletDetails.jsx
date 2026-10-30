import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  Bitcoin,
  CircleDollarSign,
  Hash,
  Loader2,
  Network,
  Save,
  ShieldCheck,
  Wallet,
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

const UserWalletDetails = () => {
  const loggedUser = useSelector((store) => store.user.loggedUser);
  const mode = useSelector((store) => store.userTheme?.mode || "light");
  const isDark = mode === "dark";
  const theme = useMemo(() => getTheme(isDark), [isDark]);

  const { getUpdateLoggedUser } = UseUserHook();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    tetherAddress: loggedUser?.walletDetails?.tetherAddress || "",
    ethAddress: loggedUser?.walletDetails?.ethAddress || "",
    accountNumber: loggedUser?.walletDetails?.accountNumber || "",
    trxAddress: loggedUser?.walletDetails?.trxAddress || "",
  });

  useEffect(() => {
    setFormData({
      tetherAddress: loggedUser?.walletDetails?.tetherAddress || "",
      ethAddress: loggedUser?.walletDetails?.ethAddress || "",
      accountNumber: loggedUser?.walletDetails?.accountNumber || "",
      trxAddress: loggedUser?.walletDetails?.trxAddress || "",
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
      await userApi.put("/wallet-details", {
        tetherAddress: formData.tetherAddress,
        accountNumber: formData.accountNumber,
        trxAddress: formData.trxAddress,
        ethAddress: formData.ethAddress,
      });

      await getUpdateLoggedUser();
      toast.success("Wallet details updated", { id: toastId });
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const fields = [
    {
      label: "USDT (TRC20)",
      placeholder: "Enter USDT TRC20 address",
      value: formData.tetherAddress,
      name: "tetherAddress",
      icon: <CircleDollarSign size={16} />,
    },
    {
      label: "USDT (BEP20)",
      placeholder: "Enter USDT BEP20 address",
      value: formData.ethAddress,
      name: "ethAddress",
      icon: <Network size={16} />,
    },
    {
      label: "Binance ID",
      placeholder: "Enter Binance ID",
      value: formData.accountNumber,
      name: "accountNumber",
      icon: <Hash size={16} />,
    },
    {
      label: "BTC Address",
      placeholder: "Enter BTC address",
      value: formData.trxAddress,
      name: "trxAddress",
      icon: <Bitcoin size={16} />,
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
          <Wallet className="h-5 w-5" />
        </div>

        <div>
          <h3 className={cx("text-lg font-semibold", theme.text)}>
            Wallet Details
          </h3>
          <p className={cx("mt-1 text-sm leading-6", theme.muted)}>
            Add your wallet addresses carefully for faster crypto withdrawals.
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
            Always double-check the wallet network before saving the address.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {fields.map((field) => (
          <InputField
            key={field.name}
            theme={theme}
            label={field.label}
            placeholder={field.placeholder}
            value={field.value}
            onChange={handleInputChange}
            name={field.name}
            icon={field.icon}
          />
        ))}
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

export default UserWalletDetails;
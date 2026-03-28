import React, { useEffect, useState } from "react";
import {
  Trash2,
  Plus,
  Eye,
  Upload,
  XCircle,
  CreditCard,
  Landmark,
  TrendingUp,
  Shield,
  Zap,
  CheckCircle2,
  Wallet,
  DollarSign,
  Activity,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { adminApi } from "../../../utils/apiClients";
import { Switch } from "../ui/Switch";
import ModernHeading from "../../lib/ModernHeading";
import { useSelector } from "react-redux";

export default function MethodConfiguration() {
  const mode = useSelector((state: any) => state.adminTheme?.mode || "light");
  const isDark = mode === "dark";

  const [arrayData, setArrayData] = useState<any[]>([]);
  const [bankData, setBankData] = useState<any[]>([]);
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [popupImageUrl, setPopupImageUrl] = useState("");
  const [activeTab, setActiveTab] = useState<"payment-methods" | "bank-transfer">(
    "payment-methods"
  );
  const [isTopSectionOpen, setIsTopSectionOpen] = useState(false);

  const [newField, setNewField] = useState<{
    name: string;
    details: string;
    image: File | null;
    status: "active" | "inactive";
  }>({
    name: "",
    details: "",
    image: null,
    status: "active",
  });

  const [newBankField, setNewBankField] = useState<any>({
    bankName: "",
    accountNumber: "",
    accountHolderName: "",
    ifscCode: "",
    branchName: "",
    status: "active",
    name: "Bank Transfer",
  });

  const addField = async () => {
    const toastId = toast.loading("Processing...");
    if (!newField.name || !newField.details) {
      toast.error("Name and details are required", { id: toastId });
      return;
    }

    try {
      let res;
      if (newField.image) {
        const formData = new FormData();
        formData.append("name", newField.name);
        formData.append("details", newField.details);
        formData.append("status", newField.status);
        formData.append("image", newField.image);

        res = await adminApi.post(`/add-payment-method`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await adminApi.post(`/add-payment-method`, {
          name: newField.name,
          details: newField.details,
          status: newField.status,
        });
      }

      if (res.data.status) {
        setArrayData((prev) => [...prev, res.data.data]);
        toast.success("Method added successfully", { id: toastId });
        setNewField({ name: "", details: "", image: null, status: "active" });
      } else {
        toast.error(res.data.msg || "Failed to add payment method", {
          id: toastId,
        });
      }
    } catch (error: any) {
      const code = error?.response?.data?.error?.code;
      if (code === "ENOENT") {
        toast.error("File storage unavailable on server. Try without an image.", {
          id: toastId,
        });
      } else {
        toast.error(error?.response?.data?.msg || "Server error occurred", {
          id: toastId,
        });
      }
      console.log("error in add payment method", error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setNewField((nf) => ({ ...nf, image: file }));
  };

  const toggleActive = async (id: string, currentStatus: "active" | "inactive") => {
    const toastId = toast.loading("Updating status...");
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      const res = await adminApi.put(`/update-payment-method`, {
        id,
        status: newStatus,
      });
      if (res.data.status) {
        setArrayData((prev) =>
          prev.map((p) => (p._id === id ? { ...p, status: newStatus } : p))
        );
        toast.success("Status updated", { id: toastId });
      } else {
        toast.error(res.data.msg || "Failed to update status", { id: toastId });
      }
    } catch (error) {
      console.error("Error in payment method toggleActive:", error);
      toast.error("Update failed", { id: toastId });
    }
  };

  const deletePlatform = async (id: string) => {
    const toastId = toast.loading("Removing method...");
    try {
      const res = await adminApi.delete(`/delete-payment-method/?id=${id}`);
      if (res.data.status) {
        setArrayData((prev) => prev.filter((p) => p._id !== id));
        toast.success("Method removed successfully", { id: toastId });
      } else {
        toast.error(res.data.msg || "Removal failed", { id: toastId });
      }
    } catch (error) {
      console.log("error in delete method", error);
      toast.error("Transaction error", { id: toastId });
    }
  };

  const getAllPlatforms = async () => {
    try {
      const res = await adminApi.get(`/get-payment-methods`);
      const filterNotBankData = (res.data.data || []).filter(
        (v: any) => v.name !== "Bank Transfer"
      );
      setArrayData(filterNotBankData);
    } catch (error) {
      console.log("error in getAllPlatform", error);
    }
  };

  const handleViewImage = (imageUrl?: string) => {
    setPopupImageUrl(imageUrl || "");
    setShowImagePopup(true);
  };

  const addBankDetails = async () => {
    const toastId = toast.loading("Adding bank details...");
    if (
      !newBankField.bankName ||
      !newBankField.accountNumber ||
      !newBankField.accountHolderName ||
      !newBankField.ifscCode
    ) {
      toast.error("Please fill all required fields", { id: toastId });
      return;
    }

    try {
      const res = await adminApi.post(`/add-payment-method`, newBankField);
      if (res.data.status) {
        setBankData((prev) => [...prev, res.data.data]);
        toast.success("Bank details added", { id: toastId });
        setNewBankField({
          bankName: "",
          accountNumber: "",
          accountHolderName: "",
          ifscCode: "",
          branchName: "",
          status: "active",
          name: "Bank Transfer",
        });
      } else {
        toast.error(res.data.msg || "Failed to add bank details", {
          id: toastId,
        });
      }
    } catch (error) {
      toast.error("Something went wrong", { id: toastId });
      console.log("error in add bank details", error);
    }
  };

  const toggleBankActive = async (
    id: string,
    currentStatus: "active" | "inactive"
  ) => {
    const toastId = toast.loading("Updating status...");
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      const res = await adminApi.put(`/update-payment-method`, {
        id,
        status: newStatus,
      });
      if (res.data.status) {
        setBankData((prev) =>
          prev.map((b) => (b._id === id ? { ...b, status: newStatus } : b))
        );
        toast.success("Status updated", { id: toastId });
      } else {
        toast.error(res.data.msg || "Failed to update bank status", {
          id: toastId,
        });
      }
    } catch (error) {
      console.error("Error in bank toggleActive:", error);
      toast.error("Something went wrong", { id: toastId });
    }
  };

  const deleteBank = async (id: string) => {
    const toastId = toast.loading("Removing bank details...");
    try {
      const res = await adminApi.delete(`/delete-payment-method/?id=${id}`);
      if (res.data.status) {
        setBankData((prev) => prev.filter((b) => b._id !== id));
        toast.success("Bank details removed", { id: toastId });
      } else {
        toast.error(res.data.msg || "Removal failed", { id: toastId });
      }
    } catch (error) {
      console.log("error in delete bank", error);
      toast.error("Transaction error", { id: toastId });
    }
  };

  const getAllBankDetails = async () => {
    try {
      const res = await adminApi.get(`/get-payment-methods`);
      const filterBankData = (res.data.data || []).filter(
        (v: any) => v.name === "Bank Transfer"
      );
      setBankData(filterBankData);
    } catch (error) {
      console.log("error in getAllBankDetails", error);
    }
  };

  useEffect(() => {
    getAllPlatforms();
    getAllBankDetails();
  }, []);

  const isAddButtonDisabled = !newField.name || !newField.details;
  const isBankAddButtonDisabled =
    !newBankField.bankName ||
    !newBankField.accountNumber ||
    !newBankField.accountHolderName ||
    !newBankField.ifscCode;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <div className="w-full">
      <div className="space-y-4 lg:space-y-5">
        {/* Header / Top Section */}
        <div
          className={[
            "rounded-[24px] border backdrop-blur-xl",
            isDark
              ? "border-white/10 bg-white/[0.03] shadow-[0_18px_45px_rgba(0,0,0,0.28)]"
              : "border-orange-200 bg-white/65 shadow-[0_16px_40px_rgba(251,146,60,0.10)]",
          ].join(" ")}
        >
          <div
            className={[
              "border-b px-4 py-5 sm:px-5",
              isDark ? "border-white/10" : "border-orange-100/80",
            ].join(" ")}
          >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                {/* <ModernHeading text="Payment Configuration" /> */}
                <div className="text-xl">Payment Configuration</div>
                <p
                  className={[
                    "mt-2 text-sm leading-6",
                    isDark ? "text-white/45" : "text-slate-500",
                  ].join(" ")}
                >
                  Manage your payment methods and bank transfers.
                </p>
              </div>

              <button
                onClick={() => setIsTopSectionOpen((prev) => !prev)}
                className={[
                  "inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition",
                  isDark
                    ? "border-white/10 bg-white/[0.04] text-white/85 hover:bg-white/[0.07]"
                    : "border-orange-200 bg-white/80 text-slate-700 hover:bg-orange-50",
                ].join(" ")}
              >
                {isTopSectionOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                {isTopSectionOpen ? "Collapse" : "Expand"}
              </button>
            </div>
          </div>

          <div
            className={[
              "overflow-hidden transition-all duration-300 ease-in-out",
              isTopSectionOpen ? "max-h-[700px] opacity-100" : "max-h-0 opacity-0",
            ].join(" ")}
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3 sm:p-5">
              <div
                className={[
                  "rounded-[24px] border p-4",
                  isDark
                    ? "border-white/10 bg-white/[0.03]"
                    : "border-orange-200 bg-white/70",
                ].join(" ")}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={[
                      "flex h-11 w-11 items-center justify-center rounded-xl",
                      isDark
                        ? "bg-blue-500/10 text-blue-300"
                        : "bg-orange-100 text-orange-600",
                    ].join(" ")}
                  >
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <TrendingUp
                    className={isDark ? "text-sky-300" : "text-sky-600"}
                    size={18}
                  />
                </div>
                <h3
                  className={[
                    "text-sm",
                    isDark ? "text-white/45" : "text-slate-500",
                  ].join(" ")}
                >
                  Payment Methods
                </h3>
                <p
                  className={[
                    "mt-1 text-3xl font-bold",
                    isDark ? "text-white" : "text-slate-900",
                  ].join(" ")}
                >
                  {arrayData.length}
                </p>
                <p
                  className={[
                    "mt-2 flex items-center gap-1 text-xs",
                    isDark ? "text-emerald-300" : "text-emerald-700",
                  ].join(" ")}
                >
                  <Activity className="w-3 h-3" />
                  {arrayData.filter((p) => p.status === "active").length} Active
                </p>
              </div>

              <div
                className={[
                  "rounded-[24px] border p-4",
                  isDark
                    ? "border-white/10 bg-white/[0.03]"
                    : "border-orange-200 bg-white/70",
                ].join(" ")}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={[
                      "flex h-11 w-11 items-center justify-center rounded-xl",
                      isDark
                        ? "bg-emerald-500/10 text-emerald-300"
                        : "bg-emerald-100 text-emerald-700",
                    ].join(" ")}
                  >
                    <Landmark className="w-6 h-6" />
                  </div>
                  <Shield
                    className={isDark ? "text-emerald-300" : "text-emerald-700"}
                    size={18}
                  />
                </div>
                <h3
                  className={[
                    "text-sm",
                    isDark ? "text-white/45" : "text-slate-500",
                  ].join(" ")}
                >
                  Bank Accounts
                </h3>
                <p
                  className={[
                    "mt-1 text-3xl font-bold",
                    isDark ? "text-white" : "text-slate-900",
                  ].join(" ")}
                >
                  {bankData.length}
                </p>
                <p
                  className={[
                    "mt-2 flex items-center gap-1 text-xs",
                    isDark ? "text-emerald-300" : "text-emerald-700",
                  ].join(" ")}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  {bankData.filter((b) => b.status === "active").length} Verified
                </p>
              </div>

              <div
                className={[
                  "rounded-[24px] border p-4",
                  isDark
                    ? "border-white/10 bg-white/[0.03]"
                    : "border-orange-200 bg-white/70",
                ].join(" ")}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={[
                      "flex h-11 w-11 items-center justify-center rounded-xl",
                      isDark
                        ? "bg-violet-500/10 text-violet-300"
                        : "bg-violet-100 text-violet-700",
                    ].join(" ")}
                  >
                    <Wallet className="w-6 h-6" />
                  </div>
                  <Zap
                    className={isDark ? "text-violet-300" : "text-violet-700"}
                    size={18}
                  />
                </div>
                <h3
                  className={[
                    "text-sm",
                    isDark ? "text-white/45" : "text-slate-500",
                  ].join(" ")}
                >
                  Total Active
                </h3>
                <p
                  className={[
                    "mt-1 text-3xl font-bold",
                    isDark ? "text-white" : "text-slate-900",
                  ].join(" ")}
                >
                  {arrayData.filter((p) => p.status === "active").length +
                    bankData.filter((b) => b.status === "active").length}
                </p>
                <p
                  className={[
                    "mt-2 flex items-center gap-1 text-xs",
                    isDark ? "text-sky-300" : "text-sky-700",
                  ].join(" ")}
                >
                  <DollarSign className="w-3 h-3" />
                  Ready to process
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-4 pb-5 sm:px-5">
              <div
                className={[
                  "inline-flex gap-2 rounded-[24px] border p-2",
                  isDark
                    ? "border-white/10 bg-white/[0.03]"
                    : "border-orange-200 bg-white/70",
                ].join(" ")}
              >
                <button
                  onClick={() => setActiveTab("payment-methods")}
                  className={`flex items-center gap-2 rounded-[18px] px-6 py-3 font-semibold transition-all duration-300 ${
                    activeTab === "payment-methods"
                      ? isDark
                        ? "border border-blue-400/30 bg-blue-500 text-white shadow-[0_14px_40px_rgba(59,130,246,0.18)]"
                        : "border border-orange-300 bg-orange-500 text-white"
                      : isDark
                      ? "border border-white/10 bg-transparent text-white/70 hover:bg-white/[0.04] hover:text-white"
                      : "border border-orange-200 bg-transparent text-slate-600 hover:bg-orange-50 hover:text-slate-900"
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  Payment Methods
                  {activeTab === "payment-methods" && (
                    <span
                      className={[
                        "rounded-full px-2 py-0.5 text-xs",
                        isDark
                          ? "bg-white/15 text-white"
                          : "bg-white/20 text-white",
                      ].join(" ")}
                    >
                      {arrayData.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("bank-transfer")}
                  className={`flex items-center gap-2 rounded-[18px] px-6 py-3 font-semibold transition-all duration-300 ${
                    activeTab === "bank-transfer"
                      ? isDark
                        ? "border border-emerald-400/30 bg-emerald-500 text-white shadow-[0_14px_40px_rgba(34,197,94,0.18)]"
                        : "border border-emerald-300 bg-emerald-500 text-white"
                      : isDark
                      ? "border border-white/10 bg-transparent text-white/70 hover:bg-white/[0.04] hover:text-white"
                      : "border border-orange-200 bg-transparent text-slate-600 hover:bg-orange-50 hover:text-slate-900"
                  }`}
                >
                  <Landmark className="w-5 h-5" />
                  Bank Transfers
                  {activeTab === "bank-transfer" && (
                    <span
                      className={[
                        "rounded-full px-2 py-0.5 text-xs",
                        isDark
                          ? "bg-white/15 text-white"
                          : "bg-white/20 text-white",
                      ].join(" ")}
                    >
                      {bankData.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Payment Methods Tab */}
          {activeTab === "payment-methods" && (
            <motion.div
              key="payment-methods"
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -20 }}
              variants={containerVariants}
              className="space-y-6"
            >
              {/* Add Payment Method Form */}
              <motion.div
                variants={itemVariants}
                className={[
                  "rounded-[24px] border p-8",
                  isDark
                    ? "border-white/10 bg-white/[0.03] shadow-[0_18px_45px_rgba(0,0,0,0.28)]"
                    : "border-orange-200 bg-white/80 shadow-[0_16px_40px_rgba(251,146,60,0.10)]",
                ].join(" ")}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={[
                      "flex h-12 w-12 items-center justify-center rounded-xl",
                      isDark
                        ? "bg-blue-500/10 text-blue-300"
                        : "bg-orange-100 text-orange-600",
                    ].join(" ")}
                  >
                    <Zap className="w-6 h-6" />
                  </div>
                  <h2
                    className={[
                      "text-2xl font-bold",
                      isDark ? "text-white" : "text-slate-900",
                    ].join(" ")}
                  >
                    Add Payment Method
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Method Name"
                    value={newField.name}
                    onChange={(e) =>
                      setNewField({ ...newField, name: e.target.value })
                    }
                    className={[
                      "rounded-xl border px-4 py-3 outline-none transition",
                      isDark
                        ? "border-white/10 bg-white/[0.04] text-white placeholder:text-white/30 focus:border-blue-400/40"
                        : "border-orange-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-orange-300",
                    ].join(" ")}
                  />

                  <input
                    type="text"
                    placeholder="Payment Details"
                    value={newField.details}
                    onChange={(e) =>
                      setNewField({ ...newField, details: e.target.value })
                    }
                    className={[
                      "rounded-xl border px-4 py-3 outline-none transition",
                      isDark
                        ? "border-white/10 bg-white/[0.04] text-white placeholder:text-white/30 focus:border-blue-400/40"
                        : "border-orange-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-orange-300",
                    ].join(" ")}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <input
                      type="file"
                      id="image-upload"
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <label
                      htmlFor="image-upload"
                      className={[
                        "flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-3 transition-all",
                        isDark
                          ? "border-white/10 bg-white/[0.04] text-white/75 hover:border-blue-400/30 hover:text-white"
                          : "border-orange-200 bg-white text-slate-600 hover:border-orange-300 hover:text-slate-900",
                      ].join(" ")}
                    >
                      <Upload className="w-5 h-5" />
                      <span>
                        {newField.image
                          ? "Image Selected ✓"
                          : "Upload Image (Optional)"}
                      </span>
                    </label>
                  </div>

                  <button
                    onClick={addField}
                    disabled={isAddButtonDisabled}
                    className={`flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold transition-all duration-300 ${
                      isAddButtonDisabled
                        ? isDark
                          ? "cursor-not-allowed border border-white/10 bg-white/[0.03] text-white/35"
                          : "cursor-not-allowed border border-orange-200 bg-orange-100 text-slate-400"
                        : isDark
                        ? "border border-blue-400/30 bg-blue-500 text-white shadow-[0_14px_40px_rgba(59,130,246,0.18)] hover:bg-blue-600"
                        : "border border-orange-300 bg-orange-500 text-white hover:bg-orange-600"
                    }`}
                  >
                    <Plus className="w-5 h-5" />
                    Add Method
                  </button>
                </div>
              </motion.div>

              {/* Payment Methods Grid */}
              <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
              >
                {arrayData?.map((platform: any, index: number) => {
                  const rawPath = platform?.image as string | undefined;
                  const normalizedPath = rawPath
                    ? rawPath.replace(/\\/g, "/")
                    : undefined;
                  const base = import.meta.env.VITE_API_BASE_URL;
                  const imgUrl =
                    normalizedPath && base ? `${base}/${normalizedPath}` : undefined;

                  return (
                    <motion.div
                      key={platform?._id || index}
                      variants={itemVariants}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      className={[
                        "rounded-[24px] border p-6 transition-all",
                        isDark
                          ? "border-white/10 bg-white/[0.03] shadow-[0_18px_45px_rgba(0,0,0,0.28)]"
                          : "border-orange-200 bg-white/80 shadow-[0_16px_40px_rgba(251,146,60,0.10)]",
                      ].join(" ")}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-xl font-bold text-lg ${
                              isDark
                                ? "bg-blue-500 text-white"
                                : "bg-orange-500 text-white"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div>
                            <h3
                              className={[
                                "text-xl font-bold",
                                isDark ? "text-white" : "text-slate-900",
                              ].join(" ")}
                            >
                              {platform?.name}
                            </h3>

                            <div className="flex items-center gap-2 mt-1">
                              <div
                                className={`h-2 w-2 rounded-full ${
                                  platform?.status === "active"
                                    ? "bg-emerald-500"
                                    : "bg-red-500"
                                }`}
                              />
                              <span
                                className={`text-xs font-semibold ${
                                  platform?.status === "active"
                                    ? isDark
                                      ? "text-emerald-300"
                                      : "text-emerald-700"
                                    : isDark
                                    ? "text-red-300"
                                    : "text-red-700"
                                }`}
                              >
                                {platform?.status === "active"
                                  ? "ACTIVE"
                                  : "INACTIVE"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        className={[
                          "mb-4 rounded-xl p-4",
                          isDark ? "bg-white/[0.04]" : "bg-orange-50/50",
                        ].join(" ")}
                      >
                        <p
                          className={[
                            "text-sm",
                            isDark ? "text-white/80" : "text-slate-700",
                          ].join(" ")}
                        >
                          {platform?.details}
                        </p>
                      </div>

                      <div className="flex justify-between items-center">
                        <Switch
                          checked={platform?.status === "active"}
                          onCheckedChange={() =>
                            toggleActive(platform?._id, platform?.status)
                          }
                        />

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewImage(imgUrl)}
                            className={[
                              "inline-flex items-center gap-2 rounded-lg px-3 py-2 transition-all",
                              isDark
                                ? "border border-blue-400/25 bg-blue-500/10 text-blue-300 hover:bg-blue-500/15"
                                : "border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
                            ].join(" ")}
                            title="View image"
                          >
                            <Eye size={16} />
                            <span className="text-sm">View</span>
                          </button>

                          <button
                            onClick={() => deletePlatform(platform?._id)}
                            className={[
                              "rounded-lg border p-2 transition-all",
                              isDark
                                ? "border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/15"
                                : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
                            ].join(" ")}
                            title="Delete method"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>
          )}

          {/* Bank Transfer Tab */}
          {activeTab === "bank-transfer" && (
            <motion.div
              key="bank-transfer"
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -20 }}
              variants={containerVariants}
              className="space-y-6"
            >
              {/* Add Bank Form */}
              <motion.div
                variants={itemVariants}
                className={[
                  "rounded-[24px] border p-8",
                  isDark
                    ? "border-white/10 bg-white/[0.03] shadow-[0_18px_45px_rgba(0,0,0,0.28)]"
                    : "border-orange-200 bg-white/80 shadow-[0_16px_40px_rgba(251,146,60,0.10)]",
                ].join(" ")}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={[
                      "flex h-12 w-12 items-center justify-center rounded-xl",
                      isDark
                        ? "bg-emerald-500/10 text-emerald-300"
                        : "bg-emerald-100 text-emerald-700",
                    ].join(" ")}
                  >
                    <Landmark className="w-6 h-6" />
                  </div>
                  <h2
                    className={[
                      "text-2xl font-bold",
                      isDark ? "text-white" : "text-slate-900",
                    ].join(" ")}
                  >
                    Add Bank Account
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  {[
                    {
                      placeholder: "Bank Name *",
                      value: newBankField.bankName,
                      onChange: (v: string) =>
                        setNewBankField({ ...newBankField, bankName: v }),
                    },
                    {
                      placeholder: "Account Number *",
                      value: newBankField.accountNumber,
                      onChange: (v: string) =>
                        setNewBankField({ ...newBankField, accountNumber: v }),
                    },
                    {
                      placeholder: "Account Holder Name *",
                      value: newBankField.accountHolderName,
                      onChange: (v: string) =>
                        setNewBankField({
                          ...newBankField,
                          accountHolderName: v,
                        }),
                    },
                    {
                      placeholder: "IFSC Code *",
                      value: newBankField.ifscCode,
                      onChange: (v: string) =>
                        setNewBankField({ ...newBankField, ifscCode: v }),
                    },
                    {
                      placeholder: "Branch Name (Optional)",
                      value: newBankField.branchName,
                      onChange: (v: string) =>
                        setNewBankField({ ...newBankField, branchName: v }),
                    },
                  ].map((f, i) => (
                    <input
                      key={i}
                      type="text"
                      placeholder={f.placeholder}
                      value={f.value}
                      onChange={(e) => f.onChange(e.target.value)}
                      className={[
                        "rounded-xl border px-4 py-3 outline-none transition",
                        isDark
                          ? "border-white/10 bg-white/[0.04] text-white placeholder:text-white/30 focus:border-emerald-400/40"
                          : "border-orange-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-orange-300",
                      ].join(" ")}
                    />
                  ))}

                  <button
                    onClick={addBankDetails}
                    disabled={isBankAddButtonDisabled}
                    className={`flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold transition-all duration-300 ${
                      isBankAddButtonDisabled
                        ? isDark
                          ? "cursor-not-allowed border border-white/10 bg-white/[0.03] text-white/35"
                          : "cursor-not-allowed border border-orange-200 bg-orange-100 text-slate-400"
                        : isDark
                        ? "border border-emerald-400/30 bg-emerald-500 text-white shadow-[0_14px_40px_rgba(34,197,94,0.18)] hover:bg-emerald-600"
                        : "border border-emerald-300 bg-emerald-500 text-white hover:bg-emerald-600"
                    }`}
                  >
                    <Plus className="w-5 h-5" />
                    Add Account
                  </button>
                </div>
              </motion.div>

              {/* Bank Accounts List */}
              <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                {bankData?.map((bank: any) => (
                  <motion.div
                    key={bank?._id}
                    variants={itemVariants}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className={[
                      "rounded-[24px] border p-6 transition-all",
                      isDark
                        ? "border-white/10 bg-white/[0.03] shadow-[0_18px_45px_rgba(0,0,0,0.28)]"
                        : "border-orange-200 bg-white/80 shadow-[0_16px_40px_rgba(251,146,60,0.10)]",
                    ].join(" ")}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                            isDark
                              ? "bg-emerald-500 text-white"
                              : "bg-emerald-500 text-white"
                          }`}
                        >
                          <Landmark className="w-6 h-6" />
                        </div>
                        <div>
                          <h3
                            className={[
                              "text-xl font-bold",
                              isDark ? "text-white" : "text-slate-900",
                            ].join(" ")}
                          >
                            {bank?.bankTransfer?.bankName}
                          </h3>

                          <div className="flex items-center gap-2 mt-1">
                            <div
                              className={`h-2 w-2 rounded-full ${
                                bank?.status === "active"
                                  ? "bg-emerald-500"
                                  : "bg-red-500"
                              }`}
                            />
                            <span
                              className={`text-xs font-semibold ${
                                bank?.status === "active"
                                  ? isDark
                                    ? "text-emerald-300"
                                    : "text-emerald-700"
                                  : isDark
                                  ? "text-red-300"
                                  : "text-red-700"
                              }`}
                            >
                              {bank?.status === "active"
                                ? "VERIFIED"
                                : "INACTIVE"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div
                        className={[
                          "rounded-xl p-3",
                          isDark ? "bg-white/[0.04]" : "bg-orange-50/50",
                        ].join(" ")}
                      >
                        <div
                          className={[
                            "mb-1 text-xs",
                            isDark ? "text-white/45" : "text-slate-500",
                          ].join(" ")}
                        >
                          Account Number
                        </div>
                        <div
                          className={[
                            "font-mono",
                            isDark ? "text-white" : "text-slate-900",
                          ].join(" ")}
                        >
                          {bank?.bankTransfer?.accountNumber}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div
                          className={[
                            "rounded-xl p-3",
                            isDark ? "bg-white/[0.04]" : "bg-orange-50/50",
                          ].join(" ")}
                        >
                          <div
                            className={[
                              "mb-1 text-xs",
                              isDark ? "text-white/45" : "text-slate-500",
                            ].join(" ")}
                          >
                            IFSC Code
                          </div>
                          <div
                            className={[
                              "font-mono text-sm",
                              isDark ? "text-white" : "text-slate-900",
                            ].join(" ")}
                          >
                            {bank?.bankTransfer?.ifscCode}
                          </div>
                        </div>

                        <div
                          className={[
                            "rounded-xl p-3",
                            isDark ? "bg-white/[0.04]" : "bg-orange-50/50",
                          ].join(" ")}
                        >
                          <div
                            className={[
                              "mb-1 text-xs",
                              isDark ? "text-white/45" : "text-slate-500",
                            ].join(" ")}
                          >
                            Account Holder
                          </div>
                          <div
                            className={[
                              "truncate text-sm",
                              isDark ? "text-white" : "text-slate-900",
                            ].join(" ")}
                          >
                            {bank?.bankTransfer?.accountHolderName}
                          </div>
                        </div>
                      </div>

                      {bank?.bankTransfer?.branchName && (
                        <div
                          className={[
                            "rounded-xl p-3",
                            isDark ? "bg-white/[0.04]" : "bg-orange-50/50",
                          ].join(" ")}
                        >
                          <div
                            className={[
                              "mb-1 text-xs",
                              isDark ? "text-white/45" : "text-slate-500",
                            ].join(" ")}
                          >
                            Branch
                          </div>
                          <div
                            className={[
                              "text-sm",
                              isDark ? "text-white" : "text-slate-900",
                            ].join(" ")}
                          >
                            {bank?.bankTransfer?.branchName}
                          </div>
                        </div>
                      )}
                    </div>

                    <div
                      className={[
                        "flex justify-between items-center pt-4 border-t",
                        isDark ? "border-white/10" : "border-orange-100",
                      ].join(" ")}
                    >
                      <Switch
                        checked={bank?.status === "active"}
                        onCheckedChange={() =>
                          toggleBankActive(bank?._id, bank?.status)
                        }
                      />

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewImage(undefined)}
                          className={[
                            "inline-flex items-center gap-2 rounded-lg px-3 py-2 transition-all",
                            isDark
                              ? "border border-blue-400/25 bg-blue-500/10 text-blue-300 hover:bg-blue-500/15"
                              : "border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
                          ].join(" ")}
                          title="View image"
                        >
                          <Eye size={16} />
                          <span className="text-sm">View</span>
                        </button>

                        <button
                          onClick={() => deleteBank(bank?._id)}
                          className={[
                            "rounded-lg border p-2 transition-all",
                            isDark
                              ? "border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/15"
                              : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
                          ].join(" ")}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Image Popup Modal */}
        <AnimatePresence>
          {showImagePopup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
              onClick={() => setShowImagePopup(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={[
                  "relative mx-4 w-full max-w-3xl rounded-[24px] border p-6",
                  isDark
                    ? "border-white/10 bg-[#0b1220] text-white"
                    : "border-orange-200 bg-white text-slate-900",
                ].join(" ")}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowImagePopup(false)}
                  className="absolute -top-4 -right-4 rounded-full bg-red-500 p-2 text-white shadow-lg transition-all hover:scale-105"
                >
                  <XCircle size={24} />
                </button>

                {popupImageUrl ? (
                  <div className="flex justify-center items-center">
                    <img
                      src={popupImageUrl}
                      alt="Payment Method"
                      className="max-h-[80vh] max-w-full rounded-xl border object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-4 py-16">
                    <div
                      className={[
                        "flex h-24 w-24 items-center justify-center rounded-[24px] border",
                        isDark
                          ? "border-white/10 bg-white/[0.04]"
                          : "border-orange-200 bg-orange-50",
                      ].join(" ")}
                    >
                      <ImageIcon
                        className={isDark ? "text-white/50" : "text-slate-400"}
                        size={48}
                      />
                    </div>
                    <p
                      className={[
                        "text-center",
                        isDark ? "text-white/80" : "text-slate-700",
                      ].join(" ")}
                    >
                      No image uploaded for this item.
                    </p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { adminApi } from "../../../utils/apiClients";
import { Switch } from "../ui/Switch";
import ModernHeading from "../../lib/ModernHeading";
import { FloatingParticles } from "../../../utils/FloatingParticles";
import { AnimatedGrid } from "../../../utils/AnimatedGrid";

/* -------------------- theme helpers (RGB strings -> css) ------------------- */
const safeRgbParts = (v: any) => {
  const s = String(v ?? "0 0 0")
    .trim()
    .replace(/,/g, " ");
  const parts = s.split(/\s+/).map((x) => Number(x));
  const [r, g, b] = [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0].map((n) =>
    Number.isFinite(n) ? n : 0
  );
  return { r, g, b };
};

const rgb = (v: any) => {
  const { r, g, b } = safeRgbParts(v);
  return `rgb(${r}, ${g}, ${b})`;
};

const rgba = (v: any, a = 1) => {
  const { r, g, b } = safeRgbParts(v);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

export default function MethodConfiguration() {
  // Theme from Redux
  const themeConfig = useSelector((state: any) => state.user.themeConfig);
  const theme = useMemo(() => themeConfig?.theme || {}, [themeConfig]);
  const radius = theme?.radius || "14px";

  const [arrayData, setArrayData] = useState<any[]>([]);
  const [bankData, setBankData] = useState<any[]>([]);
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

  const [showImagePopup, setShowImagePopup] = useState(false);
  const [popupImageUrl, setPopupImageUrl] = useState("");
  const [activeTab, setActiveTab] = useState<"payment-methods" | "bank-transfer">(
    "payment-methods"
  );

  /* ------------------------------- API Calls ------------------------------ */
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
        toast.error(res.data.msg || "Failed to add payment method", { id: toastId });
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
      const res = await adminApi.put(`/update-payment-method`, { id, status: newStatus });
      if (res.data.status) {
        setArrayData((prev) => prev.map((p) => (p._id === id ? { ...p, status: newStatus } : p)));
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
      const filterNotBankData = (res.data.data || []).filter((v: any) => v.name !== "Bank Transfer");
      setArrayData(filterNotBankData);
    } catch (error) {
      console.log("error in getAllPlatform", error);
    }
  };

  // Always open the modal; if no image url, show a placeholder inside the modal
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
        toast.error(res.data.msg || "Failed to add bank details", { id: toastId });
      }
    } catch (error) {
      toast.error("Something went wrong", { id: toastId });
      console.log("error in add bank details", error);
    }
  };

  const toggleBankActive = async (id: string, currentStatus: "active" | "inactive") => {
    const toastId = toast.loading("Updating status...");
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      const res = await adminApi.put(`/update-payment-method`, { id, status: newStatus });
      if (res.data.status) {
        setBankData((prev) => prev.map((b) => (b._id === id ? { ...b, status: newStatus } : b)));
        toast.success("Status updated", { id: toastId });
      } else {
        toast.error(res.data.msg || "Failed to update bank status", { id: toastId });
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
      const filterBankData = (res.data.data || []).filter((v: any) => v.name === "Bank Transfer");
      setBankData(filterBankData);
    } catch (error) {
      console.log("error in getAllBankDetails", error);
    }
  };

  useEffect(() => {
    getAllPlatforms();
    getAllBankDetails();
  }, []);

  /* ------------------------------- UI helpers ------------------------------ */
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
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
  };

  // theme-driven styles
  const pageBgStyle = {
    minHeight: "100vh",
    background: `radial-gradient(1200px 600px at 18% 0%, ${rgba(
      theme?.glow || theme?.accent,
      0.16
    )}, transparent 60%),
                 radial-gradient(900px 480px at 82% 12%, ${rgba(
                   theme?.gradientTo || theme?.accent,
                   0.12
                 )}, transparent 55%),
                 linear-gradient(135deg, ${rgb(theme?.bg || "0 0 0")}, ${rgb(
      theme?.surface1 || theme?.bg || "0 0 0"
    )}, ${rgb(theme?.bg || "0 0 0")})`,
    color: rgb(theme?.fg || "255 255 255"),
  } as React.CSSProperties;

  const cardShell = {
    borderRadius: "24px",
    border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.14)}`,
    background: `linear-gradient(135deg, ${rgba(theme?.surface2 || theme?.card || "18 18 18", 0.72)}, ${rgba(
      theme?.surface1 || theme?.bg || "0 0 0",
      0.86
    )})`,
    boxShadow: `0 18px 60px ${rgba(theme?.shadowColor || "0 0 0", 0.5)}`,
    backdropFilter: "blur(14px)",
  } as React.CSSProperties;

  const softPanel = {
    borderRadius: `calc(${radius} + 8px)`,
    border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.14)}`,
    background: rgba(theme?.surface2 || theme?.card || "18 18 18", 0.35),
  } as React.CSSProperties;

  const inputStyle = {
    borderRadius: radius,
    background: rgba(theme?.input || theme?.surface2 || "18 18 18", 0.35),
    border: `1px solid ${rgba(theme?.inputBorder || theme?.border || "255 255 255", 0.18)}`,
    color: rgb(theme?.fg || "255 255 255"),
  } as React.CSSProperties;

  const pill = (kind: "info" | "warning" | "success" | "danger") => {
    const map: any = {
      info: theme?.info || theme?.accent || "59 130 246",
      warning: theme?.warning || "234 179 8",
      success: theme?.success || theme?.primary || "34 197 94",
      danger: theme?.danger || "244 63 94",
    };
    const c = map[kind];
    return {
      borderRadius: "999px",
      background: rgba(c, 0.12),
      border: `1px solid ${rgba(c, 0.28)}`,
      color: rgba(c, 0.92),
    } as React.CSSProperties;
  };

  const gradientA = theme?.gradientFrom || theme?.accent || "59 130 246";
  const gradientB = theme?.gradientTo || "147 51 234";

  const tabWrapStyle = {
    borderRadius: "24px",
    border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.14)}`,
    background: rgba(theme?.surface2 || theme?.card || "18 18 18", 0.35),
    backdropFilter: "blur(14px)",
  } as React.CSSProperties;

  const tabBtnBase = {
    borderRadius: "18px",
    border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.14)}`,
    color: rgba(theme?.mutedFg || theme?.fg || "255 255 255", 0.7),
    background: "transparent",
  } as React.CSSProperties;

  const tabBtnActive = {
    color: rgba(theme?.accentFg || "255 255 255", 0.98),
    borderColor: rgba(theme?.ring || theme?.accent || "59 130 246", 0.35),
    background: `linear-gradient(90deg, ${rgba(gradientA, 0.95)}, ${rgba(gradientB, 0.95)})`,
    boxShadow: `0 14px 40px ${rgba(theme?.glow || theme?.accent || "59 130 246", 0.18)}`,
  } as React.CSSProperties;

  const statIconBg = (kind: "info" | "success" | "danger") => {
    const map: any = {
      info: gradientA,
      success: theme?.success || theme?.primary || "34 197 94",
      danger: gradientB,
    };
    const c = map[kind];
    return {
      borderRadius: "18px",
      background: `linear-gradient(90deg, ${rgba(c, 0.95)}, ${rgba(theme?.glow || c, 0.9)})`,
      boxShadow: `0 12px 30px ${rgba(c, 0.22)}`,
    } as React.CSSProperties;
  };

  return (
    <div className="relative p-4 md:p-8" style={pageBgStyle}>
      <AnimatedGrid />
      <FloatingParticles />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-4 relative"
        >
          <ModernHeading text="Payment Configuration" />
        </motion.div>

        <p
          className="text-lg text-center mb-8"
          style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.7) }}
        >
          Manage your payment methods and bank transfers
        </p>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative"
        >
          <div style={cardShell} className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3" style={statIconBg("info")}>
                <CreditCard className="w-6 h-6" style={{ color: rgba(theme?.accentFg || "255 255 255", 1) }} />
              </div>
              <TrendingUp className="w-5 h-5" style={{ color: rgba(theme?.info || theme?.accent, 0.9) }} />
            </div>
            <h3 style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.7) }} className="text-sm mb-1">
              Payment Methods
            </h3>
            <p style={{ color: rgba(theme?.fg || "255 255 255", 0.98) }} className="text-3xl font-bold">
              {arrayData.length}
            </p>
            <p className="text-xs mt-2 flex items-center gap-1" style={{ color: rgba(theme?.success || "34 197 94", 0.92) }}>
              <Activity className="w-3 h-3" />
              {arrayData.filter((p) => p.status === "active").length} Active
            </p>
          </div>

          <div style={cardShell} className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3" style={statIconBg("success")}>
                <Landmark className="w-6 h-6" style={{ color: rgba(theme?.successFg || "0 0 0", 1) }} />
              </div>
              <Shield className="w-5 h-5" style={{ color: rgba(theme?.success || "34 197 94", 0.9) }} />
            </div>
            <h3 style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.7) }} className="text-sm mb-1">
              Bank Accounts
            </h3>
            <p style={{ color: rgba(theme?.fg || "255 255 255", 0.98) }} className="text-3xl font-bold">
              {bankData.length}
            </p>
            <p className="text-xs mt-2 flex items-center gap-1" style={{ color: rgba(theme?.success || "34 197 94", 0.92) }}>
              <CheckCircle2 className="w-3 h-3" />
              {bankData.filter((b) => b.status === "active").length} Verified
            </p>
          </div>

          <div style={cardShell} className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3" style={statIconBg("danger")}>
                <Wallet className="w-6 h-6" style={{ color: rgba(theme?.accentFg || "255 255 255", 1) }} />
              </div>
              <Zap className="w-5 h-5" style={{ color: rgba(theme?.gradientTo || theme?.accent, 0.9) }} />
            </div>
            <h3 style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.7) }} className="text-sm mb-1">
              Total Active
            </h3>
            <p style={{ color: rgba(theme?.fg || "255 255 255", 0.98) }} className="text-3xl font-bold">
              {arrayData.filter((p) => p.status === "active").length +
                bankData.filter((b) => b.status === "active").length}
            </p>
            <p className="text-xs mt-2 flex items-center gap-1" style={{ color: rgba(theme?.info || theme?.accent, 0.92) }}>
              <DollarSign className="w-3 h-3" />
              Ready to process
            </p>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-2 inline-flex gap-2 mb-8 relative"
          style={tabWrapStyle}
        >
          <button
            onClick={() => setActiveTab("payment-methods")}
            className="px-6 py-3 font-semibold transition-all duration-300 flex items-center gap-2"
            style={activeTab === "payment-methods" ? { ...tabBtnBase, ...tabBtnActive } : tabBtnBase}
            onMouseEnter={(e) => {
              if (activeTab !== "payment-methods") {
                (e.currentTarget as HTMLButtonElement).style.background = rgba(theme?.surface3 || theme?.rowHover || "30 30 30", 0.25);
                (e.currentTarget as HTMLButtonElement).style.color = rgba(theme?.fg || "255 255 255", 0.88);
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== "payment-methods") {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                (e.currentTarget as HTMLButtonElement).style.color = rgba(theme?.mutedFg || theme?.fg || "255 255 255", 0.7);
              }
            }}
          >
            <CreditCard className="w-5 h-5" />
            Payment Methods
            {activeTab === "payment-methods" && (
              <span style={pill("info")} className="px-2 py-0.5 text-xs">
                {arrayData.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("bank-transfer")}
            className="px-6 py-3 font-semibold transition-all duration-300 flex items-center gap-2"
            style={activeTab === "bank-transfer" ? { ...tabBtnBase, ...tabBtnActive } : tabBtnBase}
            onMouseEnter={(e) => {
              if (activeTab !== "bank-transfer") {
                (e.currentTarget as HTMLButtonElement).style.background = rgba(theme?.surface3 || theme?.rowHover || "30 30 30", 0.25);
                (e.currentTarget as HTMLButtonElement).style.color = rgba(theme?.fg || "255 255 255", 0.88);
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== "bank-transfer") {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                (e.currentTarget as HTMLButtonElement).style.color = rgba(theme?.mutedFg || theme?.fg || "255 255 255", 0.7);
              }
            }}
          >
            <Landmark className="w-5 h-5" />
            Bank Transfers
            {activeTab === "bank-transfer" && (
              <span style={pill("success")} className="px-2 py-0.5 text-xs">
                {bankData.length}
              </span>
            )}
          </button>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Payment Methods Tab */}
          {activeTab === "payment-methods" && (
            <motion.div
              key="payment-methods"
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -20 }}
              variants={containerVariants}
              className="space-y-6 relative"
            >
              {/* Add Payment Method Form */}
              <motion.div variants={itemVariants} className="p-8 shadow-xl" style={cardShell}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3" style={statIconBg("info")}>
                    <Zap className="w-6 h-6" style={{ color: rgba(theme?.accentFg || "255 255 255", 1) }} />
                  </div>
                  <h2 className="text-2xl font-bold" style={{ color: rgba(theme?.fg || "255 255 255", 0.98) }}>
                    Add Payment Method
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Method Name"
                    value={newField.name}
                    onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                    className="px-4 py-3 focus:outline-none transition-all placeholder:text-[color:var(--ph)]"
                    style={
                      {
                        ...inputStyle,
                        ["--ph" as any]: rgba(theme?.placeholder || theme?.mutedFg || theme?.fg, 0.55),
                      } as React.CSSProperties
                    }
                    onFocus={(e) => {
                      (e.currentTarget as HTMLInputElement).style.boxShadow = `0 0 0 3px ${rgba(theme?.ring || theme?.accent || "59 130 246", 0.25)}`;
                      (e.currentTarget as HTMLInputElement).style.borderColor = rgba(theme?.ring || theme?.accent || "59 130 246", 0.45);
                    }}
                    onBlur={(e) => {
                      (e.currentTarget as HTMLInputElement).style.boxShadow = "none";
                      (e.currentTarget as HTMLInputElement).style.borderColor = rgba(theme?.inputBorder || theme?.border || "255 255 255", 0.18);
                    }}
                  />

                  <input
                    type="text"
                    placeholder="Payment Details"
                    value={newField.details}
                    onChange={(e) => setNewField({ ...newField, details: e.target.value })}
                    className="px-4 py-3 focus:outline-none transition-all placeholder:text-[color:var(--ph)]"
                    style={
                      {
                        ...inputStyle,
                        ["--ph" as any]: rgba(theme?.placeholder || theme?.mutedFg || theme?.fg, 0.55),
                      } as React.CSSProperties
                    }
                    onFocus={(e) => {
                      (e.currentTarget as HTMLInputElement).style.boxShadow = `0 0 0 3px ${rgba(theme?.ring || theme?.accent || "59 130 246", 0.25)}`;
                      (e.currentTarget as HTMLInputElement).style.borderColor = rgba(theme?.ring || theme?.accent || "59 130 246", 0.45);
                    }}
                    onBlur={(e) => {
                      (e.currentTarget as HTMLInputElement).style.boxShadow = "none";
                      (e.currentTarget as HTMLInputElement).style.borderColor = rgba(theme?.inputBorder || theme?.border || "255 255 255", 0.18);
                    }}
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
                      className="flex items-center justify-center gap-2 px-4 py-3 cursor-pointer transition-all"
                      style={softPanel}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLLabelElement).style.borderColor = rgba(theme?.ring || theme?.accent || "59 130 246", 0.35);
                        (e.currentTarget as HTMLLabelElement).style.color = rgba(theme?.fg || "255 255 255", 0.9);
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLLabelElement).style.borderColor = rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.14);
                        (e.currentTarget as HTMLLabelElement).style.color = rgba(theme?.mutedFg || theme?.fg, 0.7);
                      }}
                    >
                      <Upload className="w-5 h-5" />
                      <span style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.75) }}>
                        {newField.image ? "Image Selected ✓" : "Upload Image (Optional)"}
                      </span>
                    </label>
                  </div>

                  <button
                    onClick={addField}
                    disabled={isAddButtonDisabled}
                    className="px-6 py-3 font-semibold flex items-center justify-center gap-2 transition-all duration-300"
                    style={
                      isAddButtonDisabled
                        ? {
                            borderRadius: radius,
                            border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.12)}`,
                            background: rgba(theme?.surface2 || theme?.card || "18 18 18", 0.2),
                            color: rgba(theme?.mutedFg || theme?.fg, 0.45),
                            cursor: "not-allowed",
                          }
                        : {
                            borderRadius: radius,
                            border: `1px solid ${rgba(theme?.ring || theme?.accent || "59 130 246", 0.25)}`,
                            background: `linear-gradient(90deg, ${rgba(gradientA, 0.98)}, ${rgba(gradientB, 0.98)})`,
                            color: rgba(theme?.accentFg || "255 255 255", 0.98),
                            boxShadow: `0 14px 40px ${rgba(theme?.glow || theme?.accent || "59 130 246", 0.18)}`,
                          }
                    }
                    onMouseEnter={(e) => {
                      if (!isAddButtonDisabled) {
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 22px ${rgba(theme?.glow || theme?.accent || "59 130 246", 0.24)}`;
                        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isAddButtonDisabled) {
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 14px 40px ${rgba(theme?.glow || theme?.accent || "59 130 246", 0.18)}`;
                        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0px)";
                      }
                    }}
                  >
                    <Plus className="w-5 h-5" />
                    Add Method
                  </button>
                </div>
              </motion.div>

              {/* Payment Methods Grid */}
              <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {arrayData?.map((platform: any, index: number) => {
                  const rawPath = platform?.image as string | undefined;
                  const normalizedPath = rawPath ? rawPath.replace(/\\/g, "/") : undefined;
                  const base = import.meta.env.VITE_API_BASE_URL;
                  const imgUrl = normalizedPath && base ? `${base}/${normalizedPath}` : undefined;

                  return (
                    <motion.div
                      key={platform?._id || index}
                      variants={itemVariants}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      className="p-6 transition-all"
                      style={cardShell}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 22px 70px ${rgba(theme?.shadowColor || "0 0 0", 0.55)}`;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 18px 60px ${rgba(theme?.shadowColor || "0 0 0", 0.5)}`;
                      }}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg"
                            style={{
                              background: `linear-gradient(135deg, ${rgba(gradientA, 0.95)}, ${rgba(gradientB, 0.95)})`,
                              color: rgba(theme?.accentFg || "255 255 255", 1),
                              boxShadow: `0 12px 30px ${rgba(theme?.glow || theme?.accent || "59 130 246", 0.18)}`,
                            }}
                          >
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold" style={{ color: rgba(theme?.fg || "255 255 255", 0.98) }}>
                              {platform?.name}
                            </h3>

                            <div className="flex items-center gap-2 mt-1">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{
                                  background:
                                    platform?.status === "active"
                                      ? rgba(theme?.success || "34 197 94", 0.95)
                                      : rgba(theme?.danger || "244 63 94", 0.95),
                                  boxShadow:
                                    platform?.status === "active"
                                      ? `0 0 16px ${rgba(theme?.success || "34 197 94", 0.35)}`
                                      : `0 0 16px ${rgba(theme?.danger || "244 63 94", 0.35)}`,
                                }}
                              />
                              <span
                                className="text-xs font-semibold"
                                style={{
                                  color:
                                    platform?.status === "active"
                                      ? rgba(theme?.success || "34 197 94", 0.92)
                                      : rgba(theme?.danger || "244 63 94", 0.92),
                                }}
                              >
                                {platform?.status === "active" ? "ACTIVE" : "INACTIVE"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl p-4 mb-4" style={softPanel}>
                        <p style={{ color: rgba(theme?.fg || "255 255 255", 0.78) }} className="text-sm">
                          {platform?.details}
                        </p>
                      </div>

                      <div className="flex justify-between items-center">
                        <Switch checked={platform?.status === "active"} onCheckedChange={() => toggleActive(platform?._id, platform?.status)} />

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewImage(imgUrl)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
                            style={{
                              borderRadius: radius,
                              border: `1px solid ${rgba(theme?.info || theme?.accent || "59 130 246", 0.28)}`,
                              color: rgba(theme?.info || theme?.accent || "59 130 246", 0.9),
                              background: rgba(theme?.info || theme?.accent || "59 130 246", 0.08),
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.background = rgba(theme?.info || theme?.accent || "59 130 246", 0.12);
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.background = rgba(theme?.info || theme?.accent || "59 130 246", 0.08);
                            }}
                            title="View image"
                          >
                            <Eye size={16} />
                            <span className="text-sm">View</span>
                          </button>

                          <button
                            onClick={() => deletePlatform(platform?._id)}
                            className="p-2 rounded-lg transition-all"
                            style={{
                              background: rgba(theme?.danger || "244 63 94", 0.16),
                              color: rgba(theme?.danger || "244 63 94", 0.92),
                              border: `1px solid ${rgba(theme?.danger || "244 63 94", 0.22)}`,
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.07)";
                              (e.currentTarget as HTMLButtonElement).style.background = rgba(theme?.danger || "244 63 94", 0.22);
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                              (e.currentTarget as HTMLButtonElement).style.background = rgba(theme?.danger || "244 63 94", 0.16);
                            }}
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
              className="space-y-6 relative"
            >
              {/* Add Bank Form */}
              <motion.div variants={itemVariants} className="p-8 shadow-xl" style={cardShell}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3" style={statIconBg("success")}>
                    <Landmark className="w-6 h-6" style={{ color: rgba(theme?.successFg || "0 0 0", 1) }} />
                  </div>
                  <h2 className="text-2xl font-bold" style={{ color: rgba(theme?.fg || "255 255 255", 0.98) }}>
                    Add Bank Account
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  {[
                    {
                      placeholder: "Bank Name *",
                      value: newBankField.bankName,
                      onChange: (v: string) => setNewBankField({ ...newBankField, bankName: v }),
                    },
                    {
                      placeholder: "Account Number *",
                      value: newBankField.accountNumber,
                      onChange: (v: string) => setNewBankField({ ...newBankField, accountNumber: v }),
                    },
                    {
                      placeholder: "Account Holder Name *",
                      value: newBankField.accountHolderName,
                      onChange: (v: string) => setNewBankField({ ...newBankField, accountHolderName: v }),
                    },
                    {
                      placeholder: "IFSC Code *",
                      value: newBankField.ifscCode,
                      onChange: (v: string) => setNewBankField({ ...newBankField, ifscCode: v }),
                    },
                    {
                      placeholder: "Branch Name (Optional)",
                      value: newBankField.branchName,
                      onChange: (v: string) => setNewBankField({ ...newBankField, branchName: v }),
                    },
                  ].map((f, i) => (
                    <input
                      key={i}
                      type="text"
                      placeholder={f.placeholder}
                      value={f.value}
                      onChange={(e) => f.onChange(e.target.value)}
                      className="px-4 py-3 focus:outline-none transition-all placeholder:text-[color:var(--ph)]"
                      style={
                        {
                          ...inputStyle,
                          ["--ph" as any]: rgba(theme?.placeholder || theme?.mutedFg || theme?.fg, 0.55),
                        } as React.CSSProperties
                      }
                      onFocus={(e) => {
                        (e.currentTarget as HTMLInputElement).style.boxShadow = `0 0 0 3px ${rgba(theme?.success || theme?.primary || "34 197 94", 0.22)}`;
                        (e.currentTarget as HTMLInputElement).style.borderColor = rgba(theme?.success || theme?.primary || "34 197 94", 0.4);
                      }}
                      onBlur={(e) => {
                        (e.currentTarget as HTMLInputElement).style.boxShadow = "none";
                        (e.currentTarget as HTMLInputElement).style.borderColor = rgba(theme?.inputBorder || theme?.border || "255 255 255", 0.18);
                      }}
                    />
                  ))}

                  <button
                    onClick={addBankDetails}
                    disabled={isBankAddButtonDisabled}
                    className="px-6 py-3 font-semibold flex items-center justify-center gap-2 transition-all duration-300"
                    style={
                      isBankAddButtonDisabled
                        ? {
                            borderRadius: radius,
                            border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.12)}`,
                            background: rgba(theme?.surface2 || theme?.card || "18 18 18", 0.2),
                            color: rgba(theme?.mutedFg || theme?.fg, 0.45),
                            cursor: "not-allowed",
                          }
                        : {
                            borderRadius: radius,
                            border: `1px solid ${rgba(theme?.success || theme?.primary || "34 197 94", 0.25)}`,
                            background: `linear-gradient(90deg, ${rgba(theme?.success || theme?.primary || "34 197 94", 0.98)}, ${rgba(
                              theme?.success || theme?.primary || "34 197 94",
                              0.82
                            )})`,
                            color: rgba(theme?.successFg || "0 0 0", 0.98),
                            boxShadow: `0 14px 40px ${rgba(theme?.success || theme?.primary || "34 197 94", 0.18)}`,
                          }
                    }
                    onMouseEnter={(e) => {
                      if (!isBankAddButtonDisabled) {
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 22px ${rgba(theme?.success || theme?.primary || "34 197 94", 0.22)}`;
                        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isBankAddButtonDisabled) {
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 14px 40px ${rgba(theme?.success || theme?.primary || "34 197 94", 0.18)}`;
                        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0px)";
                      }
                    }}
                  >
                    <Plus className="w-5 h-5" />
                    Add Account
                  </button>
                </div>
              </motion.div>

              {/* Bank Accounts List */}
              <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {bankData?.map((bank: any) => (
                  <motion.div
                    key={bank?._id}
                    variants={itemVariants}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="p-6 transition-all"
                    style={cardShell}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{
                            background: `linear-gradient(135deg, ${rgba(theme?.success || theme?.primary || "34 197 94", 0.95)}, ${rgba(
                              theme?.success || theme?.primary || "34 197 94",
                              0.78
                            )})`,
                            boxShadow: `0 12px 30px ${rgba(theme?.success || theme?.primary || "34 197 94", 0.18)}`,
                          }}
                        >
                          <Landmark className="w-6 h-6" style={{ color: rgba(theme?.successFg || "0 0 0", 1) }} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold" style={{ color: rgba(theme?.fg || "255 255 255", 0.98) }}>
                            {bank?.bankTransfer?.bankName}
                          </h3>

                          <div className="flex items-center gap-2 mt-1">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{
                                background:
                                  bank?.status === "active"
                                    ? rgba(theme?.success || "34 197 94", 0.95)
                                    : rgba(theme?.danger || "244 63 94", 0.95),
                                boxShadow:
                                  bank?.status === "active"
                                    ? `0 0 16px ${rgba(theme?.success || "34 197 94", 0.35)}`
                                    : `0 0 16px ${rgba(theme?.danger || "244 63 94", 0.35)}`,
                              }}
                            />
                            <span
                              className="text-xs font-semibold"
                              style={{
                                color:
                                  bank?.status === "active"
                                    ? rgba(theme?.success || "34 197 94", 0.92)
                                    : rgba(theme?.danger || "244 63 94", 0.92),
                              }}
                            >
                              {bank?.status === "active" ? "VERIFIED" : "INACTIVE"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="rounded-xl p-3" style={softPanel}>
                        <div className="text-xs mb-1" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.65) }}>
                          Account Number
                        </div>
                        <div className="font-mono" style={{ color: rgba(theme?.fg || "255 255 255", 0.92) }}>
                          {bank?.bankTransfer?.accountNumber}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl p-3" style={softPanel}>
                          <div className="text-xs mb-1" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.65) }}>
                            IFSC Code
                          </div>
                          <div className="font-mono text-sm" style={{ color: rgba(theme?.fg || "255 255 255", 0.92) }}>
                            {bank?.bankTransfer?.ifscCode}
                          </div>
                        </div>

                        <div className="rounded-xl p-3" style={softPanel}>
                          <div className="text-xs mb-1" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.65) }}>
                            Account Holder
                          </div>
                          <div className="text-sm truncate" style={{ color: rgba(theme?.fg || "255 255 255", 0.92) }}>
                            {bank?.bankTransfer?.accountHolderName}
                          </div>
                        </div>
                      </div>

                      {bank?.bankTransfer?.branchName && (
                        <div className="rounded-xl p-3" style={softPanel}>
                          <div className="text-xs mb-1" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.65) }}>
                            Branch
                          </div>
                          <div className="text-sm" style={{ color: rgba(theme?.fg || "255 255 255", 0.92) }}>
                            {bank?.bankTransfer?.branchName}
                          </div>
                        </div>
                      )}
                    </div>

                    <div
                      className="flex justify-between items-center pt-4"
                      style={{ borderTop: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.12)}` }}
                    >
                      <Switch checked={bank?.status === "active"} onCheckedChange={() => toggleBankActive(bank?._id, bank?.status)} />

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewImage(undefined)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
                          style={{
                            borderRadius: radius,
                            border: `1px solid ${rgba(theme?.info || theme?.accent || "59 130 246", 0.28)}`,
                            color: rgba(theme?.info || theme?.accent || "59 130 246", 0.9),
                            background: rgba(theme?.info || theme?.accent || "59 130 246", 0.08),
                          }}
                          title="View image"
                        >
                          <Eye size={16} />
                          <span className="text-sm">View</span>
                        </button>

                        <button
                          onClick={() => deleteBank(bank?._id)}
                          className="p-2 rounded-lg transition-all"
                          style={{
                            background: rgba(theme?.danger || "244 63 94", 0.16),
                            color: rgba(theme?.danger || "244 63 94", 0.92),
                            border: `1px solid ${rgba(theme?.danger || "244 63 94", 0.22)}`,
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.07)";
                            (e.currentTarget as HTMLButtonElement).style.background = rgba(theme?.danger || "244 63 94", 0.22);
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                            (e.currentTarget as HTMLButtonElement).style.background = rgba(theme?.danger || "244 63 94", 0.16);
                          }}
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
              className="fixed inset-0 flex items-center justify-center z-50"
              style={{ background: rgba(theme?.bg || "0 0 0", 0.8), backdropFilter: "blur(6px)" }}
              onClick={() => setShowImagePopup(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative p-6 max-w-3xl w-full mx-4"
                style={cardShell}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowImagePopup(false)}
                  className="absolute -top-4 -right-4 p-2 rounded-full transition-all duration-300 shadow-lg"
                  style={{
                    background: rgba(theme?.danger || "244 63 94", 0.95),
                    color: rgba(theme?.dangerFg || "255 255 255", 1),
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.08) rotate(10deg)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform = "scale(1) rotate(0deg)";
                  }}
                >
                  <XCircle size={24} />
                </button>

                {popupImageUrl ? (
                  <div className="flex justify-center items-center">
                    <img
                      src={popupImageUrl}
                      alt="Payment Method"
                      className="max-w-full max-h-[80vh] object-contain shadow-2xl"
                      style={{
                        borderRadius: `calc(${radius} + 10px)`,
                        border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.14)}`,
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-4 py-16">
                    <div
                      className="w-24 h-24 flex items-center justify-center shadow-inner"
                      style={{
                        borderRadius: `calc(${radius} + 10px)`,
                        background: `linear-gradient(135deg, ${rgba(theme?.surface2 || "18 18 18", 0.65)}, ${rgba(
                          theme?.surface1 || theme?.bg || "0 0 0",
                          0.85
                        )})`,
                        border: `1px solid ${rgba(theme?.border || theme?.inputBorder || "255 255 255", 0.14)}`,
                      }}
                    >
                      <ImageIcon className="w-12 h-12" style={{ color: rgba(theme?.mutedFg || theme?.fg, 0.6) }} />
                    </div>
                    <p style={{ color: rgba(theme?.fg || "255 255 255", 0.78) }} className="text-center">
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

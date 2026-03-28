import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  Check,
  RefreshCw,
  X,
  ShieldCheck,
  Landmark,
  WalletCards,
  FileText,
  Eye,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";
import { adminApi } from "../../../utils/apiClients";

const UserInfoForm = ({ userData }) => {
  const mode = useSelector((store) => store.adminTheme?.mode || "light");
  const isDark = mode === "dark";

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [verificationStatuses, setVerificationStatuses] = useState({
    email: false,
    kyc: false,
  });

  useEffect(() => {
    if (!userData) return;

    setFormData({
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
      email: userData.email || "",
      phone: userData.phone || "",
      address: userData.address || "",
      city: userData.city || "",
      state: userData.state || "",
      zipCode: userData.zipCode || "",
      country: userData.country || "",
    });

    setVerificationStatuses({
      email: !!userData.emailVerified,
      kyc: !!userData.kycVerified,
    });
  }, [userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleStatus = (key) => {
    setVerificationStatuses((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const toastId = toast.loading("Updating user...");
    setSubmitting(true);

    try {
      await adminApi.put(`/update-user`, {
        id: userData?._id,
        ...formData,
        emailVerified: verificationStatuses.email,
        kycVerified: verificationStatuses.kyc,
      });

      toast.success("User updated successfully", { id: toastId });
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = useMemo(() => {
    return [
      "w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all duration-300",
      isDark
        ? "border-white/10 bg-white/[0.04] text-white placeholder:text-white/30 focus:border-blue-400/30 focus:bg-white/[0.06]"
        : "border-orange-100 bg-white/90 text-slate-800 placeholder:text-slate-400 focus:border-orange-300 focus:bg-white",
    ].join(" ");
  }, [isDark]);

  const sectionCardClass = [
    "rounded-[24px] border p-4 sm:p-5",
    isDark
      ? "border-white/10 bg-white/[0.03]"
      : "border-orange-100 bg-orange-50/40",
  ].join(" ");

  const detailRow = (label, value) => (
    <div className="flex flex-col gap-1 rounded-2xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
      style={{
        borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(251,146,60,0.15)",
        background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.75)",
      }}
    >
      <span className={isDark ? "text-sm text-white/55" : "text-sm text-slate-500"}>
        {label}
      </span>
      <span className={isDark ? "text-sm font-medium text-white/88 break-all" : "text-sm font-medium text-slate-900 break-all"}>
        {value || "—"}
      </span>
    </div>
  );

  const renderImageCard = (label, path) => {
    if (!path) return null;

    const imageUrl = `${import.meta.env.VITE_API_BASE_URL}/${path}`;

    return (
      <div
        className={[
          "overflow-hidden rounded-[22px] border",
          isDark
            ? "border-white/10 bg-white/[0.03]"
            : "border-orange-100 bg-white/85",
        ].join(" ")}
      >
        <div
          className={[
            "flex items-center justify-between border-b px-4 py-3",
            isDark
              ? "border-white/10 bg-white/[0.02]"
              : "border-orange-100 bg-orange-50/60",
          ].join(" ")}
        >
          <p className={isDark ? "text-sm font-medium text-white/85" : "text-sm font-medium text-slate-800"}>
            {label}
          </p>

          <a
            href={imageUrl}
            target="_blank"
            rel="noreferrer"
            className={isDark ? "inline-flex items-center gap-1 text-xs text-blue-300 hover:text-blue-200" : "inline-flex items-center gap-1 text-xs text-orange-700 hover:text-orange-600"}
          >
            <Eye className="h-4 w-4" />
            View Full
          </a>
        </div>

        <div className="p-4">
          <img
            src={imageUrl}
            alt={label}
            className="mx-auto max-h-[260px] w-auto rounded-2xl object-contain"
          />
        </div>
      </div>
    );
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="First Name *">
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className={inputClass}
              required
            />
          </Field>

          <Field label="Last Name *">
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className={inputClass}
              required
            />
          </Field>

          <Field label="Email *">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={inputClass}
              required
            />
          </Field>

          <Field label="Mobile Number *">
            <div className="flex gap-2">
              <select className={[inputClass, "max-w-[100px] appearance-none"].join(" ")}>
                <option>+91</option>
              </select>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={inputClass}
                required
              />
            </div>
          </Field>

          <div className="md:col-span-2">
            <Field label="Address">
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="City">
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className={inputClass}
            />
          </Field>

          <Field label="State">
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              className={inputClass}
            />
          </Field>

          <Field label="Zip / Postal">
            <input
              type="text"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleInputChange}
              className={inputClass}
            />
          </Field>

          <Field label="Country">
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className={inputClass}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <VerificationStatus
            label="Email Verification"
            isVerified={verificationStatuses.email}
            onToggle={() => toggleStatus("email")}
            isDark={isDark}
          />
          <VerificationStatus
            label="KYC Verification"
            isVerified={verificationStatuses.kyc}
            onToggle={() => toggleStatus("kyc")}
            isDark={isDark}
          />
        </div>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => setIsDialogOpen(true)}
            className={[
              "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-all duration-300 w-fit",
              isDark
                ? "border-white/10 bg-white/[0.05] text-white/80 hover:bg-white/[0.08]"
                : "border-orange-100 bg-white/80 text-slate-700 hover:bg-orange-50",
            ].join(" ")}
          >
            <FileText className="h-4 w-4" />
            View Account Details
          </button>

          <button
            type="submit"
            disabled={submitting}
            className={[
              "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white transition-all duration-300",
              isDark
                ? "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900/40"
                : "bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300",
            ].join(" ")}
          >
            <RefreshCw className={["h-4 w-4", submitting ? "animate-spin" : ""].join(" ")} />
            {submitting ? "Updating..." : "Update User"}
          </button>
        </div>
      </form>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent
          className={[
            "max-h-[88vh] overflow-y-auto rounded-[28px] border p-0",
            isDark
              ? "border-white/10 bg-[#0b1118] text-white"
              : "border-orange-100 bg-[#fffaf7] text-slate-900",
          ].join(" ")}
        >
          <AlertDialogHeader
            className={[
              "border-b px-6 py-5",
              isDark
                ? "border-white/10 bg-white/[0.03]"
                : "border-orange-100 bg-white/60",
            ].join(" ")}
          >
            <AlertDialogTitle className="text-lg font-semibold">
              Account Details
            </AlertDialogTitle>
            <AlertDialogDescription className={isDark ? "text-white/50" : "text-slate-500"}>
              Review KYC, bank, and wallet information.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-5 p-5 sm:p-6">
            <div className={sectionCardClass}>
              <div className="mb-4 flex items-center gap-2">
                <div
                  className={[
                    "grid h-10 w-10 place-items-center rounded-2xl",
                    isDark ? "bg-blue-500/10 text-blue-300" : "bg-orange-100 text-orange-700",
                  ].join(" ")}
                >
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className={isDark ? "font-semibold text-white/90" : "font-semibold text-slate-900"}>
                    KYC Details
                  </h3>
                  <p className={isDark ? "text-xs text-white/45" : "text-xs text-slate-500"}>
                    Identity and verification records
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {detailRow("Purpose", userData?.kycDetails?.purpose)}
                {detailRow("Occupation", userData?.kycDetails?.occupation)}
                {detailRow("Country of Issue", userData?.kycDetails?.countryOfIssue)}
                {detailRow("Document Type", userData?.kycDetails?.documentType)}
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                {renderImageCard("Front Side of Document", userData?.kycDetails?.frontSideOfDocument)}
                {renderImageCard("Back Side of Document", userData?.kycDetails?.backSideOfDocument)}
                {renderImageCard("Selfie With Document", userData?.kycDetails?.selfieWithDocument)}
              </div>
            </div>

            <div className={sectionCardClass}>
              <div className="mb-4 flex items-center gap-2">
                <div
                  className={[
                    "grid h-10 w-10 place-items-center rounded-2xl",
                    isDark ? "bg-emerald-500/10 text-emerald-300" : "bg-emerald-100 text-emerald-700",
                  ].join(" ")}
                >
                  <Landmark className="h-5 w-5" />
                </div>
                <div>
                  <h3 className={isDark ? "font-semibold text-white/90" : "font-semibold text-slate-900"}>
                    Bank Details
                  </h3>
                  <p className={isDark ? "text-xs text-white/45" : "text-xs text-slate-500"}>
                    Linked banking details for payouts
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {detailRow("Bank Name", userData?.bankDetails?.bankName)}
                {detailRow("Holder Name", userData?.bankDetails?.holderName)}
                {detailRow("Account Number", userData?.bankDetails?.accountNumber)}
                {detailRow("IFSC Code", userData?.bankDetails?.ifscCode)}
                {detailRow("Swift Code", userData?.bankDetails?.swiftCode)}
                {detailRow("UPI ID", userData?.bankDetails?.upiId)}
              </div>
            </div>

            <div className={sectionCardClass}>
              <div className="mb-4 flex items-center gap-2">
                <div
                  className={[
                    "grid h-10 w-10 place-items-center rounded-2xl",
                    isDark ? "bg-violet-500/10 text-violet-300" : "bg-amber-100 text-amber-700",
                  ].join(" ")}
                >
                  <WalletCards className="h-5 w-5" />
                </div>
                <div>
                  <h3 className={isDark ? "font-semibold text-white/90" : "font-semibold text-slate-900"}>
                    Wallet Details
                  </h3>
                  <p className={isDark ? "text-xs text-white/45" : "text-xs text-slate-500"}>
                    Crypto and transfer wallet information
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {detailRow("USDT-TRC20", userData?.walletDetails?.tetherAddress)}
                {detailRow("USDT-BEP20", userData?.walletDetails?.ethAddress)}
                {detailRow("Binance ID", userData?.walletDetails?.accountNumber)}
                {detailRow("BTC Address", userData?.walletDetails?.trxAddress)}
              </div>
            </div>
          </div>

          <AlertDialogFooter
            className={[
              "border-t px-6 py-4",
              isDark
                ? "border-white/10 bg-white/[0.03]"
                : "border-orange-100 bg-white/60",
            ].join(" ")}
          >
            <AlertDialogCancel
              className={[
                "rounded-full px-5",
                isDark
                  ? "border-white/10 bg-white/[0.05] text-white hover:bg-white/[0.08]"
                  : "border-orange-100 bg-white text-slate-700 hover:bg-orange-50",
              ].join(" ")}
              onClick={() => setIsDialogOpen(false)}
            >
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const Field = ({ label, children }) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-inherit opacity-85">
        {label}
      </label>
      {children}
    </div>
  );
};

const VerificationStatus = ({ label, isVerified, onToggle, isDark }) => {
  return (
    <div
      className={[
        "flex items-center justify-between gap-4 rounded-[22px] border p-4 transition-all duration-300",
        isDark
          ? "border-white/10 bg-white/[0.04]"
          : "border-orange-100 bg-white/80",
      ].join(" ")}
    >
      <div className="flex items-center gap-3">
        <div
          className={[
            "grid h-11 w-11 place-items-center rounded-2xl",
            isVerified
              ? isDark
                ? "bg-emerald-500/12 text-emerald-300"
                : "bg-emerald-100 text-emerald-700"
              : isDark
              ? "bg-rose-500/12 text-rose-300"
              : "bg-rose-100 text-rose-700",
          ].join(" ")}
        >
          {isVerified ? <Check size={18} /> : <X size={18} />}
        </div>

        <div>
          <p className={isDark ? "text-sm font-medium text-white/90" : "text-sm font-medium text-slate-900"}>
            {label}
          </p>
          <p className={isDark ? "text-xs text-white/45" : "text-xs text-slate-500"}>
            {isVerified ? "Verified" : "Disabled"}
          </p>
        </div>
      </div>

      <label className="inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={isVerified}
          onChange={onToggle}
        />
        <div
          className={[
            "relative h-7 w-14 rounded-full transition-all duration-300",
            isVerified
              ? "bg-emerald-500"
              : isDark
              ? "bg-white/15"
              : "bg-slate-200",
          ].join(" ")}
        >
          <span
            className={[
              "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-all duration-300",
              isVerified ? "left-[30px]" : "left-0.5",
            ].join(" ")}
          />
        </div>
      </label>
    </div>
  );
};

export default UserInfoForm;
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Pencil, X, KeyRound, RefreshCw, ShieldCheck } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import toast from "react-hot-toast";

import {
  CFcalculateTimeSinceJoined,
  CFformatDate,
} from "../../../utils/CustomFunctions";
import { adminApi } from "../../../utils/apiClients";

const UserTradeAccounts = ({ userData, fetchUserData }) => {
  const mode = useSelector((store) => store.adminTheme?.mode || "light");
  const isDark = mode === "dark";

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [activeTab, setActiveTab] = useState("master");
  const [passwords, setPasswords] = useState({ new: "", confirm: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const accounts = useMemo(() => userData?.accounts || [], [userData]);

  const handleOpenDialog = (account) => {
    setSelectedAccount(account);
    setPasswords({ new: "", confirm: "" });
    setError("");
    setActiveTab("master");
    setOpenDialog(true);
  };

  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?]).{8,}$/;
    return passwordRegex.test(password);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    const toastId = toast.loading("Updating password...");
    setSubmitting(true);
    setError("");

    if (!validatePassword(passwords.new)) {
      const message =
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.";
      setError(message);
      toast.error("Invalid password format", { id: toastId });
      setSubmitting(false);
      return;
    }

    if (passwords.new !== passwords.confirm) {
      const message = "Passwords do not match.";
      setError(message);
      toast.error("Passwords do not match", { id: toastId });
      setSubmitting(false);
      return;
    }

    try {
      const serverEndpoint =
        activeTab === "master"
          ? `/server-master-password-change?Account=${selectedAccount.accountNumber}&password=${passwords.confirm}`
          : `/server-master-password-change?Account=${selectedAccount.accountNumber}&password=${passwords.confirm}`;

      await adminApi.get(serverEndpoint);

      await adminApi.post(
        `/${activeTab === "master" ? "update-master-password" : "update-investor-password"}`,
        {
          userId: userData?._id,
          accountId: selectedAccount?._id,
          newPassword: passwords.confirm,
        }
      );

      await fetchUserData?.();

      toast.success(
        `${activeTab === "master" ? "Master" : "Investor"} password updated`,
        { id: toastId }
      );

      setOpenDialog(false);
      setPasswords({ new: "", confirm: "" });
    } catch (err) {
      console.error("Password update failed:", err);
      setError("An error occurred while updating the password.");
      toast.error("Failed to update password", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const tableHeadClass = isDark
    ? "border-white/10 bg-white/[0.04] text-white/75"
    : "border-orange-100 bg-orange-50 text-slate-700";

  const rowClass = isDark
    ? "border-white/10 text-white/85 hover:bg-white/[0.03]"
    : "border-orange-100 text-slate-800 hover:bg-orange-50/70";

  return (
    <div className="space-y-5">
      {accounts.length ? (
        <>
          <div className="hidden overflow-hidden rounded-[24px] border md:block
            border-white/10 bg-transparent dark:border-white/10"
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] border-collapse">
                <thead>
                  <tr className={tableHeadClass}>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em]">
                      AC No
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.14em]">
                      Type
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.14em]">
                      Leverage
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.14em]">
                      Master Password
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.14em]">
                      Investor Password
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.14em]">
                      Platform
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.14em]">
                      Timestamp
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.14em]">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {accounts.map((account, index) => (
                    <tr key={account?._id || index} className={`border-t transition-all duration-200 ${rowClass}`}>
                      <td className="px-4 py-4 text-sm font-medium">
                        {account?.accountNumber || "—"}
                      </td>
                      <td className="px-4 py-4 text-center text-sm">
                        {account?.accountType || "—"}
                      </td>
                      <td className="px-4 py-4 text-center text-sm">
                        {account?.leverage || "—"}
                      </td>
                      <td className="px-4 py-4 text-center text-sm">
                        {account?.masterPassword || "—"}
                      </td>
                      <td className="px-4 py-4 text-center text-sm">
                        {account?.investorPassword || "—"}
                      </td>
                      <td className="px-4 py-4 text-center text-sm">
                        {account?.platform || "N/A"}
                      </td>
                      <td className="px-4 py-4 text-center text-sm">
                        <div>{CFformatDate(account?.createdAt)}</div>
                        <div className={isDark ? "mt-1 text-xs text-white/40" : "mt-1 text-xs text-slate-500"}>
                          {CFcalculateTimeSinceJoined(account?.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => handleOpenDialog(account)}
                          className={[
                            "inline-flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300",
                            isDark
                              ? "border-blue-400/20 bg-blue-500/10 text-blue-300 hover:bg-blue-500/15"
                              : "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100",
                          ].join(" ")}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:hidden">
            {accounts.map((account, index) => (
              <div
                key={account?._id || index}
                className={[
                  "rounded-[24px] border p-4",
                  isDark
                    ? "border-white/10 bg-white/[0.04]"
                    : "border-orange-100 bg-white/80",
                ].join(" ")}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className={isDark ? "text-xs uppercase tracking-[0.16em] text-white/45" : "text-xs uppercase tracking-[0.16em] text-slate-500"}>
                      Account Number
                    </p>
                    <h4 className={isDark ? "mt-1 text-lg font-semibold text-white/90" : "mt-1 text-lg font-semibold text-slate-900"}>
                      {account?.accountNumber || "—"}
                    </h4>
                  </div>

                  <button
                    onClick={() => handleOpenDialog(account)}
                    className={[
                      "inline-flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300",
                      isDark
                        ? "border-blue-400/20 bg-blue-500/10 text-blue-300"
                        : "border-orange-200 bg-orange-50 text-orange-700",
                    ].join(" ")}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <InfoItem label="Type" value={account?.accountType} isDark={isDark} />
                  <InfoItem label="Leverage" value={account?.leverage} isDark={isDark} />
                  <InfoItem label="Platform" value={account?.platform || "N/A"} isDark={isDark} />
                  <InfoItem label="Created" value={CFformatDate(account?.createdAt)} isDark={isDark} />
                  <InfoItem label="Master Password" value={account?.masterPassword} isDark={isDark} />
                  <InfoItem label="Investor Password" value={account?.investorPassword} isDark={isDark} />
                </div>

                <div className={isDark ? "mt-4 text-xs text-white/40" : "mt-4 text-xs text-slate-500"}>
                  {CFcalculateTimeSinceJoined(account?.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div
          className={[
            "rounded-[24px] border px-5 py-10 text-center",
            isDark
              ? "border-white/10 bg-white/[0.03] text-white/55"
              : "border-orange-100 bg-orange-50/50 text-slate-500",
          ].join(" ")}
        >
          No MT5 accounts found for this user.
        </div>
      )}

      <Dialog.Root open={openDialog} onOpenChange={setOpenDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
          <Dialog.Content
            className={[
              "fixed left-1/2 top-1/2 z-50 w-[calc(100%-24px)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-[28px] border p-0 shadow-2xl",
              isDark
                ? "border-white/10 bg-[#0b1118] text-white"
                : "border-orange-100 bg-[#fffaf7] text-slate-900",
            ].join(" ")}
          >
            <div
              className={[
                "border-b px-6 py-5",
                isDark
                  ? "border-white/10 bg-white/[0.03]"
                  : "border-orange-100 bg-white/60",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={[
                      "grid h-11 w-11 place-items-center rounded-2xl",
                      isDark ? "bg-blue-500/10 text-blue-300" : "bg-orange-100 text-orange-700",
                    ].join(" ")}
                  >
                    <KeyRound className="h-5 w-5" />
                  </div>

                  <div>
                    <Dialog.Title className="text-lg font-semibold">
                      Change Password
                    </Dialog.Title>
                    <p className={isDark ? "mt-1 text-sm text-white/45" : "mt-1 text-sm text-slate-500"}>
                      Account {selectedAccount?.accountNumber || "—"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setOpenDialog(false)}
                  className={isDark ? "text-white/50 transition hover:text-white" : "text-slate-400 transition hover:text-slate-700"}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div
                className={[
                  "mb-5 inline-flex rounded-full border p-1",
                  isDark
                    ? "border-white/10 bg-white/[0.03]"
                    : "border-orange-100 bg-white/80",
                ].join(" ")}
              >
                <button
                  onClick={() => setActiveTab("master")}
                  className={[
                    "rounded-full px-4 py-2 text-sm font-medium transition-all duration-300",
                    activeTab === "master"
                      ? isDark
                        ? "bg-blue-500/15 text-blue-200"
                        : "bg-orange-100 text-orange-700"
                      : isDark
                      ? "text-white/55 hover:text-white/85"
                      : "text-slate-500 hover:text-slate-800",
                  ].join(" ")}
                >
                  Master Password
                </button>
                <button
                  onClick={() => setActiveTab("investor")}
                  className={[
                    "rounded-full px-4 py-2 text-sm font-medium transition-all duration-300",
                    activeTab === "investor"
                      ? isDark
                        ? "bg-blue-500/15 text-blue-200"
                        : "bg-orange-100 text-orange-700"
                      : isDark
                      ? "text-white/55 hover:text-white/85"
                      : "text-slate-500 hover:text-slate-800",
                  ].join(" ")}
                >
                  Investor Password
                </button>
              </div>

              {error ? (
                <div
                  className={[
                    "mb-4 rounded-2xl border px-4 py-3 text-sm",
                    isDark
                      ? "border-rose-400/20 bg-rose-500/10 text-rose-300"
                      : "border-rose-200 bg-rose-50 text-rose-700",
                  ].join(" ")}
                >
                  {error}
                </div>
              ) : null}

              <div className="space-y-4">
                <div>
                  <label className={isDark ? "mb-2 block text-sm text-white/75" : "mb-2 block text-sm text-slate-700"}>
                    New {activeTab === "master" ? "Master" : "Investor"} Password
                  </label>
                  <input
                    type="password"
                    value={passwords.new}
                    onChange={(e) =>
                      setPasswords((prev) => ({ ...prev, new: e.target.value }))
                    }
                    placeholder="Enter new password"
                    className={[
                      "w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all duration-300",
                      isDark
                        ? "border-white/10 bg-white/[0.04] text-white placeholder:text-white/30 focus:border-blue-400/30"
                        : "border-orange-100 bg-white text-slate-800 placeholder:text-slate-400 focus:border-orange-300",
                    ].join(" ")}
                  />
                </div>

                <div>
                  <label className={isDark ? "mb-2 block text-sm text-white/75" : "mb-2 block text-sm text-slate-700"}>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) =>
                      setPasswords((prev) => ({ ...prev, confirm: e.target.value }))
                    }
                    placeholder="Confirm new password"
                    className={[
                      "w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all duration-300",
                      isDark
                        ? "border-white/10 bg-white/[0.04] text-white placeholder:text-white/30 focus:border-blue-400/30"
                        : "border-orange-100 bg-white text-slate-800 placeholder:text-slate-400 focus:border-orange-300",
                    ].join(" ")}
                  />
                </div>

                <div
                  className={[
                    "rounded-[22px] border p-4",
                    isDark
                      ? "border-white/10 bg-white/[0.03]"
                      : "border-orange-100 bg-orange-50/40",
                  ].join(" ")}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={[
                        "mt-0.5 grid h-9 w-9 place-items-center rounded-2xl",
                        isDark ? "bg-emerald-500/10 text-emerald-300" : "bg-emerald-100 text-emerald-700",
                      ].join(" ")}
                    >
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className={isDark ? "text-sm font-medium text-white/85" : "text-sm font-medium text-slate-900"}>
                        Password requirements
                      </p>
                      <p className={isDark ? "mt-1 text-xs leading-6 text-white/45" : "mt-1 text-xs leading-6 text-slate-500"}>
                        Minimum 8 characters, including uppercase, lowercase,
                        number, and special character.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePasswordChange}
                  disabled={submitting}
                  className={[
                    "inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white transition-all duration-300",
                    submitting
                      ? isDark
                        ? "cursor-not-allowed bg-blue-900/40"
                        : "cursor-not-allowed bg-orange-300"
                      : isDark
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-orange-500 hover:bg-orange-600",
                  ].join(" ")}
                >
                  <RefreshCw className={["h-4 w-4", submitting ? "animate-spin" : ""].join(" ")} />
                  {submitting ? "Updating..." : `Change ${activeTab === "master" ? "Master" : "Investor"} Password`}
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

const InfoItem = ({ label, value, isDark }) => {
  return (
    <div
      className={[
        "rounded-2xl border p-3",
        isDark
          ? "border-white/10 bg-white/[0.03]"
          : "border-orange-100 bg-orange-50/50",
      ].join(" ")}
    >
      <p className={isDark ? "text-[11px] uppercase tracking-[0.14em] text-white/45" : "text-[11px] uppercase tracking-[0.14em] text-slate-500"}>
        {label}
      </p>
      <p className={isDark ? "mt-1 text-sm font-medium text-white/88 break-all" : "mt-1 text-sm font-medium text-slate-900 break-all"}>
        {value || "—"}
      </p>
    </div>
  );
};

export default UserTradeAccounts;
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  Copy,
  Crown,
  DollarSign,
  Percent,
  Search,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

import { copyTradingApi } from "../api/copyTradingApi";
import {
  asArray,
  cx,
  getNestedUser,
  getUserAccountsFromUser,
  getUserIdFromUser,
  pickAccountNumber,
  pickMasterAccount,
  pickName,
} from "../utils/copyTradingHelpers";
import CopyTradingEmptyState from "../shared/CopyTradingEmptyState";

const getInputClass = (isDark, extra = "") =>
  cx(
    "w-full rounded-2xl border px-4 py-3 text-sm font-semibold outline-none transition-all duration-200",
    "focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60",
    isDark
      ? "border-amber-300/25 bg-amber-400/[0.08] text-white placeholder:text-white/40 shadow-[0_0_0_1px_rgba(245,158,11,0.08)] focus:border-amber-300 focus:bg-amber-400/[0.12] focus:ring-amber-400/15"
      : "border-amber-300/80 bg-amber-50/80 text-slate-900 placeholder:text-slate-400 shadow-[0_0_0_4px_rgba(245,158,11,0.05),0_10px_22px_rgba(245,158,11,0.07)] focus:border-amber-500 focus:bg-white focus:ring-amber-200/70",
    extra
  );

const getSectionClass = (isDark) =>
  cx(
    "rounded-[24px] border p-5",
    isDark
      ? "border-white/10 bg-white/[0.035]"
      : "border-amber-200/70 bg-white/95 shadow-[0_14px_30px_rgba(245,158,11,0.08)]"
  );

const FieldLabel = ({ children, isDark }) => (
  <label
    className={cx(
      "mb-1.5 block text-xs font-bold uppercase tracking-[0.14em]",
      isDark ? "text-amber-200/80" : "text-amber-700"
    )}
  >
    {children}
  </label>
);

const InfoBox = ({ isDark, icon, label, value }) => (
  <div
    className={cx(
      "rounded-2xl border p-3",
      isDark
        ? "border-white/10 bg-white/[0.025]"
        : "border-amber-100 bg-amber-50/50"
    )}
  >
    <div className={cx("mb-2", isDark ? "text-amber-300" : "text-amber-600")}>
      {icon}
    </div>
    <p className={cx("text-xs", isDark ? "text-white/45" : "text-slate-500")}>
      {label}
    </p>
    <p className={cx("font-bold", isDark ? "text-white" : "text-slate-900")}>
      {value}
    </p>
  </div>
);

const ConfirmRoleChangeModal = ({
  isDark,
  open,
  data,
  loading,
  onClose,
  onAgree,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || typeof document === "undefined") return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !loading) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, loading, onClose]);

  if (!open || !mounted || typeof document === "undefined") return null;

  const conflicts = data?.conflicts || [];
  const targetRole = data?.targetRole || "requested role";
  const conflictLabel =
    conflicts.length > 0 ? conflicts.join(" and ") : "a copy trading account";

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget && !loading) {
      onClose();
    }
  };

  const modal = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="copy-trading-conflict-title"
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/55 p-4"
      onMouseDown={handleBackdropClick}
    >
      <div
        className={cx(
          "max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-[28px] border p-5 shadow-2xl",
          isDark
            ? "border-white/10 bg-slate-950 text-white"
            : "border-red-100 bg-white text-slate-900"
        )}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-600">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div>
              <h3
                id="copy-trading-conflict-title"
                className="text-lg font-bold"
              >
                Account already used
              </h3>
              <p
                className={cx(
                  "mt-1 text-sm leading-6",
                  isDark ? "text-white/65" : "text-slate-600"
                )}
              >
                This MT5 account is already registered as{" "}
                <b>{conflictLabel}</b>.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className={cx(
              "rounded-xl border p-2 disabled:cursor-not-allowed disabled:opacity-60",
              isDark
                ? "border-white/10 hover:bg-white/10"
                : "border-slate-200 hover:bg-slate-50"
            )}
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div
          className={cx(
            "mt-5 rounded-2xl border p-4 text-sm leading-6",
            isDark
              ? "border-red-400/20 bg-red-500/10 text-red-100"
              : "border-red-100 bg-red-50 text-red-700"
          )}
        >
          <p className="font-bold">Please confirm before continuing.</p>

          <p className="mt-2">
            If you continue, the previous master or copier setup for this
            account will be removed first.
          </p>

          <p className="mt-2">
            Existing master commission, linked copiers, copier mapping, copy
            trading settings, commission setup, and related data may be
            permanently removed.
          </p>

          <p className="mt-2 font-semibold">
            After you click I Agree, this account will be removed from its old
            role and then created as the new <b>{targetRole}</b>.
          </p>
        </div>

        <div
          className={cx(
            "mt-4 rounded-2xl border p-4 text-sm",
            isDark
              ? "border-white/10 bg-white/[0.035]"
              : "border-slate-100 bg-slate-50"
          )}
        >
          <p>
            <b>MT5 Account:</b> {data?.mt5Account || "-"}
          </p>
          <p className="mt-1">
            <b>Current Role:</b> {conflictLabel}
          </p>
          <p className="mt-1">
            <b>New Role:</b> {targetRole}
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className={cx(
              "rounded-2xl border px-5 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60",
              isDark
                ? "border-white/10 hover:bg-white/10"
                : "border-slate-200 hover:bg-slate-50"
            )}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onAgree}
            disabled={loading}
            className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Processing..."
              : "I Agree, Remove Old Role & Continue"}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

const UserExploreMasters = () => {
  const mode = useSelector((store) => store.userTheme?.mode || "light");
  const isDark = mode === "dark";

  const copyAccountSelectRef = useRef(null);
  const copyAccountNudgeTimerRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [masters, setMasters] = useState([]);
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [copyAccountNudge, setCopyAccountNudge] = useState(false);

  const [makeMasterForm, setMakeMasterForm] = useState({
    mt5Account: "",
    nickname: "",
    commission: "",
    min_invest: "",
    description: "",
    chat_link: "",
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    data: null,
    action: null,
    payload: null,
  });

  const load = async () => {
    try {
      setLoading(true);

      const [userRes, mastersRes] = await Promise.all([
        copyTradingApi.getMeUser(),
        copyTradingApi.userGetMasters(),
      ]);

      setUser(getNestedUser(userRes));
      setMasters(asArray(mastersRes));
    } catch (error) {
      console.error(error);
      toast.error("Failed to load master traders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    return () => {
      if (copyAccountNudgeTimerRef.current) {
        clearTimeout(copyAccountNudgeTimerRef.current);
      }
    };
  }, []);

  const accounts = getUserAccountsFromUser(user);
  const userId = getUserIdFromUser(user);

  const filteredMasters = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return masters;

    return masters.filter((master) => {
      return JSON.stringify(master || {}).toLowerCase().includes(q);
    });
  }, [masters, search]);

  const buildConflictModalData = ({ data, action, payload, message }) => {
    const targetRole =
      data?.targetRole ||
      (action === "master"
        ? "master"
        : action === "copy"
        ? "copier"
        : "requested role");

    const text = String(message || data?.message || "").toLowerCase();

    const detectedConflicts = [];

    if (text.includes("master")) {
      detectedConflicts.push("master");
    }

    if (text.includes("copier") || text.includes("copy")) {
      detectedConflicts.push("copier");
    }

    const conflicts =
      Array.isArray(data?.conflicts) && data.conflicts.length > 0
        ? data.conflicts
        : detectedConflicts.length > 0
        ? [...new Set(detectedConflicts)]
        : ["copy trading account"];

    return {
      ...data,
      success: false,
      status: false,
      code: "ACCOUNT_ALREADY_IN_COPY_TRADING",
      canForce: true,
      mt5Account: data?.mt5Account || payload?.mt5Account || "-",
      targetRole,
      conflicts,
      message:
        data?.message ||
        "This account is already used in copy trading. If you continue, the previous master or copier setup, commission, mapping, and related settings may be removed.",
    };
  };

  const handleConflictError = ({ error, action, payload }) => {
    const data = error?.data || error?.response?.data || error || {};
    const statusCode =
      error?.status ||
      error?.response?.status ||
      data?.statusCode ||
      data?.upstreamStatus;

    const message = String(
      data?.message ||
        data?.upstreamData?.message ||
        data?.upstreamData?.detail ||
        error?.message ||
        ""
    ).toLowerCase();

    const isConflict =
      statusCode === 409 ||
      data?.code === "ACCOUNT_ALREADY_IN_COPY_TRADING" ||
      message.includes("already a master") ||
      message.includes("already master") ||
      message.includes("already a copier") ||
      message.includes("already copier") ||
      message.includes("already copy") ||
      message.includes("already used");

    if (!isConflict) {
      return false;
    }

    setConfirmModal({
      open: true,
      data: buildConflictModalData({
        data,
        action,
        payload,
        message,
      }),
      action,
      payload,
    });

    return true;
  };

  const closeConfirmModal = () => {
    if (actionLoading) return;

    setConfirmModal({
      open: false,
      data: null,
      action: null,
      payload: null,
    });
  };

  const openCopyAccountDropdown = () => {
    const select = copyAccountSelectRef.current;

    if (!select) return;

    select.scrollIntoView({ behavior: "smooth", block: "center" });

    window.setTimeout(() => {
      select.focus({ preventScroll: true });

      if (typeof select.showPicker === "function") {
        try {
          select.showPicker();
          return;
        } catch (error) {
          // Some browsers block showPicker when it is not allowed.
        }
      }

      select.click();
    }, 180);
  };

  const triggerCopyAccountRequired = () => {
    toast.error("First choose your MT5 account.");
    setCopyAccountNudge(true);
    openCopyAccountDropdown();

    if (copyAccountNudgeTimerRef.current) {
      clearTimeout(copyAccountNudgeTimerRef.current);
    }

    copyAccountNudgeTimerRef.current = setTimeout(() => {
      setCopyAccountNudge(false);
    }, 3500);
  };

  const handleCopyAccountChange = (event) => {
    setSelectedAccount(event.target.value);
    setCopyAccountNudge(false);

    if (copyAccountNudgeTimerRef.current) {
      clearTimeout(copyAccountNudgeTimerRef.current);
    }
  };

  const handleCopy = async (master, force = false, forcedPayload = null) => {
    const masterAccount =
      forcedPayload?.masterAccount || pickMasterAccount(master);

    const minInvest =
      forcedPayload?.min_invest ??
      master?.min_invest ??
      master?.minInvest ??
      master?.minimumInvestment ??
      master?.MinimumInvestment ??
      0;

    const mt5Account = forcedPayload?.mt5Account || selectedAccount;

    if (!userId) {
      toast.error("User not found. Please login again.");
      return;
    }

    if (!mt5Account) {
      triggerCopyAccountRequired();
      return;
    }

    if (!masterAccount) {
      toast.error("Master account not found.");
      return;
    }

    const payload = {
      ...(forcedPayload || {}),
      userId,
      mt5Account,
      masterAccount,
      min_invest: minInvest,
      force,
    };

    try {
      setActionLoading(true);

      const res = await copyTradingApi.userStartCopySmart(payload);

      if (res?.success === false || res?.status === false) {
        const handled = handleConflictError({
          error: res,
          action: "copy",
          payload,
        });

        if (handled) return;

        toast.error(res?.message || res?.msg || "Unable to start copy trading");
        return;
      }

      toast.success("Copy trading started successfully");

      setConfirmModal({
        open: false,
        data: null,
        action: null,
        payload: null,
      });

      load();
    } catch (error) {
      const handled = handleConflictError({
        error,
        action: "copy",
        payload,
      });

      if (!handled) {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to start copying"
        );
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleMakeMaster = async (force = false, forcedPayload = null) => {
    const payload = {
      ...(forcedPayload || {
        userId,
        mt5Account: makeMasterForm.mt5Account,
        nickname: makeMasterForm.nickname,
        commission: makeMasterForm.commission || 0,
        min_invest: makeMasterForm.min_invest || 0,
        description: makeMasterForm.description,
        chat_link: makeMasterForm.chat_link,
      }),
      force,
    };

    if (!userId) {
      toast.error("User not found. Please login again.");
      return;
    }

    if (!payload.mt5Account) {
      toast.error("Select MT5 account to make master.");
      return;
    }

    try {
      setActionLoading(true);

      const res = await copyTradingApi.userMakeMaster(payload);

      if (res?.success === false || res?.status === false) {
        const handled = handleConflictError({
          error: res,
          action: "master",
          payload,
        });

        if (handled) return;

        toast.error(res?.message || "Unable to make master");
        return;
      }

      toast.success("Account converted to master successfully");

      setMakeMasterForm({
        mt5Account: "",
        nickname: "",
        commission: "",
        min_invest: "",
        description: "",
        chat_link: "",
      });

      setConfirmModal({
        open: false,
        data: null,
        action: null,
        payload: null,
      });

      load();
    } catch (error) {
      const handled = handleConflictError({
        error,
        action: "master",
        payload,
      });

      if (!handled) {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to make account master"
        );
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleAgreeConflict = () => {
    if (!confirmModal?.action || !confirmModal?.payload) {
      toast.error("Request details not found. Please try again.");
      return;
    }

    if (confirmModal.action === "copy") {
      handleCopy(null, true, confirmModal.payload);
      return;
    }

    if (confirmModal.action === "master") {
      handleMakeMaster(true, confirmModal.payload);
    }
  };

  return (
    <div className="space-y-5 p-5 sm:p-6">
      <ConfirmRoleChangeModal
        isDark={isDark}
        open={confirmModal.open}
        data={confirmModal.data}
        loading={actionLoading}
        onClose={closeConfirmModal}
        onAgree={handleAgreeConflict}
      />

      <div className={getSectionClass(isDark)}>
        <div className="mb-5 flex items-start gap-3">
          <div
            className={cx(
              "flex h-11 w-11 items-center justify-center rounded-2xl border",
              isDark
                ? "border-amber-400/30 bg-amber-500/10 text-amber-300"
                : "border-amber-200 bg-amber-50 text-amber-700"
            )}
          >
            <Crown className="h-5 w-5" />
          </div>

          <div>
            <h3
              className={cx(
                "text-base font-bold",
                isDark ? "text-white" : "text-slate-900"
              )}
            >
              Become a Master Trader
            </h3>
            <p
              className={cx(
                "mt-1 text-sm",
                isDark ? "text-white/55" : "text-slate-500"
              )}
            >
              Select your MT5 account and make it visible as a master account.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <FieldLabel isDark={isDark}>MT5 Account</FieldLabel>
            <select
              value={makeMasterForm.mt5Account}
              onChange={(event) =>
                setMakeMasterForm((prev) => ({
                  ...prev,
                  mt5Account: event.target.value,
                }))
              }
              className={getInputClass(isDark)}
            >
              <option value="">Select MT5 Account</option>
              {accounts.map((account) => {
                const accountNumber = pickAccountNumber(account);

                if (!accountNumber) return null;

                return (
                  <option key={accountNumber} value={accountNumber}>
                    {accountNumber}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <FieldLabel isDark={isDark}>Master Nickname</FieldLabel>
            <input
              value={makeMasterForm.nickname}
              onChange={(event) =>
                setMakeMasterForm((prev) => ({
                  ...prev,
                  nickname: event.target.value,
                }))
              }
              placeholder="Enter master nickname"
              className={getInputClass(isDark)}
            />
          </div>

          <div>
            <FieldLabel isDark={isDark}>Commission</FieldLabel>
            <input
              value={makeMasterForm.commission}
              onChange={(event) =>
                setMakeMasterForm((prev) => ({
                  ...prev,
                  commission: event.target.value,
                }))
              }
              placeholder="Commission %"
              type="number"
              className={getInputClass(isDark)}
            />
          </div>

          <div>
            <FieldLabel isDark={isDark}>Minimum Investment</FieldLabel>
            <input
              value={makeMasterForm.min_invest}
              onChange={(event) =>
                setMakeMasterForm((prev) => ({
                  ...prev,
                  min_invest: event.target.value,
                }))
              }
              placeholder="Minimum investment"
              type="number"
              className={getInputClass(isDark)}
            />
          </div>

          <div>
            <FieldLabel isDark={isDark}>Chat Link</FieldLabel>
            <input
              value={makeMasterForm.chat_link}
              onChange={(event) =>
                setMakeMasterForm((prev) => ({
                  ...prev,
                  chat_link: event.target.value,
                }))
              }
              placeholder="Chat link optional"
              className={getInputClass(isDark)}
            />
          </div>

          <div className="flex flex-col justify-end">
            <button
              type="button"
              onClick={() => handleMakeMaster(false)}
              disabled={actionLoading}
              className={cx(
                "inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-60",
                isDark
                  ? "bg-amber-500 hover:bg-amber-400"
                  : "bg-gradient-to-r from-orange-500 to-amber-500 shadow-[0_12px_24px_rgba(245,158,11,0.25)] hover:from-orange-600 hover:to-amber-600"
              )}
            >
              <Crown className="h-4 w-4" />
              {actionLoading ? "Processing..." : "Make Master"}
            </button>
          </div>

          <div className="md:col-span-3">
            <FieldLabel isDark={isDark}>Master Description</FieldLabel>
            <textarea
              value={makeMasterForm.description}
              onChange={(event) =>
                setMakeMasterForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              placeholder="Write a short master description"
              className={getInputClass(isDark, "min-h-[100px] resize-y")}
            />
          </div>
        </div>
      </div>

      <div
        className={cx(
          "grid grid-cols-1 gap-4 rounded-[22px] border p-4 md:grid-cols-[1fr_280px]",
          isDark
            ? "border-white/10 bg-white/[0.035]"
            : "border-amber-200/70 bg-white/95 shadow-[0_12px_24px_rgba(245,158,11,0.07)]"
        )}
      >
        <div>
          <FieldLabel isDark={isDark}>Search Masters</FieldLabel>
          <div className="relative">
            <Search
              className={cx(
                "absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2",
                isDark ? "text-amber-300" : "text-amber-600"
              )}
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search master account, nickname, description..."
              className={getInputClass(isDark, "px-11")}
            />
          </div>
        </div>

        <div>
          <FieldLabel isDark={isDark}>Copy From Account</FieldLabel>
          <div className="relative">
            <select
              ref={copyAccountSelectRef}
              value={selectedAccount}
              onChange={handleCopyAccountChange}
              className={getInputClass(
                isDark,
                copyAccountNudge
                  ? "animate-pulse border-red-400 ring-4 ring-red-400/30 shadow-[0_0_0_4px_rgba(239,68,68,0.18),0_0_26px_rgba(239,68,68,0.28)]"
                  : ""
              )}
            >
              <option value="">Select MT5 Account</option>
              {accounts.map((account) => {
                const accountNumber = pickAccountNumber(account);

                if (!accountNumber) return null;

                return (
                  <option key={accountNumber} value={accountNumber}>
                    {accountNumber}
                  </option>
                );
              })}
            </select>

            {copyAccountNudge && (
              <div
                className={cx(
                  "absolute right-0 top-full z-20 mt-2 rounded-2xl border px-3 py-2 text-xs font-bold shadow-xl",
                  isDark
                    ? "border-red-400/30 bg-red-500 text-white"
                    : "border-red-200 bg-red-50 text-red-700"
                )}
              >
                First choose your account.
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-5 text-sm">Loading masters...</div>
      ) : filteredMasters.length === 0 ? (
        <CopyTradingEmptyState
          isDark={isDark}
          title="No master traders found"
          subtitle="Try another search or contact admin."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {filteredMasters.map((master, index) => {
            const masterAccount =
              pickMasterAccount(master) || `MASTER-${index + 1}`;
            const name = pickName(master);
            const minInvest =
              master?.min_invest ||
              master?.minInvest ||
              master?.minimumInvestment ||
              0;

            return (
              <div
                key={`${masterAccount}-${index}`}
                className={cx(
                  "rounded-[24px] border p-5",
                  isDark
                    ? "border-white/10 bg-white/[0.035]"
                    : "border-amber-100 bg-white/95 shadow-[0_10px_24px_rgba(245,158,11,0.07)]"
                )}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p
                      className={cx(
                        "text-xs font-semibold uppercase tracking-[0.14em]",
                        isDark ? "text-white/45" : "text-slate-500"
                      )}
                    >
                      Master Account
                    </p>
                    <h3
                      className={cx(
                        "mt-1 text-xl font-bold",
                        isDark ? "text-white" : "text-slate-900"
                      )}
                    >
                      {name === "-" ? `#${masterAccount}` : name}
                    </h3>
                    <p
                      className={cx(
                        "mt-1 text-sm",
                        isDark ? "text-white/55" : "text-slate-500"
                      )}
                    >
                      #{masterAccount}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(master)}
                    disabled={actionLoading}
                    className={cx(
                      "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-60",
                      isDark
                        ? "bg-amber-500 hover:bg-amber-400"
                        : "bg-gradient-to-r from-orange-500 to-amber-500 shadow-[0_12px_24px_rgba(245,158,11,0.22)] hover:from-orange-600 hover:to-amber-600"
                    )}
                  >
                    <Copy className="h-4 w-4" />
                    Copy Master
                  </button>
                </div>

                <p
                  className={cx(
                    "mt-4 text-sm leading-6",
                    isDark ? "text-white/60" : "text-slate-600"
                  )}
                >
                  {master?.description ||
                    master?.Description ||
                    "No description added for this master trader."}
                </p>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-4">
                  <InfoBox
                    isDark={isDark}
                    icon={<Percent className="h-4 w-4" />}
                    label="Commission"
                    value={`${master?.commission || master?.Commission || 0}%`}
                  />

                  <InfoBox
                    isDark={isDark}
                    icon={<DollarSign className="h-4 w-4" />}
                    label="Min Invest"
                    value={`$${minInvest || 0}`}
                  />

                  <InfoBox
                    isDark={isDark}
                    icon={<Users className="h-4 w-4" />}
                    label="Copiers"
                    value={master?.copiers || master?.Copiers || 0}
                  />

                  <InfoBox
                    isDark={isDark}
                    icon={<ShieldCheck className="h-4 w-4" />}
                    label="Status"
                    value="Active"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserExploreMasters;

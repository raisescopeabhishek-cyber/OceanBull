import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
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

const PAGE_SIZE_OPTIONS = [6, 10, 20, 50];

const getInputClass = (isDark, extra = "") =>
  cx(
    "w-full rounded-card border px-4 py-3 text-sm font-semibold outline-none transition-all duration-200",
    "focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60","border-success bg-success-soft text-text placeholder:text-subtle focus:border-success focus:bg-success-soft focus:ring-success",
    extra
  );

const getSectionClass = (isDark) =>
  cx(
    "rounded-card border p-5","border-line bg-surface-2"
  );

const FieldLabel = ({ children, isDark }) => (
  <label
    className={cx(
      "mb-1.5 block text-xs font-bold uppercase tracking-[0.14em]","text-success"
    )}
  >
    {children}
  </label>
);

const InfoBox = ({ isDark, icon, label, value }) => (
  <div
    className={cx(
      "rounded-card border p-3","border-line bg-surface-2"
    )}
  >
    <div
      className={cx("mb-2","text-success")}
    >
      {icon}
    </div>

    <p className={cx("text-xs","text-subtle")}>
      {label}
    </p>

    <p className={cx("font-bold","text-text")}>
      {value}
    </p>
  </div>
);

const getMasterCreatedTimestamp = (master) => {
  const candidates = [
    master?.created_at,
    master?.createdAt,
    master?.CreatedAt,
    master?.createdDate,
    master?.date,
    master?.updated_at,
    master?.updatedAt,
    master?.UpdatedAt,
  ];

  for (const value of candidates) {
    if (!value) continue;

    const timestamp = new Date(value).getTime();

    if (!Number.isNaN(timestamp)) {
      return timestamp;
    }
  }

  return 0;
};

const formatMasterCreatedDate = (master) => {
  const timestamp = getMasterCreatedTimestamp(master);

  if (!timestamp) return "-";

  return new Date(timestamp).toLocaleString();
};

const PaginationButton = ({ isDark, disabled, onClick, children, label }) => {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cx(
        "inline-flex h-10 min-w-10 items-center justify-center rounded-card border px-3 text-sm font-black transition-all disabled:cursor-not-allowed disabled:opacity-40","border-line bg-surface-2 text-text hover:bg-surface-2"
      )}
    >
      {children}
    </button>
  );
};

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
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 p-4"
      onMouseDown={handleBackdropClick}
    >
      <div
        className={cx(
          "max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-card border p-5","border-line bg-surface text-text"
        )}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-card border border-danger bg-danger-soft text-danger">
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
                  "mt-1 text-sm leading-6","text-muted"
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
              "rounded-card border p-2 disabled:cursor-not-allowed disabled:opacity-60","border-line hover:bg-surface-2"
            )}
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div
          className={cx(
            "mt-5 rounded-card border p-4 text-sm leading-6","border-danger bg-danger-soft text-danger"
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
            "mt-4 rounded-card border p-4 text-sm","border-line bg-surface-2"
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
              "rounded-card border px-5 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60","border-line hover:bg-surface-2"
            )}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onAgree}
            disabled={loading}
            className="rounded-card bg-danger px-5 py-3 text-sm font-bold text-text hover:bg-danger disabled:cursor-not-allowed disabled:opacity-60"
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

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

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
      setPage(1);
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

  useEffect(() => {
    setPage(1);
  }, [search, pageSize]);

  const accounts = getUserAccountsFromUser(user);
  const userId = getUserIdFromUser(user);

  const filteredMasters = useMemo(() => {
    const q = search.toLowerCase().trim();

    const rows = masters
      .map((master, index) => ({
        master,
        index,
      }))
      .filter(({ master }) => {
        if (!q) return true;

        return JSON.stringify(master || {}).toLowerCase().includes(q);
      })
      .sort((a, b) => {
        const bTime = getMasterCreatedTimestamp(b.master);
        const aTime = getMasterCreatedTimestamp(a.master);

        if (bTime !== aTime) {
          return bTime - aTime;
        }

        return a.index - b.index;
      })
      .map(({ master }) => master);

    return rows;
  }, [masters, search]);

  const totalPages = Math.max(1, Math.ceil(filteredMasters.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = filteredMasters.length ? (safePage - 1) * pageSize : 0;
  const endIndex = Math.min(startIndex + pageSize, filteredMasters.length);

  const paginatedMasters = useMemo(() => {
    return filteredMasters.slice(startIndex, endIndex);
  }, [filteredMasters, startIndex, endIndex]);

  useEffect(() => {
    if (page !== safePage) {
      setPage(safePage);
    }
  }, [page, safePage]);

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
              "flex h-11 w-11 items-center justify-center rounded-card border","border-success bg-success-soft text-success"
            )}
          >
            <Crown className="h-5 w-5" />
          </div>

          <div>
            <h3
              className={cx(
                "text-base font-bold","text-text"
              )}
            >
              Become a Master Trader
            </h3>

            <p
              className={cx(
                "mt-1 text-sm","text-subtle"
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
                "inline-flex min-h-[48px] items-center justify-center gap-2 rounded-card px-4 py-3 text-sm font-bold text-text transition-all disabled:cursor-not-allowed disabled:opacity-60","bg-success hover:bg-success"
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
          "grid grid-cols-1 gap-4 rounded-card border p-4 md:grid-cols-[1fr_280px]","border-line bg-surface-2"
        )}
      >
        <div>
          <FieldLabel isDark={isDark}>Search Masters</FieldLabel>
          <div className="relative">
            <Search
              className={cx(
                "absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2","text-success"
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
                  ? "animate-pulse border-danger ring-4 ring-danger shadow-[0_0_0_4px_rgba(239,68,68,0.18),0_0_26px_rgba(239,68,68,0.28)]"
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
                  "absolute right-0 top-full z-20 mt-2 rounded-card border px-3 py-2 text-xs font-bold","border-danger bg-danger text-text"
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
        <div className="space-y-4">
          <div
            className={cx(
              "flex flex-col gap-3 rounded-card border p-4 sm:flex-row sm:items-center sm:justify-between","border-line bg-surface-2"
            )}
          >
            <div>
              <p
                className={cx(
                  "text-sm font-bold","text-text"
                )}
              >
                Showing {startIndex + 1}-{endIndex} of {filteredMasters.length} masters
              </p>

              <p
                className={cx(
                  "mt-1 text-xs","text-subtle"
                )}
              >
                Newest master accounts are shown first.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={pageSize}
                onChange={(event) => setPageSize(Number(event.target.value))}
                className={cx(
                  "rounded-card border px-3 py-2 text-sm font-bold outline-none","border-line bg-surface text-text"
                )}
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size} / page
                  </option>
                ))}
              </select>

              <PaginationButton
                isDark={isDark}
                label="First page"
                disabled={safePage === 1}
                onClick={() => setPage(1)}
              >
                <ChevronsLeft className="h-4 w-4" />
              </PaginationButton>

              <PaginationButton
                isDark={isDark}
                label="Previous page"
                disabled={safePage === 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </PaginationButton>

              <div
                className={cx(
                  "rounded-card border px-4 py-2 text-sm font-black","border-line bg-surface-2 text-text"
                )}
              >
                Page {safePage} / {totalPages}
              </div>

              <PaginationButton
                isDark={isDark}
                label="Next page"
                disabled={safePage === totalPages}
                onClick={() =>
                  setPage((prev) => Math.min(totalPages, prev + 1))
                }
              >
                <ChevronRight className="h-4 w-4" />
              </PaginationButton>

              <PaginationButton
                isDark={isDark}
                label="Last page"
                disabled={safePage === totalPages}
                onClick={() => setPage(totalPages)}
              >
                <ChevronsRight className="h-4 w-4" />
              </PaginationButton>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {paginatedMasters.map((master, index) => {
              const masterAccount =
                pickMasterAccount(master) || `MASTER-${startIndex + index + 1}`;
              const name = pickName(master);
              const minInvest =
                master?.min_invest ||
                master?.minInvest ||
                master?.minimumInvestment ||
                0;

              return (
                <div
                  key={`${masterAccount}-${startIndex + index}`}
                  className={cx(
                    "rounded-card border p-5","border-line bg-surface-2"
                  )}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p
                        className={cx(
                          "text-xs font-semibold uppercase tracking-[0.14em]","text-subtle"
                        )}
                      >
                        Master Account
                      </p>

                      <h3
                        className={cx(
                          "mt-1 text-xl font-bold","text-text"
                        )}
                      >
                        {name === "-" ? `#${masterAccount}` : name}
                      </h3>

                      <p
                        className={cx(
                          "mt-1 text-sm","text-subtle"
                        )}
                      >
                        #{masterAccount}
                      </p>

                      <p
                        className={cx(
                          "mt-1 text-xs","text-success"
                        )}
                      >
                        Created: {formatMasterCreatedDate(master)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(master)}
                      disabled={actionLoading}
                      className={cx(
                        "inline-flex items-center justify-center gap-2 rounded-card px-4 py-2.5 text-sm font-bold text-text transition-all disabled:cursor-not-allowed disabled:opacity-60","bg-success hover:bg-success"
                      )}
                    >
                      <Copy className="h-4 w-4" />
                      Copy Master
                    </button>
                  </div>

                  <p
                    className={cx(
                      "mt-4 text-sm leading-6","text-subtle"
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

          {totalPages > 1 && (
            <div
              className={cx(
                "flex flex-wrap items-center justify-center gap-2 rounded-card border p-4","border-line bg-surface-2"
              )}
            >
              <PaginationButton
                isDark={isDark}
                label="First page"
                disabled={safePage === 1}
                onClick={() => setPage(1)}
              >
                <ChevronsLeft className="h-4 w-4" />
              </PaginationButton>

              <PaginationButton
                isDark={isDark}
                label="Previous page"
                disabled={safePage === 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </PaginationButton>

              <div
                className={cx(
                  "rounded-card border px-4 py-2 text-sm font-black","border-line bg-surface-2 text-text"
                )}
              >
                Page {safePage} / {totalPages}
              </div>

              <PaginationButton
                isDark={isDark}
                label="Next page"
                disabled={safePage === totalPages}
                onClick={() =>
                  setPage((prev) => Math.min(totalPages, prev + 1))
                }
              >
                <ChevronRight className="h-4 w-4" />
              </PaginationButton>

              <PaginationButton
                isDark={isDark}
                label="Last page"
                disabled={safePage === totalPages}
                onClick={() => setPage(totalPages)}
              >
                <ChevronsRight className="h-4 w-4" />
              </PaginationButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserExploreMasters;
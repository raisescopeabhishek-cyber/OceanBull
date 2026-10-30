import { useEffect, useState } from "react";
import {
  ArrowLeftRight,
  CircleCheckBig,
  CircleX,
  WalletCardsIcon,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";
import toast from "react-hot-toast";
import { adminApi } from "../../../utils/apiClients";
import { CFformatDate } from "../../../utils/CustomFunctions";
import { BlotterPage, Button, EmptyState } from "@/Components/ui";

const PAGE_LIMIT = 10;

const displayMethod = (method?: string) => {
  switch ((method || "").toLowerCase()) {
    case "usdttrc20":
    case "usdt(trc20)":
    case "usdt_trc20":
    case "usdt-trc20":
      return "USDT (TRC20)";
    case "usdtbep20":
    case "usdt(bep20)":
    case "usdt_bep20":
    case "usdt-bep20":
      return "USDT (BEP20)";
    case "binanceid":
    case "binance id":
      return "Binance ID";
    case "btcaddress":
    case "btc address":
      return "BTC Address";
    case "bank transfer":
    case "bank":
      return "Bank Transfer";
    default:
      return method || "—";
  }
};

const safeNum = (value: any) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const IbWithdrawalStatus = () => {
  const [withdrawalData, setWithdrawalData] = useState<any[]>([]);
  const [allWithdrawalData, setAllWithdrawalData] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [, setAllLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: "",
    status: "all",
  });

  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"" | "approve" | "reject">("");
  const [isActionLoading, setIsActionLoading] = useState(false);

  const totalPages = Math.max(
    1,
    Number(pagination?.totalPages) ||
      Math.ceil((Number(pagination?.totalWithdrawals || pagination?.total || 0)) / PAGE_LIMIT)
  );

  const updateFilter = (key: string, value: string) => {
    setCurrentPage(1);
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    setCurrentPage(1);
    setFilters({
      search: "",
      status: "all",
    });
    setDebouncedSearch("");
  };

  const fetchWithdrawalData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: PAGE_LIMIT.toString(),
        search: debouncedSearch,
      });

      if (filters.status === "approved") {
        params.append("status", "approved");
      } else if (filters.status === "pending") {
        params.append("status", "pending");
      } else if (filters.status === "rejected") {
        params.append("status", "rejected");
      } else {
        params.append("status", "");
      }

      const res = await adminApi.get(`/referral-withdrawals?${params.toString()}`);
      const finalRes = res?.data;

      setWithdrawalData(finalRes?.data || []);
      setPagination(finalRes?.pagination || {});
    } catch (error) {
      console.log("Error fetching IB withdrawals:", error);
      toast.error("Something went wrong while fetching IB withdrawals");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    setAllLoading(true);
    try {
      const res = await adminApi.get(`/referral-withdrawals`);
      setAllWithdrawalData(res?.data?.data || []);
    } catch (error) {
      console.log("Error fetching all IB withdrawals:", error);
    } finally {
      setAllLoading(false);
    }
  };

  const handleActionClick = (
    withdrawal: any,
    action: "approve" | "reject"
  ) => {
    setSelectedWithdrawal(withdrawal);
    setActionType(action);
    setIsDialogOpen(true);
  };

  const handleConfirmAction = async (withdrawal: any) => {
    if (isActionLoading || !withdrawal) return;

    const toastId = toast.loading("Please wait...");
    setIsActionLoading(true);

    try {
      if (actionType === "approve") {
        await adminApi.post(`/withdraw-ib-balance`, {
          referralAccount: withdrawal.referralId,
          amount: withdrawal.amount,
        });

        const now = new Date();
        const formattedDateTime =
          now.toLocaleDateString("en-GB") +
          ", " +
          now.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          });

        const startBalance = safeNum(
          withdrawal?.userData?.ibBalance ?? withdrawal?.totalBalance ?? 0
        );
        const amount = safeNum(withdrawal?.amount ?? 0);
        const remaining = Math.max(0, startBalance - amount);

        const customContent = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>IB Withdrawal Success</title>
<style>
body,html{margin:0;padding:0;font-family:Arial,sans-serif;line-height:1.6;color:#333;background:#f3f5f9}
.container{max-width:600px;margin:0 auto;background:#fff}
.header{background:#19422df2;color:#fff;padding:20px 15px;text-align:center;border-radius:10px 10px 0 0}
.header h1{margin:0;font-size:22px;letter-spacing:1px}
.content{padding:10px 20px}
.withdrawal-details{background:#f8f8f8;border-left:4px solid #0f9f6e;padding:15px;margin:20px 0}
.highlight{font-weight:700;color:#0a2342}
.footer{background:#19422df2;color:#fff;text-align:center;padding:5px 10px;font-size:12px;border-radius:0 0 10px 10px}
.footer-info{margin-top:6px}
.footer-info a{color:#bed2ff;text-decoration:none}
</style></head>
<body><div class="container">
<div class="header"><h1>IB Withdrawal Success</h1></div>
<div class="content">
<p>Dear ${withdrawal?.userData?.firstName || ""} ${withdrawal?.userData?.lastName || ""},</p>
<p>Your withdrawal request has been successfully processed.</p>
<div class="withdrawal-details">
  <p>IB ID: <span class="highlight">${withdrawal?.referralId || ""}</span></p>
  <p>Withdrawal Amount: <span class="highlight">$${amount.toFixed(2)}</span></p>
  <p>Available Balance: <span class="highlight">$${remaining.toFixed(2)}</span></p>
  <p>Time Stamp: <span class="highlight">${formattedDateTime}</span></p>
</div>
<p>Thank you for choosing us.</p>
<p>Happy trading!</p>
<p>Best regards,<br>The ${import.meta.env.VITE_WEBSITE_NAME || "Forex"} Team</p>
<hr>
</div>
<div class="footer">
  <div class="footer-info">
    <p>Website: <a href="https://${import.meta.env.VITE_EMAIL_WEBSITE}">${import.meta.env.VITE_EMAIL_WEBSITE}</a> | E-mail: <a href="mailto:${import.meta.env.VITE_EMAIL_EMAIL || ""}">${import.meta.env.VITE_EMAIL_EMAIL || ""}</a></p>
    <p>© 2025 ${import.meta.env.VITE_WEBSITE_NAME || ""}. All Rights Reserved</p>
  </div>
</div>
</div></body></html>`;

        await adminApi.put(`/update-referral-withdrawal`, {
          id: withdrawal._id,
          status: "approved",
        });

        try {
          await adminApi.post(`/custom-mail`, {
            email: withdrawal?.userData?.email,
            content: customContent,
            subject: "IB Withdrawal Success",
          });
        } catch (err) {
          console.error("error sending mail", err);
        }

        toast.success("IB Withdrawal Approved", { id: toastId });
      } else {
        await adminApi.put(`/update-referral-withdrawal`, {
          id: withdrawal._id,
          status: "rejected",
        });

        toast.success("IB Withdrawal Rejected", { id: toastId });
      }

      setIsDialogOpen(false);
      await fetchWithdrawalData();
      await fetchAllData();
    } catch (error: any) {
      toast.error(
        `${error?.response?.data?.msg || "Please try again later"}`,
        { id: toastId }
      );
      console.error(
        "Error updating IB withdrawal:",
        error?.response?.data?.msg || error?.message || ""
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters.search]);

  useEffect(() => {
    fetchWithdrawalData();
  }, [currentPage, debouncedSearch, filters.status]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev: number) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev: number) => prev + 1);
  };

  const totalWithdrawalsAmount = allWithdrawalData
    .reduce((total, item) => total + safeNum(item.amount), 0)
    .toFixed(2);

  const totalPendingWithdrawals = allWithdrawalData
    .filter((item) => item.status === "pending")
    .reduce((total, item) => total + safeNum(item.amount), 0)
    .toFixed(2);

  const totalApprovedWithdrawals = allWithdrawalData
    .filter((item) => item.status === "approved")
    .reduce((total, item) => total + safeNum(item.amount), 0)
    .toFixed(2);

  const totalRejectedWithdrawals = allWithdrawalData
    .filter((item) => item.status === "rejected")
    .reduce((total, item) => total + safeNum(item.amount), 0)
    .toFixed(2);

  const getStatusBadge = (value: string) => {
    if (value === "approved") {
      return (
        <span
          className={[
            "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium","bg-success-soft text-success",
          ].join(" ")}
        >
          <CircleCheckBig size={16} />
          Approved
        </span>
      );
    }

    if (value === "rejected") {
      return (
        <span
          className={[
            "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium","bg-danger-soft text-danger",
          ].join(" ")}
        >
          <CircleX size={16} />
          Rejected
        </span>
      );
    }

    return (
      <span
        className={[
          "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium","bg-warning-soft text-warning",
        ].join(" ")}
      >
        <ArrowLeftRight size={16} />
        Pending
      </span>
    );
  };

  /* ---- columns -------------------------------------------------------
     One definition drives the desktop table and the phone rows.
     ------------------------------------------------------------------ */
  const money = (v: any) =>
    "$" +
    Number(v || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const when = (v: any) => {
    if (!v) return "—";
    const d = new Date(v);
    return Number.isNaN(d.getTime())
      ? "—"
      : d.toLocaleString("en-US", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  const columns = [
    {
      key: "user",
      header: "User",
      primary: true,
      cell: (item: any) => (
        <div className="min-w-0">
          <div className="truncate font-semibold text-text">
            {item?.userData?.name || item?.userId?.name || "Not found"}
          </div>
          <div className="numeric mt-0.5 truncate text-xs text-subtle">
            {item?.userData?.email || item?.userId?.email || "—"}
          </div>
        </div>
      ),
    },
    {
      key: "referralId",
      header: "IB ID",
      secondary: true,
      numeric: true,
      cell: (item: any) => item?.referralId || "N/A",
    },
    {
      key: "ibBalance",
      header: "IB balance",
      align: "right",
      numeric: true,
      cell: (item: any) =>
        item?.userData?.ibBalance != null ? (
          money(item.userData.ibBalance)
        ) : (
          <span className="text-subtle">—</span>
        ),
    },
    {
      key: "amount",
      header: "Requested",
      align: "right",
      numeric: true,
      trailing: true,
      cell: (item: any) => (
        <span className="font-semibold">{money(item?.amount)}</span>
      ),
    },
    {
      key: "method",
      header: "Method",
      cell: (item: any) => item?.method || "—",
    },
    {
      key: "createdAt",
      header: "Date",
      cell: (item: any) => (
        <span className="text-subtle">{when(item?.createdAt)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (item: any) => getStatusBadge(item?.status),
    },
    {
      key: "action",
      header: "Action",
      align: "right",
      cardFull: true,
      cell: (item: any) =>
        String(item?.status).toLowerCase() === "pending" ? (
          <div className="flex justify-end gap-1.5">
            <Button
              size="sm"
              variant="success-soft"
              onClick={(e: any) => {
                e.stopPropagation();
                handleActionClick(item, "approve");
              }}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="danger-soft"
              onClick={(e: any) => {
                e.stopPropagation();
                handleActionClick(item, "reject");
              }}
            >
              Reject
            </Button>
          </div>
        ) : (
          <span className="text-subtle">—</span>
        ),
    },
  ];

  const pendingCount = allWithdrawalData.filter(
    (i: any) => i?.status === "pending"
  ).length;

  const totalRecords =
    pagination?.totalWithdrawals || pagination?.totalRecords || 0;

  return (
    <>
      <BlotterPage
        breadcrumb="Partners / IB payouts"
        title="IB payouts"
        description="Review and clear partner commission withdrawal requests."
        actions={
          <Button variant="secondary" onClick={() => fetchWithdrawalData()}>
            Refresh
          </Button>
        }
        readouts={[
          {
            key: "pending",
            label: "Pending value",
            value: money(totalPendingWithdrawals),
            delta: pendingCount + " requests",
            trend: pendingCount ? "down" : "flat",
            tone: "warn",
          },
          {
            key: "approved",
            label: "Approved value",
            value: money(totalApprovedWithdrawals),
            tone: "ok",
          },
          {
            key: "rejected",
            label: "Rejected value",
            value: money(totalRejectedWithdrawals),
            tone: "bad",
          },
          {
            key: "total",
            label: "All payouts",
            value: money(totalWithdrawalsAmount),
            helper: allWithdrawalData.length + " records",
            tone: "brand",
          },
        ]}
        filter={{
          search: filters.search,
          onSearchChange: (v: string) => updateFilter("search", v),
          searchPlaceholder: "name, email, IB id",
          activeChip: filters.status,
          onChipChange: (key: string) => updateFilter("status", key),
          chips: [
            { key: "all", label: "All", tone: "primary" },
            {
              key: "pending",
              label: "Pending",
              tone: "warning",
              count: pendingCount,
            },
            { key: "approved", label: "Approved", tone: "success" },
            { key: "rejected", label: "Rejected", tone: "danger" },
          ],
          summary: totalRecords + " records",
        }}
        columns={columns}
        rows={withdrawalData}
        loading={loading}
        rowEdge={(item: any) =>
          String(item?.status).toLowerCase() === "pending" ? "warning" : null
        }
        empty={
          <EmptyState
            title="No IB payouts found"
            description="Try a different search or filter."
            action={
              <Button variant="soft" onClick={resetFilters}>
                Reset filters
              </Button>
            }
          />
        }
        footer={
          <>
            <span className="numeric text-xs text-subtle">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-1.5">
              <Button
                size="sm"
                variant="secondary"
                onClick={handlePreviousPage}
                disabled={currentPage <= 1 || loading}
              >
                Prev
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleNextPage}
                disabled={currentPage >= totalPages || loading}
              >
                Next
              </Button>
            </div>
          </>
        }
      />
      {/* Action Dialog */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent
          className={[
            "max-w-xl rounded-card backdrop-blur-xl","border-line bg-surface text-text",
          ].join(" ")}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold">
              {actionType === "approve"
                ? "Approve IB Withdrawal"
                : "Reject IB Withdrawal"}
            </AlertDialogTitle>

            <AlertDialogDescription asChild>
              {selectedWithdrawal && (
                <div className={"text-muted"}>
                  <div className="space-y-4">
                    <div
                      className={[
                        "rounded-card border p-4","border-line bg-surface-2",
                      ].join(" ")}
                    >
                      <p
                        className={[
                          "mb-2 text-base font-semibold","text-text",
                        ].join(" ")}
                      >
                        Request Info
                      </p>
                      <p>
                        User: {selectedWithdrawal.userData?.firstName}{" "}
                        {selectedWithdrawal.userData?.lastName}
                      </p>
                      <p>Email: {selectedWithdrawal.userData?.email}</p>
                      <p>
                        Withdrawal Amount: $
                        {safeNum(selectedWithdrawal?.amount).toFixed(2)}
                      </p>
                      <p>Referral Account: {selectedWithdrawal?.referralId}</p>
                      <p>
                        Date:{" "}
                        {CFformatDate(
                          selectedWithdrawal?.updatedAt ||
                            selectedWithdrawal?.createdAt
                        )}
                      </p>
                    </div>

                    <div
                      className={[
                        "rounded-card border p-4","border-line bg-surface-2",
                      ].join(" ")}
                    >
                      <p
                        className={[
                          "mb-2 text-base font-semibold","text-text",
                        ].join(" ")}
                      >
                        Payment Info
                      </p>

                      {displayMethod(selectedWithdrawal.method) === "Bank Transfer" ? (
                        <div className="space-y-1">
                          <div className="my-2 flex items-center gap-2">
                            <WalletCardsIcon size={20} />
                            <h1 className="font-bold">Bank Transfer</h1>
                          </div>
                          <p>
                            Bank Name:{" "}
                            {selectedWithdrawal?.userData?.bankDetails?.bankName}
                          </p>
                          <p>
                            Holder Name:{" "}
                            {selectedWithdrawal?.userData?.bankDetails?.holderName}
                          </p>
                          <p>
                            Account Number:{" "}
                            {selectedWithdrawal?.userData?.bankDetails?.accountNumber}
                          </p>
                          <p>
                            IFSC Code:{" "}
                            {selectedWithdrawal?.userData?.bankDetails?.ifscCode}
                          </p>
                          <p>
                            Swift Code:{" "}
                            {selectedWithdrawal?.userData?.bankDetails?.swiftCode}
                          </p>
                          <p>
                            UPI ID:{" "}
                            {selectedWithdrawal?.userData?.bankDetails?.upiId}
                          </p>
                        </div>
                      ) : displayMethod(selectedWithdrawal.method) === "USDT (TRC20)" ? (
                        <div className="flex items-center gap-2">
                          <WalletCardsIcon size={20} />
                          <p>
                            USDT TRC20 —{" "}
                            {selectedWithdrawal?.userData?.walletDetails?.tetherAddress}
                          </p>
                        </div>
                      ) : displayMethod(selectedWithdrawal.method) === "USDT (BEP20)" ? (
                        <div className="flex items-center gap-2">
                          <WalletCardsIcon size={20} />
                          <p>
                            USDT BEP20 —{" "}
                            {selectedWithdrawal?.userData?.walletDetails?.ethAddress}
                          </p>
                        </div>
                      ) : displayMethod(selectedWithdrawal.method) === "Binance ID" ? (
                        <div className="flex items-center gap-2">
                          <WalletCardsIcon size={20} />
                          <p>
                            Binance ID —{" "}
                            {selectedWithdrawal?.userData?.walletDetails?.accountNumber}
                          </p>
                        </div>
                      ) : displayMethod(selectedWithdrawal.method) === "BTC Address" ? (
                        <div className="flex items-center gap-2">
                          <WalletCardsIcon size={20} />
                          <p>
                            BTC Address —{" "}
                            {selectedWithdrawal?.userData?.walletDetails?.trxAddress}
                          </p>
                        </div>
                      ) : (
                        <div>—</div>
                      )}
                    </div>

                    <p className="text-sm">
                      Are you sure you want to{" "}
                      <span
                        className={
                          actionType === "approve"
                            ?"font-bold text-success"
                            :"font-bold text-danger"
                        }
                      >
                        {actionType === "approve" ? "approve" : "reject"}
                      </span>{" "}
                      this IB withdrawal?
                    </p>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              className={[
                "rounded-card border px-4 py-2","border-line bg-surface-2 text-text hover:bg-surface-2",
              ].join(" ")}
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={() =>
                selectedWithdrawal && handleConfirmAction(selectedWithdrawal)
              }
              disabled={isActionLoading}
              className={[
                "rounded-card border px-4 py-2 text-text disabled:opacity-60",
                actionType === "approve"
                  ? "border-success bg-success hover:bg-success"
                  : "border-danger bg-danger hover:bg-danger",
              ].join(" ")}
            >
              {isActionLoading
                ? "Processing..."
                : `Confirm ${actionType === "approve" ? "Approval" : "Rejection"}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default IbWithdrawalStatus;
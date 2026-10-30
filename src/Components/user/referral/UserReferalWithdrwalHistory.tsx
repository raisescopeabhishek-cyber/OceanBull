import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { ArrowLeft, RefreshCw, Calendar, Clock, DollarSign, Info } from "lucide-react";
import { RiErrorWarningFill } from "react-icons/ri";
import { backendApi } from "../../../utils/apiClients";
import ModernHeading from "../../lib/ModernHeading";

// ✨ ambient visuals (same as other themed pages)
import { FloatingParticles } from "../../../utils/FloatingParticles";
import { AnimatedGrid } from "../../../utils/AnimatedGrid";

const UserReferalWithdrwalHistory = () => {
  const [challengesData, setChallengesData] = useState<any[]>([]);
  const [loader, setLoader] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loggedUser = useSelector((store: any) => store.user.loggedUser);

  // format date ---------------------
  function formatDate(isoDateString?: string) {
    if (!isoDateString) return "--";
    const date = new Date(isoDateString);

    const formattedDate = date.toLocaleDateString("en-GB", {
      year: "numeric",
      day: "2-digit",
      month: "2-digit",
    });

    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    return `${formattedDate}, ${formattedTime}`;
  }

  // since joined ---------------
  function calculateTimeSinceJoined(isoDateString?: string) {
    if (!isoDateString) return "--";
    const joinDate = new Date(isoDateString);
    const today = new Date();
    const diff = Math.max(0, today.getTime() - joinDate.getTime());
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    const parts: string[] = [];
    if (days > 0) parts.push(`${days} day${days !== 1 ? "s" : ""}`);
    if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);
    return parts.length ? `${parts.join(", ")} ago` : "less than a minute ago";
  }

  // fetch -----------------------
  const fetchChallengesData = async () => {
    setLoader(true);
    setError(null);
    try {
      const res = await backendApi.get(`/ib-withdrawals/${loggedUser._id}`);
      setChallengesData((res.data?.data || []).reverse());
    } catch (err) {
      console.error("Error fetching withdrawal history", err);
      setError("Failed to fetch withdrawal history. Please try again later.");
      toast.error("Data fetching failed!!");
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    fetchChallengesData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // quick stats -----------------
  const stats = useMemo(() => {
    const total = challengesData.length;
    const pending = challengesData.filter((x) => x.status === "pending");
    const approved = challengesData.filter((x) => x.status === "approved");
    const rejected = challengesData.filter((x) => x.status === "rejected");
    const sum = (arr: any[], key: "amount" | "totalBalance") =>
      arr.reduce((s, v) => s + Number(v?.[key] || 0), 0);

    const totalRequested = sum(challengesData, "amount");
    const pendingAmount = sum(pending, "amount");
    const approvedAmount = sum(approved, "amount");
    const lastUpdated = challengesData[0]?.updatedAt
      ? new Date(challengesData[0].updatedAt)
      : null;

    return {
      total,
      pendingCount: pending.length,
      approvedCount: approved.length,
      rejectedCount: rejected.length,
      totalRequested,
      pendingAmount,
      approvedAmount,
      lastUpdated,
    };
  }, [challengesData]);

  // status chip style -----------
  const statusClass = (status?: string) => {
    switch (status) {
      case "pending":
        return "bg-warning-soft text-warning border border-warning";
      case "approved":
        return "bg-success-soft text-success border border-success";
      case "rejected":
        return "bg-danger-soft text-danger border border-danger";
      default:
        return "bg-surface-3 text-muted border border-line";
    }
  };

  return (
    <div className="relative min-h-screen">
      <AnimatedGrid />
      <FloatingParticles />

      <div className="max-w-6xl mx-auto pt-6 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Sticky top controls */}
        <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-4 pb-3 backdrop-blur-md to-transparent">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.history.back()}
                className="flex items-center gap-2 rounded-full px-4 py-2 border border-line text-muted hover:bg-surface transition-all"
              >
                <ArrowLeft size={18} />
                Back
              </button>
              <ModernHeading text="IB Withdrawal History" />
            </div>

            <button
              onClick={fetchChallengesData}
              disabled={loader}
              className="px-4 py-2.5 rounded-card border border-line text-muted hover:bg-surface transition-all flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loader ? "animate-spin" : ""}`} />
              {loader ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </div>

        {/* Overview / Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-4 mb-8">
          <div className="relative rounded-card p-4 bg-surface border border-line">
            <div className="absolute -inset-px rounded-card opacity-20 blur-md" />
            <div className="relative flex items-center gap-3">
              <div className="w-10 h-10 rounded-card flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-text" />
              </div>
              <div>
                <p className="text-xs text-subtle">Total Requests</p>
                <p className="text-lg font-semibold text-text">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="relative rounded-card p-4 bg-surface border border-line">
            <div className="absolute -inset-px rounded-card opacity-20 bg-warning-soft blur-md" />
            <div className="relative">
              <p className="text-xs text-subtle">Pending</p>
              <p className="text-lg font-semibold text-text">
                {stats.pendingCount} <span className="text-xs text-subtle">({stats.pendingAmount.toFixed(2)})</span>
              </p>
            </div>
          </div>

          <div className="relative rounded-card p-4 bg-surface border border-line">
            <div className="absolute -inset-px rounded-card opacity-20 blur-md" />
            <div className="relative">
              <p className="text-xs text-subtle">Approved</p>
              <p className="text-lg font-semibold text-text">
                {stats.approvedCount} <span className="text-xs text-subtle">({stats.approvedAmount.toFixed(2)})</span>
              </p>
            </div>
          </div>

          <div className="relative rounded-card p-4 bg-surface border border-line">
            <div className="absolute -inset-px rounded-card opacity-20 blur-md" />
            <div className="relative">
              <p className="text-xs text-subtle">Rejected</p>
              <p className="text-lg font-semibold text-text">{stats.rejectedCount}</p>
            </div>
          </div>

          <div className="relative rounded-card p-4 bg-surface border border-line">
            <div className="absolute -inset-px rounded-card opacity-20 blur-md" />
            <div className="relative flex items-center gap-3">
              <div className="w-10 h-10 rounded-card bg-primary-soft border border-line flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-subtle">Last Updated</p>
                <p className="text-sm font-medium text-muted">
                  {stats.lastUpdated ? formatDate(stats.lastUpdated.toISOString()) : "--"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="border border-line rounded-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] whitespace-nowrap table-stack">
              <thead className="bg-surface border-b border-line">
                <tr>
                  <th className="p-3 text-left text-muted font-medium">Total Amount</th>
                  <th className="p-3 text-center text-muted font-medium">Withdrawal Amount</th>
                  <th className="p-3 text-center text-muted font-medium">Method</th>
                  <th className="p-3 text-center text-muted font-medium">Updated At</th>
                  <th className="p-3 text-center text-muted font-medium">Status</th>
                </tr>
              </thead>

              <tbody>
                {loader ? (
                  <tr>
                    <td colSpan={5} className="py-10">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-line" />
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center">
                      <div className="inline-flex items-center gap-2 text-danger">
                        <Info className="w-5 h-5" />
                        {error}
                      </div>
                    </td>
                  </tr>
                ) : challengesData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center">
                      <div className="flex gap-2 mx-auto justify-center items-center text-muted">
                        <RiErrorWarningFill size={22} className="text-warning" />
                        <p>No withdrawal history available.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  challengesData.map((v, idx) => (
                    <tr
                      key={v._id || idx}
                      className="border-b border-line bg-surface hover:bg-surface transition-colors"
                    >
                      <td data-label="Total Amount" className="p-3 pl-6 text-muted">${Number(v?.totalBalance || 0).toFixed(2)}</td>
                      <td data-label="Withdrawal Amount" className="p-3 text-center text-muted">${Number(v?.amount || 0).toFixed(2)}</td>
                      <td data-label="Method" className="p-3 text-center text-muted">{v?.method || "--"}</td>
                      <td data-label="Updated At" className="p-3 text-center">
                        <div className="text-muted">{formatDate(v?.updatedAt)}</div>
                        <div className="text-xs text-subtle">{calculateTimeSinceJoined(v?.updatedAt)}</div>
                      </td>
                      <td data-label="Status" className="p-3 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusClass(v?.status)}`}>
                          {String(v?.status || "--").toLowerCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* footer hint */}
          {challengesData.length > 0 && !loader && !error && (
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t border-line bg-surface">
              <div className="text-xs sm:text-sm text-subtle">
                Showing {challengesData.length} record{challengesData.length > 1 ? "s" : ""}
              </div>
              <div className="flex items-center gap-2 text-subtle text-xs sm:text-sm">
                <Clock className="w-4 h-4" />
                Data updates as requests are processed
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserReferalWithdrwalHistory;

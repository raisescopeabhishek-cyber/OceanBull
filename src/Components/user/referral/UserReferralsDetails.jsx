// UserReferralsDetails.jsx — Withdraw theme + elevated layout
import { useEffect, useState, useMemo } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Info,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Users,
  TrendingUp,
  DollarSign,
  BarChart3,
  Globe,
} from "lucide-react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import DynamicLoder from "../../Loader/DynamicLoder";
import { useGetInfoByAccounts } from "../../../hooks/user/UseGetInfoByAccounts";
import ModernHeading from "../../lib/ModernHeading";
import { backendApi } from "../../../utils/apiClients";

// ✨ ambient visuals to mirror UserReferal
import { FloatingParticles } from "../../../utils/FloatingParticles";
import { AnimatedGrid } from "../../../utils/AnimatedGrid";

const ITEMS_PER_PAGE = 10;

const UserReferralsDetails = () => {
  const loggedUser = useSelector((store) => store.user.loggedUser);
  const [commissionsData, setCommissionsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedEmails, setExpandedEmails] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  const allAccounts = commissionsData.map((v) => Number(v.accountNumber));
  const { data: ibAccountsData } = useGetInfoByAccounts(allAccounts);

  // ------- stats -------
  const stats = useMemo(() => {
    if (!commissionsData.length)
      return {
        totalUsers: 0,
        uniqueEmails: 0,
        totalCommission: 0,
        totalVolume: 0,
        activeUsers: 0,
        levelDistribution: {},
        countryDistribution: {},
        topCountry: ["Unknown", 0],
        avgCommission: 0,
        avgVolume: 0,
        totalUserEquity: 0,
        activeRate: 0,
      };

    const totalUsers = commissionsData.length;
    const uniqueEmails = new Set(commissionsData.map((u) => u.email)).size;
    const totalCommission = commissionsData.reduce(
      (s, u) => s + (u.totalCommission || 0),
      0
    );
    const totalVolume = commissionsData.reduce(
      (s, u) => s + (u.totalLot || 0),
      0
    );
    const activeUsers = commissionsData.filter(
      (u) => (u.totalCommission || 0) > 0 || (u.totalLot || 0) > 0
    ).length;

    const levelDistribution = commissionsData.reduce((acc, u) => {
      acc[u.level] = (acc[u.level] || 0) + 1;
      return acc;
    }, {});

    const countryDistribution = commissionsData.reduce((acc, u) => {
      const c = u.country === "Unknown" ? "Unknown" : u.country || "Unknown";
      acc[c] = (acc[c] || 0) + 1;
      return acc;
    }, {});
    const topCountry =
      Object.entries(countryDistribution).sort(([, a], [, b]) => b - a)[0] ||
      ["Unknown", 0];

    const avgCommission = totalUsers ? totalCommission / totalUsers : 0;
    const avgVolume = totalUsers ? totalVolume / totalUsers : 0;

    const totalUserEquity = commissionsData.reduce((sum, u) => {
      if (+u.accountNumber <= 0) return sum;
      const acc = ibAccountsData?.find(
        (i) => String(i.Login) === String(u.accountNumber)
      );
      return sum + (acc?.Equity || 0);
    }, 0);

    return {
      totalUsers,
      uniqueEmails,
      totalCommission,
      totalVolume,
      activeUsers,
      levelDistribution,
      countryDistribution,
      topCountry,
      avgCommission,
      avgVolume,
      totalUserEquity,
      activeRate: totalUsers ? (activeUsers / totalUsers) * 100 : 0,
    };
  }, [commissionsData, ibAccountsData]);

  // ------- data -------
  const fetchCommissions = async () => {
    setIsLoading(true);
    try {
      const res = await backendApi.get(
        `/user-zone-ibs/${loggedUser?.referralAccount}`
      );
      console.log(res);
      
      setCommissionsData((res.data?.data || []).reverse());
      setCurrentPage(1);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ------- UI state -------
  const toggleDropdown = (email) =>
    setExpandedEmails((prev) => ({ ...prev, [email]: !prev[email] }));

  const filteredData = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return commissionsData;
    return commissionsData.filter(
      (item) =>
        (item.email || "").toLowerCase().includes(q) ||
        (item.name || "").toLowerCase().includes(q) ||
        (item.country || "").toLowerCase().includes(q) ||
        String(item.accountNumber || "").toLowerCase().includes(q)
    );
  }, [commissionsData, searchTerm]);

  const groupedData = useMemo(() => {
    return filteredData.reduce((acc, item) => {
      const key = item.email;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [filteredData]);

  const paginatedEmails = useMemo(
    () =>
      Object.keys(groupedData).slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
      ),
    [groupedData, currentPage]
  );

  const totalPages = Math.ceil(
    Object.keys(groupedData).length / ITEMS_PER_PAGE || 1
  );

  // ------- small UI pieces -------
  const StatCard = ({ icon: Icon, title, value, subtitle, ring = "" }) => (
    <div className="relative rounded-card p-4 bg-surface border border-line hover:border-line transition-all">
      <div className="absolute -inset-px rounded-card opacity-20 blur-md" />
      <div className="relative flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${ring} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-text" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-subtle">{title}</p>
          <p className="text-lg font-semibold text-text">{value}</p>
          {subtitle && <p className="text-xs text-subtle">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  const LevelBadge = ({ level, count, max }) => {
    const pct = Math.min(100, Math.round((count / (max || 1)) * 100));
    return (
      <div className="bg-surface border border-line rounded-card p-3 min-w-[120px]">
        <div className="flex items-center justify-between mb-1">
          <span className="text-muted text-sm font-semibold">L{level}</span>
          <span className="text-subtle text-xs">{count}</span>
        </div>
        <div className="h-1.5 rounded-full bg-surface-3 overflow-hidden">
          <div
            className="h-full"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen">
      <AnimatedGrid />
      <FloatingParticles />

      <div className="max-w-6xl mx-auto pt-6 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Sticky Controls */}
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
              <ModernHeading text="IB Users" />
            </div>

            <div className="flex items-stretch gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-72">
                <input
                  type="text"
                  placeholder="Search name, email, country or account…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 rounded-card bg-surface-3 backdrop-blur-sm border border-line text-muted placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-subtle text-sm hover:text-muted"
                  >
                    ✕
                  </button>
                )}
              </div>
              <button
                onClick={fetchCommissions}
                disabled={isLoading}
                className="px-4 py-2.5 rounded-card border border-line text-muted hover:bg-surface transition-all flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                {isLoading ? "Refreshing…" : "Refresh"}
              </button>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-4 mb-8">
          <StatCard
            icon={Users}
            title="Total Users"
            value={stats.totalUsers || 0}
            subtitle={`${stats.uniqueEmails || 0} unique`}
            ring=""
          />
          <StatCard
            icon={DollarSign}
            title="Total Commission"
            value={(stats.totalCommission || 0).toFixed(4)}
            subtitle={`${(stats.avgCommission || 0).toFixed(4)}/user`}
            ring=""
          />
          <StatCard
            icon={BarChart3}
            title="Total Volume"
            value={(stats.totalVolume || 0).toFixed(4)}
            subtitle={`${(stats.avgVolume || 0).toFixed(4)}/user`}
            ring="to-fuchsia-500"
          />
          <StatCard
            icon={Globe}
            title="Top Country"
            value={stats.topCountry?.[0] || "Unknown"}
            subtitle={`${stats.topCountry?.[1] || 0} users`}
            ring=""
          />
          <StatCard
            icon={TrendingUp}
            title="Users Equity"
            value={(stats.totalUserEquity || 0).toFixed(2)}
            subtitle="Live balance"
            ring=""
          />
        </div>

        {/* Level Distribution */}
        {Object.keys(stats.levelDistribution || {}).length > 0 && (
          <div className="border border-line rounded-card p-4 sm:p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-card bg-primary-soft flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-muted font-semibold">Level Distribution</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {(() => {
                const entries = Object.entries(stats.levelDistribution).sort(
                  ([a], [b]) => Number(a) - Number(b)
                );
                const max = Math.max(...entries.map(([, c]) => c), 1);
                return entries.map(([level, count]) => (
                  <LevelBadge key={level} level={level} count={count} max={max} />
                ));
              })()}
            </div>
          </div>
        )}

        {/* Data */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <DynamicLoder />
          </div>
        ) : (
          <div className="border border-line rounded-card overflow-hidden">
            {/* Table header */}
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap table-stack">
                <thead className="bg-surface border-b border-line sticky top-[72px]">
                  <tr>
                    <th className="p-3 text-left text-muted font-medium">Name / Email</th>
                    <th className="p-3 text-center text-muted font-medium">Country</th>
                    <th className="p-3 text-center text-muted font-medium">AC No</th>
                    <th className="p-3 text-center text-muted font-medium">Live Equity</th>
                    <th className="p-3 text-center text-muted font-medium">Level</th>
                    <th className="p-3 text-center text-muted font-medium">Total Volume</th>
                    <th className="p-3 text-center text-muted font-medium">Total Earned</th>
                    <th className="p-3 text-center text-muted font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedEmails.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-40">
                        <div className="flex items-center justify-center gap-2 text-danger">
                          <Info className="w-5 h-5" />
                          No data found
                        </div>
                      </td>
                    </tr>
                  )}

                  {paginatedEmails.map((email) => {
                    const users = groupedData[email];
                    const isExpanded = !!expandedEmails[email];
                    const first = users[0];

                    return (
                      <>
                        <tr
                          key={email}
                          className="border-b border-line bg-surface hover:bg-surface transition-colors"
                        >
                          <td data-label="Name / Email"
                            className="pl-6 pr-3 py-3 cursor-pointer"
                            onClick={() => toggleDropdown(email)}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-muted">{first?.name || "-"}</p>
                                <p className="truncate text-subtle text-sm">{email}</p>
                              </div>
                              {users.length > 1 && (
                                <span className="text-subtle">
                                  {isExpanded ? <ChevronUp /> : <ChevronDown />}
                                </span>
                              )}
                            </div>
                          </td>

                          <td data-label="Country" className="p-3 text-center text-muted">{first?.country || "-"}</td>
                          <td data-label="AC No" className="p-3 text-center text-muted">{first?.accountNumber}</td>
                          <td data-label="Live Equity" className="p-3 text-center text-success">
                            {ibAccountsData ? (
                              +first.accountNumber <= 0 ? (
                                "--"
                              ) : (
                                ibAccountsData?.find(
                                  (i) => String(i.Login) === String(first.accountNumber)
                                )?.Equity ?? "--"
                              )
                            ) : (
                              <Loader2 className="animate-spin mx-auto" />
                            )}
                          </td>
                          <td data-label="Level" className="p-3 text-center text-muted">{first?.level}</td>
                          <td data-label="Total Volume" className="p-3 text-center text-muted">
                            {first?.totalLot?.toFixed(4) || "0"}
                          </td>
                          <td data-label="Total Earned" className="p-3 text-center text-muted">
                            {first?.totalCommission?.toFixed(4) || "0"}
                          </td>
                          <td data-label="Action" className="p-3 text-center">
                            <Link
                              to={`/user/referral-close-trades/${first?.accountNumber}?level=${first?.level}`}
                              className="inline-flex"
                            >
                              <ArrowRight className="text-primary hover:text-primary hover:scale-105 transition-transform" />
                            </Link>
                          </td>
                        </tr>

                        {isExpanded &&
                          users.slice(1).map((u) => (
                            <tr
                              key={u._id}
                              className="border-b border-line bg-surface hover:bg-surface transition-colors"
                            >
                              <td data-label="Name / Email" className="pl-12 pr-3 py-2">
                                <p className="text-muted">{u.name}</p>
                                <p className="text-subtle text-sm">{u.email}</p>
                              </td>
                              <td data-label="Country" className="p-2 text-center text-muted">{u.country || "-"}</td>
                              <td data-label="AC No" className="p-2 text-center text-muted">{u.accountNumber}</td>
                              <td data-label="Live Equity" className="p-2 text-center text-success">
                                {+u.accountNumber <= 0
                                  ? "--"
                                  : ibAccountsData?.find(
                                      (i) => String(i.Login) === String(u.accountNumber)
                                    )?.Equity ?? "--"}
                              </td>
                              <td data-label="Level" className="p-2 text-center text-muted">{u.level}</td>
                              <td data-label="Total Volume" className="p-2 text-center text-muted">
                                {u.totalLot?.toFixed(4) || "0"}
                              </td>
                              <td data-label="Total Earned" className="p-2 text-center text-muted">
                                {u.totalCommission?.toFixed(4) || "0"}
                              </td>
                              <td data-label="Action" className="p-2 text-center">
                                <Link
                                  to={`/user/referral-close-trades/${u.accountNumber}?level=${u.level}`}
                                  className="inline-flex"
                                >
                                  <ArrowRight className="text-primary hover:text-primary hover:scale-105 transition-transform" />
                                </Link>
                              </td>
                            </tr>
                          ))}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 py-4 border-t border-line bg-surface">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-1.5 rounded-full border border-line text-muted disabled:opacity-40 hover:bg-surface transition"
                >
                  Prev
                </button>
                <span className="text-muted">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-1.5 rounded-full border border-line text-muted disabled:opacity-40 hover:bg-surface transition"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserReferralsDetails;

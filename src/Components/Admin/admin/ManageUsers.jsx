import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import UseUserHook from "@/hooks/user/UseUserHook";
import { adminApi } from "@/utils/apiClients";
import {
  CFcalculateTimeSinceJoined,
  CFformatDate,
} from "@/utils/CustomFunctions";
import {
  Badge,
  BlotterPage,
  Button,
  EmptyState,
} from "@/Components/ui";

const PAGE_LIMIT = 10;

/**
 * Manage users.
 *
 * The list is a blotter: one column definition drives the desktop table and
 * the labelled rows a phone gets, so the account, its verification state and
 * the two actions stay readable at every width. The two verification filters
 * are a chip row (KYC, which admins act on) and a select (email), which is
 * what the design system's filter bar is shaped for.
 */

const ManageUsers = () => {
  const { getReset } = UseUserHook();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    emailStatus: "all",
    kycStatus: "all",
  });

  const [debouncedSearch, setDebouncedSearch] = useState("");

  const totalPages = Math.max(
    1,
    Math.ceil((pagination?.totalUsers || 0) / PAGE_LIMIT)
  );

  const updateFilter = (key, value) => {
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
      emailStatus: "all",
      kycStatus: "all",
    });
  };

  /** Opens the client's own dashboard in a new tab as that user. */
  const userRedirectHandler = async (user) => {
    try {
      getReset();

      const res = await adminApi.post("/impersonate", { userId: user._id });

      if (!res.data.impersonated) {
        window.open(res.data?.redirectTo, "_blank", "noopener,noreferrer");
      }

      toast.success(`Welcome 👋🏽 ${res.data.userName}`);

      window.open("/user/dashboard", "_blank");
    } catch (e) {
      toast.error("Impersonation failed");
      console.error(e);
    }
  };

  const fetchUsersData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: PAGE_LIMIT.toString(),
        search: debouncedSearch,
      });

      if (filters.emailStatus === "verified") {
        params.append("emailVerified", "true");
      } else if (filters.emailStatus === "unverified") {
        params.append("emailVerified", "false");
      }

      if (filters.kycStatus === "verified") {
        params.append("kycVerified", "true");
      } else if (filters.kycStatus === "unverified") {
        params.append("kycVerified", "false");
      }

      const res = await adminApi.get(`/get-users?${params.toString()}`);
      const finalRes = res?.data;

      setUsers(finalRes?.data || []);
      setPagination(finalRes?.pagination || {});
    } catch (error) {
      console.log("Error fetching users:", error);
      toast.error("Something went wrong while fetching users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters.search]);

  useEffect(() => {
    fetchUsersData();
  }, [currentPage, debouncedSearch, filters.emailStatus, filters.kycStatus]);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const fullName = (user) =>
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Unnamed";

  const columns = [
    {
      key: "user",
      header: "User",
      primary: true,
      cell: (user) => (
        <div className="min-w-0">
          <div className="truncate font-semibold text-text">
            {fullName(user)}
          </div>
          <div className="numeric mt-0.5 truncate text-xs text-subtle">
            {user?.email || "—"}
          </div>
        </div>
      ),
    },
    {
      key: "country",
      header: "Country",
      secondary: true,
      cell: (user) => user?.country || "—",
    },
    {
      key: "accounts",
      header: "Accounts",
      align: "right",
      numeric: true,
      trailing: true,
      cell: (user) => user?.accounts?.length ?? 0,
    },
    {
      key: "email",
      header: "Email",
      cell: (user) => (
        <Badge tone={user?.emailVerified ? "success" : "warning"} dot={false}>
          {user?.emailVerified ? "Verified" : "Unverified"}
        </Badge>
      ),
    },
    {
      key: "kyc",
      header: "KYC",
      cell: (user) => (
        <Badge tone={user?.kycVerified ? "success" : "neutral"} dot={false}>
          {user?.kycVerified ? "Verified" : "Not verified"}
        </Badge>
      ),
    },
    {
      key: "joined",
      header: "Joined",
      cell: (user) => (
        <div className="min-w-0">
          <div className="numeric truncate text-xs text-text">
            {CFformatDate(user?.createdAt)}
          </div>
          <div className="truncate text-[11px] text-subtle">
            {CFcalculateTimeSinceJoined(user?.createdAt)}
          </div>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      cardFull: true,
      cell: (user) => (
        <div className="flex justify-end gap-1.5">
          <Button
            as={Link}
            to={`/admin/user-detail/${user?._id}`}
            size="sm"
            variant="secondary"
            onClick={(e) => e.stopPropagation()}
          >
            Details
          </Button>
          <Button
            size="sm"
            variant="soft"
            onClick={(e) => {
              e.stopPropagation();
              userRedirectHandler(user);
            }}
          >
            Sign in as
          </Button>
        </div>
      ),
    },
  ];

  const pageKycVerified = users.filter((u) => u?.kycVerified).length;
  const pageEmailVerified = users.filter((u) => u?.emailVerified).length;

  return (
    <BlotterPage
      breadcrumb="Clients / Users"
      title="Manage users"
      description="Search accounts, check verification state and open a client's dashboard."
      actions={
        <>
          <Button variant="secondary" onClick={() => navigate("/admin/kyc-users")}>
            KYC queue
          </Button>
          <Button variant="secondary" onClick={fetchUsersData} loading={loading}>
            Refresh
          </Button>
        </>
      }
      readouts={[
        {
          key: "total",
          label: "Total users",
          value: (pagination?.totalUsers || 0).toLocaleString("en-US"),
          helper: `${totalPages} pages`,
          tone: "brand",
        },
        {
          key: "page",
          label: "On this page",
          value: users.length,
          helper: `Page ${currentPage}`,
        },
        {
          key: "kyc",
          label: "KYC verified here",
          value: `${pageKycVerified} / ${users.length || 0}`,
          tone: pageKycVerified === users.length ? "ok" : "warn",
        },
        {
          key: "email",
          label: "Email verified here",
          value: `${pageEmailVerified} / ${users.length || 0}`,
          tone: pageEmailVerified === users.length ? "ok" : "warn",
        },
      ]}
      filter={{
        search: filters.search,
        onSearchChange: (v) => updateFilter("search", v),
        searchPlaceholder: "name, email, country",
        activeChip: filters.kycStatus,
        onChipChange: (key) => updateFilter("kycStatus", key),
        chips: [
          { key: "all", label: "All KYC", tone: "primary" },
          { key: "verified", label: "KYC verified", tone: "success" },
          { key: "unverified", label: "KYC pending", tone: "warning" },
        ],
        selects: [
          {
            key: "emailStatus",
            label: "Email",
            value: filters.emailStatus,
            onChange: (v) => updateFilter("emailStatus", v),
            options: [
              { value: "all", label: "Any email state" },
              { value: "verified", label: "Email verified" },
              { value: "unverified", label: "Email unverified" },
            ],
          },
        ],
        summary: `${(pagination?.totalUsers || 0).toLocaleString("en-US")} users`,
      }}
      columns={columns}
      rows={users}
      loading={loading}
      rowEdge={(user) => (user?.kycVerified ? null : "warning")}
      empty={
        <EmptyState
          title="No users found"
          description="Try a different search or clear the verification filters."
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
  );
};

export default ManageUsers;

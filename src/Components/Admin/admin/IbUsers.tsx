import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";

import { adminApi } from "../../../utils/apiClients";
import { setLoggedUser } from "../../../redux/user/userSlice";
import UseUserHook from "../../../hooks/user/UseUserHook";
import { Badge, BlotterPage, Button, EmptyState } from "@/Components/ui";

const PAGE_LIMIT = 10;

/**
 * Introducing-broker accounts.
 *
 * A blotter rather than a bespoke table: the IB id, commission balance and
 * referral link are the three things an admin comes here for, so each is its
 * own column and the link copies in place instead of needing to be selected.
 */

const IbUsers = () => {
  const dispatch = useDispatch();
  const { getReset } = UseUserHook();

  const [ibUsers, setIbUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<any>({
    totalPages: 1,
    totalUsers: 0,
  });

  const [filters, setFilters] = useState({
    search: "",
  });

  const [debouncedSearch, setDebouncedSearch] = useState("");

  const extractedUrl = (() => {
    try {
      return new URL(window.location.href).origin;
    } catch {
      return "";
    }
  })();

  const totalPages = Math.max(
    1,
    Number(pagination?.totalPages) ||
      Math.ceil((Number(pagination?.totalUsers) || 0) / PAGE_LIMIT)
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
    });
    setDebouncedSearch("");
  };

  const fetchUsersData = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get(
        `/get-users?page=${currentPage}&limit=${PAGE_LIMIT}&search=${encodeURIComponent(
          debouncedSearch
        )}&referralUsers=true`
      );
      setPagination(res.data?.pagination || { totalPages: 1, totalUsers: 0 });
      setIbUsers(res.data?.data || []);
    } catch (error) {
      toast.error("Something went wrong");
      console.log("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success("Link copied");
  };

  const handleLoginAsUser = (user: any) => {
    getReset();
    dispatch(setLoggedUser(user));
    window.open("/user/dashboard", "_blank");
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(filters.search), 500);
    return () => clearTimeout(handler);
  }, [filters.search]);

  useEffect(() => {
    fetchUsersData();
  }, [currentPage, debouncedSearch]);

  const money = (v: any) =>
    "$" +
    Number(v || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const fullName = (item: any) =>
    [item?.firstName, item?.lastName].filter(Boolean).join(" ") || "Unnamed";

  const referralLink = (item: any) =>
    `${extractedUrl}/user/signup/${item?.referralAccount}`;

  const columns = [
    {
      key: "user",
      header: "User",
      primary: true,
      cell: (item: any) => (
        <div className="min-w-0">
          <div className="truncate font-semibold text-text">
            {fullName(item)}
          </div>
          <div className="numeric mt-0.5 truncate text-xs text-subtle">
            {item?.email || "—"}
          </div>
        </div>
      ),
    },
    {
      key: "referralAccount",
      header: "IB ID",
      secondary: true,
      numeric: true,
      cell: (item: any) => item?.referralAccount || "N/A",
    },
    {
      key: "ibBalance",
      header: "IB balance",
      align: "right",
      numeric: true,
      trailing: true,
      cell: (item: any) => (
        <span className="font-semibold">{money(item?.ibBalance)}</span>
      ),
    },
    {
      key: "accounts",
      header: "MT5 accounts",
      align: "right",
      numeric: true,
      cell: (item: any) => item?.accounts?.length ?? 0,
    },
    {
      key: "verification",
      header: "Verification",
      cell: (item: any) => (
        <div className="flex flex-wrap gap-1.5">
          <Badge tone={item?.emailVerified ? "success" : "warning"} dot={false}>
            {item?.emailVerified ? "Email" : "No email"}
          </Badge>
          <Badge tone={item?.kycVerified ? "success" : "neutral"} dot={false}>
            {item?.kycVerified ? "KYC" : "No KYC"}
          </Badge>
        </div>
      ),
    },
    {
      key: "link",
      header: "Referral link",
      cardFull: true,
      cell: (item: any) =>
        item?.referralAccount ? (
          <div className="flex min-w-0 items-center gap-1.5">
            <code className="numeric min-w-0 flex-1 truncate rounded-field border border-line bg-surface-2 px-2 py-1 text-[11px] text-muted">
              {referralLink(item)}
            </code>
            <Button
              size="sm"
              variant="secondary"
              onClick={(e: any) => {
                e.stopPropagation();
                copyToClipboard(referralLink(item));
              }}
            >
              Copy
            </Button>
          </div>
        ) : (
          <span className="text-subtle">—</span>
        ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      cardFull: true,
      cell: (item: any) => (
        <div className="flex justify-end gap-1.5">
          <Button
            as={Link}
            to={`/admin/user-detail/${item?._id}`}
            size="sm"
            variant="secondary"
            onClick={(e: any) => e.stopPropagation()}
          >
            Details
          </Button>
          <Button
            size="sm"
            variant="soft"
            onClick={(e: any) => {
              e.stopPropagation();
              handleLoginAsUser(item);
            }}
          >
            Sign in as
          </Button>
        </div>
      ),
    },
  ];

  const pageBalance = ibUsers.reduce(
    (total: number, item: any) => total + Number(item?.ibBalance || 0),
    0
  );

  return (
    <BlotterPage
      breadcrumb="Partners / IB accounts"
      title="IB accounts"
      description="Partner accounts, their commission balance and referral links."
      actions={
        <Button variant="secondary" onClick={fetchUsersData} loading={loading}>
          Refresh
        </Button>
      }
      readouts={[
        {
          key: "total",
          label: "Total IB accounts",
          value: (pagination?.totalUsers || 0).toLocaleString("en-US"),
          helper: `${totalPages} pages`,
          tone: "brand",
        },
        {
          key: "balance",
          label: "Balance on this page",
          value: money(pageBalance),
          helper: `${ibUsers.length} accounts`,
          tone: "ok",
        },
        {
          key: "kyc",
          label: "KYC verified here",
          value: `${ibUsers.filter((i: any) => i?.kycVerified).length} / ${
            ibUsers.length
          }`,
        },
      ]}
      filter={{
        search: filters.search,
        onSearchChange: (v: string) => updateFilter("search", v),
        searchPlaceholder: "name, email, IB id",
        summary: `${(pagination?.totalUsers || 0).toLocaleString(
          "en-US"
        )} accounts`,
      }}
      columns={columns}
      rows={ibUsers}
      loading={loading}
      empty={
        <EmptyState
          title="No IB accounts found"
          description="No partner account matches that search."
          action={
            <Button variant="soft" onClick={resetFilters}>
              Clear search
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

export default IbUsers;

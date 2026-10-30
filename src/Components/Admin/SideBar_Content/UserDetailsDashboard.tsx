import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import UserInfoForm from "../user-detail/UserForm";
import UserTradeAccounts from "../user-detail/UserTradeAccounts";
import { adminApi } from "../../../utils/apiClients";
import { CFformatDate } from "../../../utils/CustomFunctions";
import { useMt5Accounts } from "../../../hooks/useMt5Accounts";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  PageHeader,
  Readout,
  ReadoutStrip,
  Skeleton,
} from "@/Components/ui";

/**
 * One client's record. This is the page `/admin/user-detail/:id` routes to.
 *
 * It was wrapped in an `AnimatedGrid` and `FloatingParticles` layer, had its
 * own `max-w-7xl` container fighting the app shell's own width, and carried
 * local `StatCard` and `Panel` components taking `isDark`. The figures are
 * now the design system's readout strip and the two sub-forms sit in plain
 * cards, so the page inherits the shell's width and the theme.
 */

const money = (n: any, d = 2) =>
  `$${Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  })}`;

const UserDetailDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [userData, setUserData] = useState<any>(null);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const accountsRef = useRef<HTMLDivElement | null>(null);
  const userRequestRef = useRef(0);

  const accountNumbers = useMemo(
    () =>
      String(userData?._id) === String(id)
        ? (userData?.accounts || []).map((account: any) => account.accountNumber)
        : [],
    [userData, id]
  );

  const {
    byLogin,
    isReady,
    refresh: refreshBalances,
  } = useMt5Accounts(accountNumbers);

  const equityLoading =
    loading ||
    accountNumbers.some((account: any) => !isReady(account, ["Equity"]));

  const totalBalance = accountNumbers.reduce(
    (total: number, account: any) =>
      total + (byLogin[String(account)]?.Equity ?? 0),
    0
  );

  const totalTransactions = useMemo(
    () => [...deposits, ...withdrawals],
    [deposits, withdrawals]
  );

  const totalInvestAmount = useMemo(
    () => deposits.reduce((t, v) => t + Number(v?.deposit || 0), 0),
    [deposits]
  );

  const totalWithdrawalAmount = useMemo(
    () => withdrawals.reduce((t, v) => t + Number(v?.amount || 0), 0),
    [withdrawals]
  );

  const fetchUserData = async () => {
    const request = ++userRequestRef.current;
    setLoading(true);
    try {
      const [res, depRes, wRes] = await Promise.all([
        adminApi.get(`/get-user?id=${id}`),
        adminApi.get(`/deposits`),
        adminApi.get(`/withdrawals`),
      ]);
      if (request !== userRequestRef.current) return;

      const user = res?.data?.data || null;
      setUserData(user);

      const userId = user?._id;

      const userDeposits = (depRes?.data?.data || []).filter(
        (d: any) => d?.userId?._id === userId
      );
      const userWithdrawals = (wRes?.data?.data || []).filter(
        (w: any) => w?.userId?._id === userId
      );

      setDeposits(userDeposits);
      setWithdrawals(userWithdrawals);
    } catch (error) {
      if (request !== userRequestRef.current) return;
      console.error("Failed to load user:", error);
      toast.error("Failed to load user data");
    } finally {
      if (request === userRequestRef.current) setLoading(false);
    }
  };

  const goToAccounts = () => {
    if (!accountsRef.current) return;
    const y =
      accountsRef.current.getBoundingClientRect().top +
      window.pageYOffset -
      108;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  useEffect(() => {
    if (id) fetchUserData();
    return () => {
      userRequestRef.current += 1;
    };
  }, [id]);

  const fullName = `${userData?.firstName || ""} ${
    userData?.lastName || ""
  }`.trim();
  const email = userData?.email || "—";
  const country = userData?.country || "N/A";
  const joined = userData?.createdAt ? CFformatDate(userData.createdAt) : "—";

  const netFlow = totalInvestAmount - totalWithdrawalAmount;

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <PageHeader
        breadcrumb="Clients / Detail"
        title={loading ? "Loading client…" : fullName || "Client"}
        description={email}
        actions={
          <>
            <Badge
              tone={userData?.kycVerified ? "success" : "warning"}
              dot={false}
            >
              {userData?.kycVerified ? "KYC verified" : "KYC pending"}
            </Badge>
            <Button variant="secondary" onClick={goToAccounts}>
              Accounts
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                fetchUserData();
                refreshBalances?.();
              }}
              loading={loading}
            >
              Refresh
            </Button>
            <Button variant="ghost" onClick={() => navigate(-1)}>
              Back
            </Button>
          </>
        }
      />

      <ReadoutStrip>
        <Readout
          label="MT5 accounts"
          value={userData?.accounts?.length ?? 0}
          helper={country}
          tone="brand"
        />
        <Readout
          label="Total equity"
          value={equityLoading ? "Updating…" : money(totalBalance)}
          helper="Live from MT5"
          tone="brand"
        />
        <Readout
          label="Deposits"
          value={money(totalInvestAmount)}
          helper={`${deposits.length} records`}
          trend="up"
          tone="ok"
        />
        <Readout
          label="Withdrawals"
          value={money(totalWithdrawalAmount)}
          helper={`${withdrawals.length} records`}
          trend="down"
          tone="bad"
        />
        <Readout
          label="Net flow"
          value={money(netFlow)}
          trend={netFlow >= 0 ? "up" : "down"}
          tone={netFlow >= 0 ? "ok" : "bad"}
        />
        <Readout
          label="Transactions"
          value={totalTransactions.length}
          helper={`Joined ${joined}`}
        />
      </ReadoutStrip>

      {loading && !userData ? (
        <Skeleton className="h-64" />
      ) : (
        <Card className="min-w-0">
          <CardHeader
            title="Profile"
            subtitle="Identity and contact details on file."
            className="px-3.5 py-2.5"
          />
          <div className="p-3.5">
            <UserInfoForm userData={userData} />
          </div>
        </Card>
      )}

      <div ref={accountsRef}>
        <Card className="min-w-0">
          <CardHeader
            title="Trading accounts"
            subtitle="MT5 accounts, their group and leverage."
            className="px-3.5 py-2.5"
          />
          <div className="p-3.5">
            <UserTradeAccounts
              fetchUserData={fetchUserData}
              userData={userData}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UserDetailDashboard;

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import UserInfoForm from "@/Components/Admin/user-detail/UserForm";
import UserTradeAccounts from "@/Components/Admin/user-detail/UserTradeAccounts";
import { adminApi } from "@/utils/apiClients";
import { useMt5Accounts } from "../../../hooks/useMt5Accounts";
import { Card, PageHeader, Readout, ReadoutStrip } from "@/Components/ui";

/**
 * One client's record.
 *
 * The figures were six pill-shaped cards whose background was a stock texture
 * fetched from an external image host on every render — a third-party request
 * on an admin page showing a named client's data. They are now the design
 * system's readout strip, which also keeps them aligned and legible on a
 * phone.
 */

const money = (value) =>
  "$" +
  Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const UserDetailDashboard = () => {
  const { id } = useParams();
  const [userData, setUserData] = useState();
  const [totalDeposit, setTotalDeposit] = useState([]);
  const [totalWithdrwal, setTotalWithdrwal] = useState([]);
  const totalTransactions = [...totalDeposit, ...totalWithdrwal];
  const totalTransactionsLength = totalTransactions.length;
  const [loading, setLoading] = useState(true);
  const userRequestRef = useRef(0);

  const accountNumbers = useMemo(
    () =>
      String(userData?._id) === String(id)
        ? (userData?.accounts || []).map((account) => account.accountNumber)
        : [],
    [userData, id]
  );

  const { byLogin, isReady } = useMt5Accounts(accountNumbers);

  const equityLoading =
    loading || accountNumbers.some((account) => !isReady(account, ["Equity"]));

  const totalBalance = accountNumbers.reduce(
    (total, account) => total + (byLogin[String(account)]?.Equity ?? 0),
    0
  );

  const totalInvestAmount = totalDeposit.reduce(
    (total, value) => total + (Number(value.deposit) || 0),
    0
  );

  const totalWithdrwalAmount = totalWithdrwal.reduce(
    (total, value) => total + (Number(value.amount) || 0),
    0
  );

  const fetchUserData = async () => {
    const request = ++userRequestRef.current;
    setLoading(true);
    try {
      const res = await adminApi.get(`/get-user?id=${id}`);
      const depositRes = await adminApi.get(`/deposits`);
      const withdrwalRes = await adminApi.get(`/withdrawals`);
      if (request !== userRequestRef.current) return;

      setUserData(res.data.data);
      setTotalDeposit(
        depositRes.data.data.filter(
          (value) => value?.userId?._id === res.data.data._id
        )
      );

      setTotalWithdrwal(
        withdrwalRes.data.data.filter(
          (value) => value?.userId?._id === res.data.data._id
        )
      );
    } catch (error) {
      if (request !== userRequestRef.current) return;
      console.log("error in fetch user data", error);
    } finally {
      if (request === userRequestRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchUserData();
    return () => {
      userRequestRef.current += 1;
    };
  }, [id]);

  const fullName =
    [userData?.firstName, userData?.lastName].filter(Boolean).join(" ") ||
    "Client";

  const netFlow = totalInvestAmount - totalWithdrwalAmount;

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <PageHeader
        breadcrumb="Clients / Detail"
        title={loading ? "Loading client…" : fullName}
        description={userData?.email || "Account, balances and trading accounts."}
      />

      <ReadoutStrip>
        <Readout
          label="MT5 accounts"
          value={userData?.accounts?.length ?? 0}
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
          helper={`${totalDeposit.length} records`}
          trend="up"
          tone="ok"
        />
        <Readout
          label="Withdrawals"
          value={money(totalWithdrwalAmount)}
          helper={`${totalWithdrwal.length} records`}
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
          value={totalTransactionsLength}
          helper="Deposits and withdrawals"
        />
      </ReadoutStrip>

      <Card className="min-w-0 p-3.5">
        <UserInfoForm userData={userData} />
      </Card>

      <Card className="min-w-0 p-3.5">
        <UserTradeAccounts
          fetchUserData={fetchUserData}
          userData={userData}
        />
      </Card>
    </div>
  );
};

export default UserDetailDashboard;

export const cx = (...classes) => classes.filter(Boolean).join(" ");

export const unwrapData = (input) => {
  if (input?.data?.data !== undefined) return input.data.data;
  if (input?.data !== undefined) return input.data;
  return input;
};

export const asArray = (input) => {
  const data = unwrapData(input);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.result)) return data.result;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.masters)) return data.masters;
  if (Array.isArray(data?.users)) return data.users;
  if (Array.isArray(data?.accounts)) return data.accounts;
  if (Array.isArray(data?.copiers)) return data.copiers;
  if (Array.isArray(data?.trades)) return data.trades;
  if (Array.isArray(data?.rows)) return data.rows;

  return [];
};

export const getNestedUser = (res) => {
  return (
    res?.user ||
    res?.data?.user ||
    res?.data?.data?.user ||
    res?.data ||
    null
  );
};

export const getUserIdFromUser = (user) => {
  return user?._id || user?.id || user?.userId || user?.sub || "";
};

export const getUserAccountsFromUser = (user) => {
  const accounts = user?.accounts || user?.user?.accounts || [];
  return Array.isArray(accounts) ? accounts : [];
};

export const pickAccountNumber = (account) => {
  return (
    account?.accountNumber ||
    account?.mt5Account ||
    account?.MT5Account ||
    account?.login ||
    account?.Login ||
    ""
  );
};

export const pickMasterAccount = (master) => {
  return (
    master?.masterAccount ||
    master?.MT5Account ||
    master?.mt5Account ||
    master?.account ||
    master?.login ||
    master?.Login ||
    master?.MasterAccount ||
    ""
  );
};

export const pickName = (item) => {
  return (
    item?.nickname ||
    item?.name ||
    item?.Name ||
    item?.title ||
    item?.email ||
    "-"
  );
};

export const formatMoney = (value) => {
  const num = Number(value || 0);

  return `$${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatNumber = (value) => {
  const num = Number(value || 0);
  return num.toLocaleString("en-US");
};

export const formatDateTime = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString();
};

export const getLocalStoredUser = () => {
  try {
    const raw =
      localStorage.getItem("user") ||
      localStorage.getItem("loggedUser") ||
      localStorage.getItem("authUser") ||
      "";

    if (!raw) return null;

    const parsed = JSON.parse(raw);

    return parsed?.user || parsed;
  } catch {
    return null;
  }
};
import axios from "axios";


const BASE = import.meta.env.VITE_API_BASE_URL; 

const api = axios.create({
  baseURL: `${BASE}/api`,
  withCredentials: true,
});

const getToken = () => {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("userToken") ||
    localStorage.getItem("adminToken") ||
    ""
  );
};

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const toFormData = (payload = {}) => {
  const formData = new FormData();

  Object.entries(payload || {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value) || typeof value === "object") {
      formData.append(key, JSON.stringify(value));
      return;
    }

    formData.append(key, String(value));
  });

  return formData;
};

const normalizeResponse = (response) => {
  const body = response?.data;

  if (body?.data !== undefined) return body;

  return {
    success: true,
    status: true,
    message: body?.message || body?.msg || "Request successful",
    data: body,
  };
};

export const copyTradingApi = {
  getMeUser: async () => {
    const res = await api.get("/user/logger-info");
    return normalizeResponse(res);
  },

  // USER ROUTES
  userGetMasters: async () => {
    const res = await api.get("/user/copy-trading/masters");
    return normalizeResponse(res);
  },

  userGetMasterDetails: async (MT5Account) => {
    const res = await api.get("/user/copy-trading/master-details", {
      params: { MT5Account },
    });
    return normalizeResponse(res);
  },

  userGetCopierDetails: async ({ MT5Account, Manager_Index = 1 }) => {
    const res = await api.get("/user/copy-trading/copier-details", {
      params: { MT5Account, Manager_Index },
    });
    return normalizeResponse(res);
  },

  userDashboard: async ({ MT5Account, Manager_Index = 1 }) => {
    const res = await api.post(
      "/user/copy-trading/dashboard",
      toFormData({ MT5Account, Manager_Index })
    );
    return normalizeResponse(res);
  },

  userMyMasters: async ({ userId }) => {
    const res = await api.post(
      "/user/copy-trading/my-masters",
      toFormData({ userId })
    );
    return normalizeResponse(res);
  },

  userStartCopy: async ({
    userId,
    mt5Account,
    masterAccount,
    min_invest = 0,
  }) => {
    const res = await api.post(
      "/user/copy-trading/start-copy",
      toFormData({
        userId,
        mt5Account,
        masterAccount,
        min_invest,
      })
    );
    return normalizeResponse(res);
  },

  userStopCopy: async ({ mt5Account }) => {
    const res = await api.post(
      "/user/copy-trading/stop-copy",
      toFormData({ mt5Account })
    );
    return normalizeResponse(res);
  },

  userTrades: async ({ userId, masterAccount, page = 1, page_size = 10 }) => {
    const res = await api.post(
      "/user/copy-trading/trades",
      toFormData({ userId, masterAccount, page, page_size })
    );
    return normalizeResponse(res);
  },

  userOpenTrades: async ({
    userId,
    masterAccount,
    page = 1,
    page_size = 10,
  }) => {
    const res = await api.post(
      "/user/copy-trading/open-trades",
      toFormData({ userId, masterAccount, page, page_size })
    );
    return normalizeResponse(res);
  },

  userClosedTrades: async ({
    userId,
    masterAccount,
    page = 1,
    page_size = 10,
  }) => {
    const res = await api.post(
      "/user/copy-trading/closed-trades",
      toFormData({ userId, masterAccount, page, page_size })
    );
    return normalizeResponse(res);
  },

  // ADMIN ROUTES
  adminGetCopyUsers: async () => {
    const res = await api.get("/admin/copy-trading/copy-users");
    return normalizeResponse(res);
  },

  adminGetMasters: async () => {
    const res = await api.get("/admin/copy-trading/masters");
    return normalizeResponse(res);
  },

  adminGetServers: async () => {
    const res = await api.get("/admin/copy-trading/servers");
    return normalizeResponse(res);
  },

  adminGetMasterDetails: async (MT5Account) => {
    const res = await api.get("/admin/copy-trading/master-details", {
      params: { MT5Account },
    });
    return normalizeResponse(res);
  },

  adminGetCopierDetails: async ({ MT5Account, Manager_Index = 1 }) => {
    const res = await api.get("/admin/copy-trading/copier-details", {
      params: { MT5Account, Manager_Index },
    });
    return normalizeResponse(res);
  },

  adminDashboard: async ({ userId }) => {
    const res = await api.post(
      "/admin/copy-trading/dashboard",
      toFormData({ userId })
    );
    return normalizeResponse(res);
  },

  adminAddMaster: async ({ userId, mt5Account }) => {
    const res = await api.post(
      "/admin/copy-trading/add-master",
      toFormData({ userId, mt5Account })
    );
    return normalizeResponse(res);
  },

  adminUpdateMaster: async ({
    masterAccount,
    commission,
    nickname,
    min_invest,
    description,
    chat_link,
  }) => {
    const res = await api.post("/admin/copy-trading/update-master", {
      masterAccount: Number(masterAccount),
      commission: Number(commission || 0),
      nickname,
      min_invest: Number(min_invest || 0),
      description,
      chat_link,
    });

    return normalizeResponse(res);
  },

  adminDeleteMaster: async ({ masterAccount }) => {
    const res = await api.post(
      "/admin/copy-trading/delete-master",
      toFormData({
        masterccount: masterAccount,
        masterAccount,
      })
    );
    return normalizeResponse(res);
  },

  adminLinkCopier: async ({ userId, mt5Account, masterAccount }) => {
    const res = await api.post(
      "/admin/copy-trading/link-copier",
      toFormData({ userId, mt5Account, masterAccount })
    );
    return normalizeResponse(res);
  },

  adminLinkCopierWithBalanceCheck: async ({
    userId,
    mt5Account,
    masterAccount,
    min_invest = 0,
  }) => {
    const res = await api.post(
      "/admin/copy-trading/link-copier-with-balance-check",
      toFormData({ userId, mt5Account, masterAccount, min_invest })
    );
    return normalizeResponse(res);
  },

  adminDeleteCopier: async ({ mt5Account }) => {
    const res = await api.post(
      "/admin/copy-trading/delete-copier",
      toFormData({ mt5Account })
    );
    return normalizeResponse(res);
  },

  adminCopiersDetails: async ({ copiers = [] }) => {
    const res = await api.post("/admin/copy-trading/copiers-details", {
      copiers,
    });
    return normalizeResponse(res);
  },

  adminTradesPage: async ({
    userId,
    masterAccount,
    page = 1,
    page_size = 10,
  }) => {
    const res = await api.post(
      "/admin/copy-trading/trades-page",
      toFormData({ userId, masterAccount, page, page_size })
    );
    return normalizeResponse(res);
  },

  adminMasterTrades: async ({
    userId,
    masterAccount,
    page = 1,
    page_size = 10,
  }) => {
    const res = await api.post("/admin/copy-trading/master-trades", {
      userId,
      masterAccount,
      page,
      page_size,
    });
    return normalizeResponse(res);
  },

  adminOpenTrades: async ({
    userId,
    masterAccount,
    page = 1,
    page_size = 10,
  }) => {
    const res = await api.post(
      "/admin/copy-trading/open-trades",
      toFormData({ userId, masterAccount, page, page_size })
    );
    return normalizeResponse(res);
  },

  adminClosedTrades: async ({
    userId,
    masterAccount,
    page = 1,
    page_size = 10,
  }) => {
    const res = await api.post(
      "/admin/copy-trading/closed-trades",
      toFormData({ userId, masterAccount, page, page_size })
    );
    return normalizeResponse(res);
  },
};
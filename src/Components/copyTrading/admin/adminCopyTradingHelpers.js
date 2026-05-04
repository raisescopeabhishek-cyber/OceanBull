export const safeArray = (input) => {
  if (Array.isArray(input)) return input;

  if (Array.isArray(input?.data)) return input.data;
  if (Array.isArray(input?.data?.data)) return input.data.data;
  if (Array.isArray(input?.data?.masters)) return input.data.masters;
  if (Array.isArray(input?.data?.masterAccounts)) return input.data.masterAccounts;
  if (Array.isArray(input?.data?.copiers)) return input.data.copiers;
  if (Array.isArray(input?.data?.copyUsers)) return input.data.copyUsers;
  if (Array.isArray(input?.data?.rows)) return input.data.rows;
  if (Array.isArray(input?.masters)) return input.masters;
  if (Array.isArray(input?.masterAccounts)) return input.masterAccounts;
  if (Array.isArray(input?.copiers)) return input.copiers;
  if (Array.isArray(input?.copyUsers)) return input.copyUsers;
  if (Array.isArray(input?.rows)) return input.rows;
  if (Array.isArray(input?.results)) return input.results;

  return [];
};

export const valueOf = (obj, keys = [], fallback = "-") => {
  for (const key of keys) {
    const value = obj?.[key];

    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return fallback;
};

export const pickLogin = (row) => {
  return String(
    valueOf(
      row,
      [
        "login",
        "Login",
        "account",
        "Account",
        "mt5Account",
        "MT5Account",
        "masterAccount",
        "copierAccount",
      ],
      ""
    )
  );
};

export const pickMasterLogin = (row) => {
  return String(
    valueOf(
      row,
      [
        "masterAccount",
        "master_login",
        "masterLogin",
        "master",
        "MasterAccount",
        "masterMT5Account",
        "master_mt5_account",
      ],
      ""
    )
  );
};

export const pickCopierLogin = (row) => {
  return String(
    valueOf(
      row,
      [
        "copierAccount",
        "copier_login",
        "copierLogin",
        "login",
        "Login",
        "account",
        "mt5Account",
        "MT5Account",
      ],
      ""
    )
  );
};

export const parseTimestamp = (value) => {
  if (!value) return 0;

  if (value instanceof Date) {
    const time = value.getTime();
    return Number.isNaN(time) ? 0 : time;
  }

  if (typeof value === "number") {
    const time = value < 10000000000 ? value * 1000 : value;
    const date = new Date(time);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
  }

  const clean = String(value).trim();

  if (!clean) return 0;

  if (/^\d+$/.test(clean)) {
    const numberValue = Number(clean);
    const time = numberValue < 10000000000 ? numberValue * 1000 : numberValue;
    const date = new Date(time);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
  }

  const normalized = clean.includes("T") ? clean : clean.replace(" ", "T");
  const date = new Date(normalized);

  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
};

export const pickCreatedTime = (row) => {
  const candidates = [
    row?.created_at,
    row?.createdAt,
    row?.CreatedAt,
    row?.created_date,
    row?.createdDate,
    row?.updated_at,
    row?.updatedAt,
    row?.UpdatedAt,
  ];

  for (const item of candidates) {
    const timestamp = parseTimestamp(item);
    if (timestamp) return timestamp;
  }

  return 0;
};

export const formatDate = (value) => {
  const time = parseTimestamp(value);

  if (!time) return "-";

  return new Date(time).toLocaleString();
};

export const formatAgo = (value) => {
  const time = typeof value === "number" ? value : parseTimestamp(value);

  if (!time) return "-";

  const diffMs = Date.now() - time;

  if (diffMs < 0) return "Just now";

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hr ago`;
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;

  return `${years} year${years > 1 ? "s" : ""} ago`;
};

export const money = (value) => {
  const number = Number(value || 0);

  return `$${number.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};
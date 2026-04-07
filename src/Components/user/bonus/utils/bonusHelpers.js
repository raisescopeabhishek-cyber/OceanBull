// Components/user/bonus/utils/bonusHelpers.js
export const formatCurrency = (value) => {
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

export const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

export const getStatusTone = (status) => {
  const s = String(status || "").toLowerCase();

  if (["success", "credited", "approved", "processed"].includes(s)) {
    return "success";
  }
  if (["failed", "rejected"].includes(s)) {
    return "danger";
  }
  if (["skipped", "pending"].includes(s)) {
    return "warning";
  }
  return "neutral";
};
export const getJwtPayload = (token) => {
  try {
    const base64 = token.split(".")[1];
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
};

export const isJwtValid = (token) => {
  const payload = getJwtPayload(token);
  if (!payload) return false;
  if (!payload.exp) return true; // if no exp, treat as valid
  return Date.now() < payload.exp * 1000;
};

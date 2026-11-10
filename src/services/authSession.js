const SESSION_KEYS = Object.freeze({
  token: "msspathway.auth.token",
  refreshToken: "msspathway.auth.refreshToken",
  role: "msspathway.auth.role",
  clientId: "msspathway.auth.clientId",
  userId: "msspathway.auth.userId",
  employeeId: "msspathway.auth.employeeId",
});

// Remove only authentication keys; preserve unrelated app data.
const LEGACY_KEYS = [
  "token",
  "accessToken",
  "authToken",
  "refresh_token",
  "refreshToken",
  "role",
  "client_id",
  "clientId",
  "user_id",
  "userId",
  "employee_id",
  "employeeId",
];

const getStorage = (storageName) => {
  try {
    return typeof window !== "undefined"
      ? window[storageName]
      : null;
  } catch {
    return null;
  }
};

const getSessionValue = (key) => {
  try {
    return getStorage("sessionStorage")?.getItem(key) ?? null;
  } catch {
    return null;
  }
};

export const getAccessToken = () =>
  getSessionValue(SESSION_KEYS.token);

export const getRefreshToken = () =>
  getSessionValue(SESSION_KEYS.refreshToken);

export const getUserRole = () =>
  getSessionValue(SESSION_KEYS.role);

export const getClientId = () =>
  getSessionValue(SESSION_KEYS.clientId);

export const getUserId = () =>
  getSessionValue(SESSION_KEYS.userId);

export const getEmployeeId = () =>
  getSessionValue(SESSION_KEYS.employeeId);

export const hasAuthSession = () =>
  Boolean(getAccessToken() && getUserRole());

export const clearAuthSession = () => {
  const sessionStorage = getStorage("sessionStorage");
  const localStorage = getStorage("localStorage");

  Object.values(SESSION_KEYS).forEach((key) => {
    try {
      sessionStorage?.removeItem(key);
    } catch {
      // Continue clearing other authentication values.
    }
  });

  LEGACY_KEYS.forEach((key) => {
    try {
      localStorage?.removeItem(key);
    } catch {
      // Continue clearing other authentication values.
    }
  });
};

export const createAuthSession = ({
  accessToken,
  refreshToken,
  role,
  clientId,
  userId,
  employeeId,
}) => {
  const storage = getStorage("sessionStorage");

  const normalizedRole =
    typeof role === "string" ? role.toLowerCase().trim() : "";

  if (!storage) {
    throw new Error("Browser session storage is unavailable.");
  }

  if (
    typeof accessToken !== "string" ||
    !accessToken.trim() ||
    !normalizedRole
  ) {
    throw new Error("Valid authentication details are required.");
  }

  clearAuthSession();

  const sessionData = {
    [SESSION_KEYS.token]: accessToken.trim(),
    [SESSION_KEYS.role]: normalizedRole,
    [SESSION_KEYS.refreshToken]: refreshToken,
    [SESSION_KEYS.clientId]: clientId,
    [SESSION_KEYS.userId]: userId,
    [SESSION_KEYS.employeeId]: employeeId,
  };

  try {
    Object.entries(sessionData).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        storage.setItem(key, String(value));
      }
    });
  } catch {
    clearAuthSession();
    throw new Error("Unable to establish the authentication session.");
  }
};

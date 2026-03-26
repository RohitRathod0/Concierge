const decodeJwtPayload = (token) => {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
};

export const clearAuthStorage = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const setToken = (token) => localStorage.setItem('token', token);

export const getToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  const payload = decodeJwtPayload(token);
  if (!payload?.exp) {
    clearAuthStorage();
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp <= now) {
    clearAuthStorage();
    return null;
  }

  return token;
};

export const removeToken = () => localStorage.removeItem('token');
export const setUserCache = (user) => localStorage.setItem('user', JSON.stringify(user));
export const getUserCache = () => {
  if (!getToken()) return null;

  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};
export const removeUserCache = () => localStorage.removeItem('user');

export const setToken = (token) => localStorage.setItem('token', token);
export const getToken = () => localStorage.getItem('token');
export const removeToken = () => localStorage.removeItem('token');
export const setUserCache = (user) => localStorage.setItem('user', JSON.stringify(user));
export const getUserCache = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};
export const removeUserCache = () => localStorage.removeItem('user');

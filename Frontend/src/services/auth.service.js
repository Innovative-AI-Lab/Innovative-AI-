import axios from '../config/axios';

const storeToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  }
};

const removeToken = () => {
  localStorage.removeItem('token');
};

export const login = async ({ email, password }) => {
  const res = await axios.post('/users/login', { email, password });
  const { token, user } = res.data;
  if (!token || !user) {
    throw new Error('Login response missing token or user');
  }
  storeToken(token);
  return { token, user };
};

export const register = async ({ displayName, email, password }) => {
  const res = await axios.post('/users/register', {
    displayName,
    email,
    password,
  });
  const { token, user } = res.data;
  if (!token || !user) {
    throw new Error('Register response missing token or user');
  }
  storeToken(token);
  return { token, user };
};

export const logout = async () => {
  try {
    await axios.get('/users/logout');
  } catch (err) {
    // server may already refuse token; proceed regardless
  }
  removeToken();
};

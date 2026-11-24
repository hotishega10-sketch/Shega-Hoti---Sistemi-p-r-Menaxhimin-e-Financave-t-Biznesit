import { api, tokenStore } from './api';

export async function login(email, password) {
  const data = await api('/auth/login', { method: 'POST', body: { email, password } });
  tokenStore.set(data.token);
  return data.user;
}

export const register = (business_name, email, password) =>
  api('/auth/register', { method: 'POST', body: { business_name, email, password } });

export const me = async () => (await api('/auth/me')).user;
export const logout = () => tokenStore.clear();

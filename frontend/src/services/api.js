// Të gjitha thirrjet drejt backend-it kalojnë këtu: një vend për token-in, gabimet dhe 401.
const BASE = '/api';
const TOKEN_KEY = 'financa_token';

export const tokenStore = {
  get() { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } },
  set(t) { try { localStorage.setItem(TOKEN_KEY, t); } catch { /* ignore */ } },
  clear() { try { localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ } },
};

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details || null;
  }
}

export async function api(path, { method = 'GET', body, params } = {}) {
  let url = BASE + path;
  if (params) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== '' && v !== undefined && v !== null) qs.set(k, v); });
    const s = qs.toString();
    if (s) url += `?${s}`;
  }
  const headers = {};
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new ApiError(0, 'Nuk u lidh me serverin. Kontrollo që backend-i është i ndezur.');
  }

  let data = null;
  try { data = await res.json(); } catch { /* përgjigje pa JSON */ }

  if (!res.ok) {
    // Token i skaduar ose i pavlefshëm: njofto aplikacionin që të kthehet te login.
    if (res.status === 401 && token) {
      tokenStore.clear();
      window.dispatchEvent(new Event('auth:expired'));
    }
    throw new ApiError(res.status, (data && data.message) || 'Ndodhi një gabim.', data && data.details);
  }
  return data;
}

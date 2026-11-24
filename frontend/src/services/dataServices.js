import { api } from './api';

export const dashboardService = {
  get: () => api('/dashboard').then((r) => r.data),
};

export const categoryService = {
  list: () => api('/categories').then((r) => r.data),
};

export const transactionService = {
  list: (params) => api('/transactions', { params }),
  create: (body) => api('/transactions', { method: 'POST', body }).then((r) => r.data),
  update: (id, body) => api(`/transactions/${id}`, { method: 'PATCH', body }).then((r) => r.data),
  remove: (id) => api(`/transactions/${id}`, { method: 'DELETE' }),
};

export const clientService = {
  list: (q) => api('/clients', { params: { q } }).then((r) => r.data),
  create: (body) => api('/clients', { method: 'POST', body }).then((r) => r.data),
  update: (id, body) => api(`/clients/${id}`, { method: 'PATCH', body }).then((r) => r.data),
  remove: (id) => api(`/clients/${id}`, { method: 'DELETE' }),
};

export const invoiceService = {
  list: (params) => api('/invoices', { params }).then((r) => r.data),
  get: (id) => api(`/invoices/${id}`).then((r) => r.data),
  create: (body) => api('/invoices', { method: 'POST', body }).then((r) => r.data),
  pay: (id) => api(`/invoices/${id}/pay`, { method: 'PATCH' }).then((r) => r.data),
  remove: (id) => api(`/invoices/${id}`, { method: 'DELETE' }),
};

const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(`Respuesta no JSON desde ${API_BASE}${path}`);
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Error ${res.status}`);
  }
  return data;
}

export const api = {
  auth: {
    register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    me: () => request('/auth/me'),
  },
  monitors: {
    list: (params) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/monitors?${qs}`);
    },
    get: (id) => request(`/monitors/${id}`),
    create: (data) => request('/monitors', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/monitors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    pause: (id) => request(`/monitors/${id}/pause`, { method: 'POST' }),
    activate: (id) => request(`/monitors/${id}/activate`, { method: 'POST' }),
    delete: (id) => request(`/monitors/${id}`, { method: 'DELETE' }),
  },
  checks: {
    list: (id, params) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/monitors/${id}/checks?${qs}`);
    },
    latest: (id) => request(`/monitors/${id}/checks/latest`),
    stats: () => request('/monitors/stats'),
  },
  history: {
    list: (id) => request(`/history/${id}`),
  },
  alerts: {
    list: (params) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/alerts?${qs}`);
    },
    stats: () => request('/alerts/stats'),
    markRead: (id) => request(`/alerts/${id}/read`, { method: 'POST' }),
    markAllRead: () => request('/alerts/read-all', { method: 'POST' }),
    close: (id) => request(`/alerts/${id}/close`, { method: 'POST' }),
  },
  alertRules: {
    list: () => request('/alert-rules'),
    create: (data) => request('/alert-rules', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/alert-rules/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/alert-rules/${id}`, { method: 'DELETE' }),
  },
  users: {
    list: () => request('/users'),
    create: (data) => request('/users', { method: 'POST', body: JSON.stringify(data) }),
  },
};

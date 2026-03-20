const API_BASE = 'http://localhost:5000/api';

export async function apiFetch(endpoint, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
}

// Module API
export const modulesApi = {
  getAll: () => apiFetch('/modules'),
  create: (data) => apiFetch('/modules', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/modules/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiFetch(`/modules/${id}`, { method: 'DELETE' }),
};

// Assignment API
export const assignmentsApi = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.module) params.set('module', filters.module);
    if (filters.status) params.set('status', filters.status);
    const query = params.toString();
    return apiFetch(`/assignments${query ? `?${query}` : ''}`);
  },
  create: (data) => apiFetch('/assignments', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/assignments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiFetch(`/assignments/${id}`, { method: 'DELETE' }),
};

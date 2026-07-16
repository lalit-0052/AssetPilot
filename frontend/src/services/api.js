const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://odoohackathon-2026-assetflow.onrender.com/api'

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(data?.message || 'Request failed')
  }
  return data
}

const scopedPath = (path, user) => {
  if (!user?.organization) return path
  const separator = path.includes('?') ? '&' : '?'
  return `${path}${separator}organization=${encodeURIComponent(user.organization)}`
}

export const api = {
  login: (payload) => request('/login', { method: 'POST', body: JSON.stringify(payload) }),
  createEmployeeAccount: (payload) => request('/employee/signup', { method: 'POST', body: JSON.stringify(payload) }),
  getDashboard: (user) => request(scopedPath('/dashboard', user)),
  getOrganization: (user) => request(scopedPath('/organization', user)),
  getAssets: (user) => request(scopedPath('/assets', user)),
  getBookings: (user) => request(scopedPath('/bookings', user)),
  getMaintenance: (user) => request(scopedPath('/maintenance', user)),
  getAudits: (user) => request(scopedPath('/audits', user)),
  getReports: (user) => request(scopedPath('/reports', user)),
  getNotifications: (audience = 'Admin', user) => {
    const params = new URLSearchParams({ audience })
    if (user?.email) params.set('recipientEmail', user.email)
    if (user?.name) params.set('recipientName', user.name)
    if (user?.organization) params.set('organization', user.organization)
    return request(`/notifications?${params.toString()}`)
  },

  createDepartment: (payload) => request('/departments', { method: 'POST', body: JSON.stringify(payload) }),
  deleteDepartment: (id) => request(`/departments/${id}`, { method: 'DELETE' }),

  createCategory: (payload) => request('/categories', { method: 'POST', body: JSON.stringify(payload) }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE' }),

  createEmployee: (payload) => request('/employees', { method: 'POST', body: JSON.stringify(payload) }),
  deleteEmployee: (id) => request(`/employees/${id}`, { method: 'DELETE' }),

  createAsset: (payload) => request('/assets', { method: 'POST', body: JSON.stringify(payload) }),
  deleteAsset: (id) => request(`/assets/${id}`, { method: 'DELETE' }),
  allocateAsset: (id, payload) => request(`/assets/${id}/allocate`, { method: 'POST', body: JSON.stringify(payload) }),

  createBooking: (payload) => request('/bookings', { method: 'POST', body: JSON.stringify(payload) }),
  updateBooking: (id, payload) => request(`/bookings/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteBooking: (id) => request(`/bookings/${id}`, { method: 'DELETE' }),

  createMaintenance: (payload) => request('/maintenance', { method: 'POST', body: JSON.stringify(payload) }),
  updateMaintenance: (id, payload) => request(`/maintenance/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteMaintenance: (id) => request(`/maintenance/${id}`, { method: 'DELETE' }),

  createAudit: (payload) => request('/audits', { method: 'POST', body: JSON.stringify(payload) }),
  updateAudit: (id, payload) => request(`/audits/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteAudit: (id) => request(`/audits/${id}`, { method: 'DELETE' }),

  createNotification: (payload) => request('/notifications', { method: 'POST', body: JSON.stringify(payload) }),
  deleteNotification: (id) => request(`/notifications/${id}`, { method: 'DELETE' }),
}
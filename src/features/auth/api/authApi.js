import { apiRequest } from '../../../helpers/apiHelper.js'

// API autentikasi: login, register, logout, profil.

export async function login(username, password) {
  const res = await apiRequest('/api/auth/login', { method: 'POST', body: { username, password } })
  return res.data
}

export async function register({ name, username, email, password }) {
  const res = await apiRequest('/api/auth/register', { method: 'POST', body: { name, username, email, password } })
  return res.data
}

export async function logout() {
  await apiRequest('/api/auth/logout', { method: 'POST' })
}

export async function getProfile() {
  const res = await apiRequest('/api/auth/profile')
  return res.data
}

export async function updateProfile(payload) {
  const res = await apiRequest('/api/auth/profile', { method: 'PUT', body: payload })
  return res.data
}

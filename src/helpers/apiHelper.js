// Wrapper fetch terpusat: menyuntikkan header Authorization Bearer token dan
// mengurai respons JSON standar {status, message, data?} dari backend.

const TOKEN_KEY = 'delcom_blog_token'
const USER_KEY = 'delcom_blog_user'

// Event global yang dikirim saat token tidak lagi valid (401).
export const UNAUTHORIZED_EVENT = 'delcom:unauthorized'

// Base URL backend. Kosong = relatif (/api di-proxy Vite saat development).
// Untuk deploy terpisah (Vercel/Netlify), isi VITE_API_BASE_URL=https://api.domain.com
export function getBaseUrl() {
  return (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY))
  } catch {
    return null
  }
}

export function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function updateStoredUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// Mengirim request ke backend. Mengembalikan body JSON ({status, message, data}).
export async function apiRequest(path, options = {}) {
  const { method = 'GET', body } = options
  const headers = { Accept: 'application/json' }
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  const token = getToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let response
  try {
    response = await fetch(`${getBaseUrl()}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError('Tidak dapat terhubung ke server. Periksa koneksi Anda.', 0)
  }

  let json = null
  try {
    json = await response.json()
  } catch {
    json = null
  }

  if (!response.ok || json?.status !== 'success') {
    if (response.status === 401 && token) {
      window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT))
    }
    throw new ApiError(json?.message || `Permintaan gagal (HTTP ${response.status})`, response.status)
  }
  return json
}

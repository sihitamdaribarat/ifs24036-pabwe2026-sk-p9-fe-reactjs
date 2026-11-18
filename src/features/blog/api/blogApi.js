import { apiRequest } from '../../../helpers/apiHelper.js'

// API artikel: publik, CRUD penulis, statistik, dan AI generator.

// Kategori artikel (sama dengan backend /api/public/categories).
export const CATEGORIES = ['Teknologi', 'Pendidikan', 'Gaya Hidup', 'Bisnis', 'Opini', 'Umum']

export function buildQuery(params = {}) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value) search.set(key, value)
  })
  const query = search.toString()
  return query ? `?${query}` : ''
}

export async function getCategories() {
  const res = await apiRequest('/api/public/categories')
  return res.data
}

export async function getPublicPosts({ q, category } = {}) {
  const res = await apiRequest(`/api/public/posts${buildQuery({ q, category })}`)
  return res.data
}

export async function getPublicPost(slug) {
  const res = await apiRequest(`/api/public/posts/${encodeURIComponent(slug)}`)
  return res.data
}

export async function getMyPosts({ q, category } = {}) {
  const res = await apiRequest(`/api/posts${buildQuery({ q, category })}`)
  return res.data
}

export async function getMyStats() {
  const res = await apiRequest('/api/posts/stats')
  return res.data
}

export async function getMyPost(id) {
  const res = await apiRequest(`/api/posts/${id}`)
  return res.data
}

export async function createPost(payload) {
  const res = await apiRequest('/api/posts', { method: 'POST', body: payload })
  return res.data
}

export async function updatePost(id, payload) {
  const res = await apiRequest(`/api/posts/${id}`, { method: 'PUT', body: payload })
  return res.data
}

export async function togglePublish(id) {
  const res = await apiRequest(`/api/posts/${id}/toggle-publish`, { method: 'PATCH' })
  return res.data
}

export async function deletePost(id) {
  await apiRequest(`/api/posts/${id}`, { method: 'DELETE' })
}

export async function generateAiPost({ topic, category, tone, includeWebSearch }) {
  const res = await apiRequest('/api/posts/ai-generate', {
    method: 'POST',
    body: { topic, category, tone, include_web_search: includeWebSearch },
  })
  return res.data
}

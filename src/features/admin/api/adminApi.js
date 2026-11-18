import { apiRequest } from '../../../helpers/apiHelper.js'

// API monitoring admin: seluruh pengguna & artikel.

export async function getUsers() {
  const res = await apiRequest('/api/admin/users')
  return res.data
}

export async function getAllPosts() {
  const res = await apiRequest('/api/admin/posts')
  return res.data
}

export async function getUserPosts(userId) {
  const res = await apiRequest(`/api/admin/users/${userId}/posts`)
  return res.data
}

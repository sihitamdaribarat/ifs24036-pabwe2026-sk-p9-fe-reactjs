import { apiRequest } from '../../../helpers/apiHelper.js'
import {
  CATEGORIES,
  buildQuery,
  createPost,
  deletePost,
  generateAiPost,
  getCategories,
  getMyPost,
  getMyPosts,
  getMyStats,
  getPublicPost,
  getPublicPosts,
  togglePublish,
  updatePost,
} from './blogApi.js'

vi.mock('../../../helpers/apiHelper.js', () => ({ apiRequest: vi.fn() }))

describe('blogApi', () => {
  beforeEach(() => {
    apiRequest.mockResolvedValue({ status: 'success', data: 'DATA' })
  })

  it('buildQuery mengabaikan nilai kosong', () => {
    expect(buildQuery()).toBe('')
    expect(buildQuery({ q: '', category: undefined })).toBe('')
    expect(buildQuery({ q: 'go lang', category: 'Gaya Hidup' })).toBe('?q=go+lang&category=Gaya+Hidup')
  })

  it('memiliki 6 kategori', () => {
    expect(CATEGORIES).toHaveLength(6)
  })

  it('endpoint publik', async () => {
    await expect(getCategories()).resolves.toBe('DATA')
    expect(apiRequest).toHaveBeenLastCalledWith('/api/public/categories')

    await getPublicPosts()
    expect(apiRequest).toHaveBeenLastCalledWith('/api/public/posts')
    await getPublicPosts({ q: 'ai', category: 'Opini' })
    expect(apiRequest).toHaveBeenLastCalledWith('/api/public/posts?q=ai&category=Opini')

    await getPublicPost('halo dunia')
    expect(apiRequest).toHaveBeenLastCalledWith('/api/public/posts/halo%20dunia')
  })

  it('endpoint penulis', async () => {
    await getMyPosts()
    expect(apiRequest).toHaveBeenLastCalledWith('/api/posts')
    await getMyPosts({ q: 'x' })
    expect(apiRequest).toHaveBeenLastCalledWith('/api/posts?q=x')
    await getMyStats()
    expect(apiRequest).toHaveBeenLastCalledWith('/api/posts/stats')
    await getMyPost(3)
    expect(apiRequest).toHaveBeenLastCalledWith('/api/posts/3')
    await createPost({ title: 'T' })
    expect(apiRequest).toHaveBeenLastCalledWith('/api/posts', { method: 'POST', body: { title: 'T' } })
    await updatePost(3, { title: 'U' })
    expect(apiRequest).toHaveBeenLastCalledWith('/api/posts/3', { method: 'PUT', body: { title: 'U' } })
    await togglePublish(3)
    expect(apiRequest).toHaveBeenLastCalledWith('/api/posts/3/toggle-publish', { method: 'PATCH' })
    await expect(deletePost(3)).resolves.toBeUndefined()
    expect(apiRequest).toHaveBeenLastCalledWith('/api/posts/3', { method: 'DELETE' })
  })

  it('AI generator', async () => {
    await generateAiPost({ topic: 'AI', category: 'Teknologi', tone: 'santai', includeWebSearch: true })
    expect(apiRequest).toHaveBeenLastCalledWith('/api/posts/ai-generate', {
      method: 'POST',
      body: { topic: 'AI', category: 'Teknologi', tone: 'santai', include_web_search: true },
    })
  })
})

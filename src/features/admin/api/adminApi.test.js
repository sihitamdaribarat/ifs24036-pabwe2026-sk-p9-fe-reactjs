import { apiRequest } from '../../../helpers/apiHelper.js'
import { getAllPosts, getUserPosts, getUsers } from './adminApi.js'

vi.mock('../../../helpers/apiHelper.js', () => ({ apiRequest: vi.fn() }))

describe('adminApi', () => {
  it('memanggil endpoint admin', async () => {
    apiRequest.mockResolvedValue({ status: 'success', data: ['x'] })

    await expect(getUsers()).resolves.toEqual(['x'])
    expect(apiRequest).toHaveBeenLastCalledWith('/api/admin/users')
    await getAllPosts()
    expect(apiRequest).toHaveBeenLastCalledWith('/api/admin/posts')
    await getUserPosts(5)
    expect(apiRequest).toHaveBeenLastCalledWith('/api/admin/users/5/posts')
  })
})

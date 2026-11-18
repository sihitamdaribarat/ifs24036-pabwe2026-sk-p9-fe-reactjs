import { apiRequest } from '../../../helpers/apiHelper.js'
import { getProfile, login, logout, register, updateProfile } from './authApi.js'

vi.mock('../../../helpers/apiHelper.js', () => ({ apiRequest: vi.fn() }))

describe('authApi', () => {
  beforeEach(() => {
    apiRequest.mockResolvedValue({ status: 'success', data: { ok: true } })
  })

  it('login', async () => {
    await expect(login('budi', 'rahasia')).resolves.toEqual({ ok: true })
    expect(apiRequest).toHaveBeenCalledWith('/api/auth/login', { method: 'POST', body: { username: 'budi', password: 'rahasia' } })
  })

  it('register', async () => {
    const payload = { name: 'Budi', username: 'budi', email: 'b@x.com', password: 'secret1' }
    await register(payload)
    expect(apiRequest).toHaveBeenCalledWith('/api/auth/register', { method: 'POST', body: payload })
  })

  it('logout', async () => {
    await logout()
    expect(apiRequest).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' })
  })

  it('getProfile & updateProfile', async () => {
    await getProfile()
    expect(apiRequest).toHaveBeenCalledWith('/api/auth/profile')
    await updateProfile({ name: 'B' })
    expect(apiRequest).toHaveBeenCalledWith('/api/auth/profile', { method: 'PUT', body: { name: 'B' } })
  })
})

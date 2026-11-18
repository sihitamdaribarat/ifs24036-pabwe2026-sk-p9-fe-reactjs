import {
  ApiError,
  UNAUTHORIZED_EVENT,
  apiRequest,
  clearSession,
  getBaseUrl,
  getStoredUser,
  getToken,
  saveSession,
  updateStoredUser,
} from './apiHelper.js'

function mockFetch(status, body, { invalidJson = false } = {}) {
  const json = invalidJson ? vi.fn().mockRejectedValue(new Error('bad json')) : vi.fn().mockResolvedValue(body)
  const fetchMock = vi.fn().mockResolvedValue({ ok: status >= 200 && status < 300, status, json })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('session helpers', () => {
  it('menyimpan, membaca dan menghapus sesi', () => {
    expect(getToken()).toBeNull()
    expect(getStoredUser()).toBeNull()

    saveSession('tok', { id: 1, name: 'Budi' })
    expect(getToken()).toBe('tok')
    expect(getStoredUser()).toEqual({ id: 1, name: 'Budi' })

    updateStoredUser({ id: 1, name: 'Budi Baru' })
    expect(getStoredUser().name).toBe('Budi Baru')

    clearSession()
    expect(getToken()).toBeNull()
    expect(getStoredUser()).toBeNull()
  })

  it('mengembalikan null jika data user rusak', () => {
    localStorage.setItem('delcom_blog_user', '{rusak')
    expect(getStoredUser()).toBeNull()
  })
})

describe('getBaseUrl', () => {
  it('kosong secara default dan menghapus slash di akhir', () => {
    vi.stubEnv('VITE_API_BASE_URL', '')
    expect(getBaseUrl()).toBe('')
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com//')
    expect(getBaseUrl()).toBe('https://api.example.com')
  })
})

describe('apiRequest', () => {
  it('melakukan GET tanpa token dan body', async () => {
    const fetchMock = mockFetch(200, { status: 'success', message: 'ok', data: [1] })
    const res = await apiRequest('/api/public/posts')

    expect(res.data).toEqual([1])
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/public/posts')
    expect(init.method).toBe('GET')
    expect(init.body).toBeUndefined()
    expect(init.headers.Authorization).toBeUndefined()
    expect(init.headers['Content-Type']).toBeUndefined()
  })

  it('menyuntikkan bearer token dan body JSON', async () => {
    saveSession('abc', { id: 1 })
    vi.stubEnv('VITE_API_BASE_URL', 'http://api.local')
    const fetchMock = mockFetch(201, { status: 'success', message: 'created', data: { id: 9 } })

    await apiRequest('/api/posts', { method: 'POST', body: { title: 'T' } })
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('http://api.local/api/posts')
    expect(init.headers.Authorization).toBe('Bearer abc')
    expect(init.headers['Content-Type']).toBe('application/json')
    expect(init.body).toBe(JSON.stringify({ title: 'T' }))
  })

  it('melempar ApiError saat jaringan gagal', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    await expect(apiRequest('/api/x')).rejects.toMatchObject({ name: 'ApiError', status: 0 })
  })

  it('memakai pesan dari backend saat gagal', async () => {
    mockFetch(404, { status: 'fail', message: 'Endpoint not found' })
    const err = await apiRequest('/api/x').catch((e) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect(err.message).toBe('Endpoint not found')
    expect(err.status).toBe(404)
  })

  it('memakai pesan fallback saat respons bukan JSON', async () => {
    mockFetch(500, null, { invalidJson: true })
    await expect(apiRequest('/api/x')).rejects.toThrow('Permintaan gagal (HTTP 500)')
  })

  it('menolak respons 200 dengan status bukan success', async () => {
    mockFetch(200, { status: 'fail', message: 'aneh' })
    await expect(apiRequest('/api/x')).rejects.toThrow('aneh')
  })

  it('mengirim event unauthorized hanya jika 401 dan token ada', async () => {
    const listener = vi.fn()
    window.addEventListener(UNAUTHORIZED_EVENT, listener)

    mockFetch(401, { status: 'fail', message: 'Token tidak valid' })
    await expect(apiRequest('/api/auth/login')).rejects.toThrow('Token tidak valid')
    expect(listener).not.toHaveBeenCalled()

    saveSession('expired', { id: 1 })
    await expect(apiRequest('/api/posts')).rejects.toThrow()
    expect(listener).toHaveBeenCalledTimes(1)

    mockFetch(403, { status: 'fail', message: 'Forbidden' })
    await expect(apiRequest('/api/admin/users')).rejects.toThrow('Forbidden')
    expect(listener).toHaveBeenCalledTimes(1)

    window.removeEventListener(UNAUTHORIZED_EVENT, listener)
  })
})

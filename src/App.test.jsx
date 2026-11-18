import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App.jsx'
import { logout } from './features/auth/api/authApi.js'
import { UNAUTHORIZED_EVENT, getStoredUser, getToken, saveSession } from './helpers/apiHelper.js'
import { showError, showSuccess } from './helpers/toolsHelper.js'

vi.mock('./features/auth/api/authApi.js', () => ({ logout: vi.fn() }))
vi.mock('./helpers/toolsHelper.js', async (importOriginal) => ({
  ...(await importOriginal()),
  showError: vi.fn(),
  showSuccess: vi.fn(),
}))

const MEMBER = { id: 2, name: 'Budi', role: 'member' }
const ADMIN = { id: 1, name: 'Admin', role: 'admin' }

vi.mock('./features/blog/components/PublicArticleList.jsx', () => ({
  default: ({ user, onNavigate }) => (
    <div>
      <p>page:home:{user ? user.name : 'guest'}</p>
      <button type="button" onClick={() => onNavigate('/posts/halo')}>
        stub-buka-artikel
      </button>
    </div>
  ),
}))
vi.mock('./features/blog/components/PublicArticleDetail.jsx', () => ({
  default: ({ slug }) => <p>page:detail:{slug}</p>,
}))
vi.mock('./features/blog/components/AuthorDashboard.jsx', () => ({
  default: ({ user, isDark }) => (
    <p>
      page:author:{user.name}:{String(isDark)}
    </p>
  ),
}))
vi.mock('./features/admin/components/AdminDashboard.jsx', () => ({
  default: () => <p>page:admin</p>,
}))
vi.mock('./features/auth/components/AuthPage.jsx', () => ({
  default: ({ mode, onLoginSuccess }) => (
    <div>
      <p>page:{mode}</p>
      <button type="button" onClick={() => onLoginSuccess({ token: 'tok-member', user: { id: 2, name: 'Budi', role: 'member' } })}>
        stub-login-member
      </button>
    </div>
  ),
}))
vi.mock('./features/auth/modals/AuthModal.jsx', () => ({
  default: ({ isOpen, onClose, onLoginSuccess }) =>
    isOpen ? (
      <div>
        <p>auth-modal</p>
        <button type="button" onClick={onClose}>
          stub-modal-tutup
        </button>
        <button type="button" onClick={() => onLoginSuccess({ token: 'tok-admin', user: { id: 1, name: 'Admin', role: 'admin' } })}>
          stub-modal-login
        </button>
      </div>
    ) : null,
}))

function renderAt(path, user = null) {
  window.history.replaceState({}, '', path)
  if (user) saveSession('tok', user)
  return render(<App />)
}

describe('App routing SPA', () => {
  it.each([
    ['/', 'page:home:guest'],
    ['/public', 'page:home:guest'],
    ['/posts/halo%20dunia', 'page:detail:halo dunia'],
    ['/login', 'page:login'],
    ['/register', 'page:register'],
  ])('rute %s', (path, text) => {
    renderAt(path)
    expect(screen.getByText(text)).toBeInTheDocument()
  })

  it('rute tidak dikenal menampilkan 404', async () => {
    const user = userEvent.setup()
    renderAt('/tidak-ada')
    expect(screen.getByText(/404/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Kembali ke Beranda' }))
    expect(screen.getByText('page:home:guest')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/')
  })

  it('navigasi pushState dan popstate', async () => {
    const user = userEvent.setup()
    renderAt('/')
    await user.click(screen.getByText('stub-buka-artikel'))
    expect(screen.getByText('page:detail:halo')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/posts/halo')
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0)

    act(() => {
      window.history.pushState({}, '', '/register')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(screen.getByText('page:register')).toBeInTheDocument()
  })
})

describe('App hak akses multi-tier', () => {
  it('workspace tanpa login diarahkan ke /login', async () => {
    renderAt('/author')
    expect(await screen.findByText('page:login')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/login')
  })

  it('penulis dapat membuka workspace (termasuk trailing slash)', () => {
    renderAt('/author/', MEMBER)
    expect(screen.getByText('page:author:Budi:false')).toBeInTheDocument()
  })

  it('penulis yang membuka /admin diarahkan ke /author', async () => {
    renderAt('/admin', MEMBER)
    expect(await screen.findByText(/page:author:Budi/)).toBeInTheDocument()
    expect(window.location.pathname).toBe('/author')
  })

  it('admin dapat membuka panel admin', () => {
    renderAt('/admin', ADMIN)
    expect(screen.getByText('page:admin')).toBeInTheDocument()
  })

  it('user yang sudah login diarahkan dari /login dan /register', async () => {
    const { unmount } = renderAt('/login', ADMIN)
    expect(await screen.findByText('page:admin')).toBeInTheDocument()
    unmount()

    renderAt('/register', MEMBER)
    expect(await screen.findByText(/page:author:Budi/)).toBeInTheDocument()
  })
})

describe('App sesi login', () => {
  it('login dari halaman login menyimpan sesi dan membuka workspace', async () => {
    const user = userEvent.setup()
    renderAt('/login')
    await user.click(screen.getByText('stub-login-member'))

    expect(await screen.findByText(/page:author:Budi/)).toBeInTheDocument()
    expect(getToken()).toBe('tok-member')
    expect(getStoredUser()).toEqual(MEMBER)
    expect(showSuccess).toHaveBeenCalledWith('Selamat datang, Budi!', 'Login Berhasil')
  })

  it('modal login dari navbar (admin diarahkan ke /admin)', async () => {
    const user = userEvent.setup()
    renderAt('/')

    await user.click(screen.getByRole('button', { name: /Masuk/ }))
    expect(screen.getByText('auth-modal')).toBeInTheDocument()
    await user.click(screen.getByText('stub-modal-tutup'))
    expect(screen.queryByText('auth-modal')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Masuk/ }))
    await user.click(screen.getByText('stub-modal-login'))
    expect(await screen.findByText('page:admin')).toBeInTheDocument()
    expect(screen.queryByText('auth-modal')).not.toBeInTheDocument()
  })

  it('modal login tidak tampil di halaman /login', async () => {
    const user = userEvent.setup()
    renderAt('/login')
    await user.click(screen.getByRole('button', { name: /Masuk/ }))
    expect(screen.queryByText('auth-modal')).not.toBeInTheDocument()
  })

  it('logout membersihkan sesi (termasuk saat API logout gagal)', async () => {
    const user = userEvent.setup()
    logout.mockResolvedValueOnce()
    const { unmount } = renderAt('/author', MEMBER)

    await user.click(screen.getByRole('button', { name: /Logout/ }))
    expect(await screen.findByText('page:home:guest')).toBeInTheDocument()
    expect(getToken()).toBeNull()
    expect(showSuccess).toHaveBeenCalledWith('Anda telah keluar dari akun.', 'Logout Berhasil')
    unmount()

    logout.mockRejectedValueOnce(new Error('token kedaluwarsa'))
    renderAt('/author', MEMBER)
    await user.click(screen.getByRole('button', { name: /Logout/ }))
    expect(await screen.findByText('page:home:guest')).toBeInTheDocument()
    expect(getStoredUser()).toBeNull()
  })

  it('event unauthorized (401) mengakhiri sesi', async () => {
    renderAt('/author', MEMBER)
    expect(screen.getByText(/page:author:Budi/)).toBeInTheDocument()

    act(() => {
      window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT))
    })

    await waitFor(() => expect(screen.getByText('page:login')).toBeInTheDocument())
    expect(getToken()).toBeNull()
    expect(showError).toHaveBeenCalledWith('Sesi Anda telah berakhir. Silakan login kembali.', 'Sesi Berakhir')
  })
})

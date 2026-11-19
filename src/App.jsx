import { Suspense, lazy, useCallback, useEffect, useState } from 'react'
import { IconLoader2, IconMapOff } from '@tabler/icons-react'
import StickyNavbar from './features/blog/components/StickyNavbar.jsx'
import PublicArticleList from './features/blog/components/PublicArticleList.jsx'
import AuthPage from './features/auth/components/AuthPage.jsx'
import AuthModal from './features/auth/modals/AuthModal.jsx'
import { logout } from './features/auth/api/authApi.js'
import { UNAUTHORIZED_EVENT, clearSession, getStoredUser, saveSession } from './helpers/apiHelper.js'
import { showError, showSuccess } from './helpers/toolsHelper.js'
import useTheme from './hooks/useTheme.js'

// Halaman berat (Toast UI Editor/Viewer) dimuat terpisah (code splitting) sehingga beranda
// tidak ikut mengunduh JS/CSS editor.
const PublicArticleDetail = lazy(() => import('./features/blog/components/PublicArticleDetail.jsx'))
const AuthorDashboard = lazy(() => import('./features/blog/components/AuthorDashboard.jsx'))
const AdminDashboard = lazy(() => import('./features/admin/components/AdminDashboard.jsx'))

const pageFallback = (
  <div className="flex justify-center py-24 text-slate-500 dark:text-slate-400" role="status">
    <IconLoader2 size={32} className="animate-spin" aria-hidden="true" />
    <span className="sr-only">Memuat halaman...</span>
  </div>
)

const STATIC_ROUTES = {
  '/': 'home',
  '/public': 'home',
  '/login': 'login',
  '/register': 'register',
  '/author': 'author',
  '/admin': 'admin',
}

// Mengubah pathname URL peramban menjadi rute SPA.
function parseRoute(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/'
  const detail = path.match(/^\/posts\/([^/]+)$/)
  if (detail) return { name: 'detail', slug: decodeURIComponent(detail[1]) }
  return { name: STATIC_ROUTES[path] ?? 'notfound' }
}

function dashboardPath(user) {
  return user.role === 'admin' ? '/admin' : '/author'
}

// Menentukan redirect berdasarkan hak akses (multi-tier: publik, penulis, admin).
function resolveRedirect(route, user) {
  const needsAuth = route.name === 'author' || route.name === 'admin'
  if (needsAuth && !user) return '/login'
  if (route.name === 'admin' && user.role !== 'admin') return '/author'
  if ((route.name === 'login' || route.name === 'register') && user) return dashboardPath(user)
  return null
}

function NotFound({ onNavigate }) {
  return (
    <div className="flex w-full flex-col items-center px-4 py-24 text-center">
      <IconMapOff size={56} className="mb-4 text-slate-400" />
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">404 — Halaman tidak ditemukan</h1>
      <p className="mb-6 mt-2 text-slate-500 dark:text-slate-400">Halaman yang Anda cari tidak tersedia.</p>
      <button type="button" onClick={() => onNavigate('/')} className="rounded-xl bg-accent-600 px-5 py-2.5 font-semibold text-white hover:bg-accent-700">
        Kembali ke Beranda
      </button>
    </div>
  )
}

// Komponen orkestrator: routing SPA (pushState + popstate), sesi login, tema.
export default function App() {
  const theme = useTheme()
  const [path, setPath] = useState(window.location.pathname)
  const [user, setUser] = useState(getStoredUser)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  const navigate = useCallback((to, replace = false) => {
    window.history[replace ? 'replaceState' : 'pushState']({}, '', to)
    setPath(to)
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname)
    const onUnauthorized = () => {
      clearSession()
      setUser(null)
      showError('Sesi Anda telah berakhir. Silakan login kembali.', 'Sesi Berakhir')
      navigate('/login', true)
    }
    window.addEventListener('popstate', onPopState)
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
    return () => {
      window.removeEventListener('popstate', onPopState)
      window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
    }
  }, [navigate])

  const route = parseRoute(path)
  const redirect = resolveRedirect(route, user)

  useEffect(() => {
    if (redirect) navigate(redirect, true)
  }, [redirect, navigate])

  function handleLoginSuccess({ token, user: loggedIn }) {
    saveSession(token, loggedIn)
    setUser(loggedIn)
    setAuthModalOpen(false)
    showSuccess(`Selamat datang, ${loggedIn.name}!`, 'Login Berhasil')
    navigate(dashboardPath(loggedIn))
  }

  async function handleLogout() {
    try {
      await logout()
    } catch {
      // Token mungkin sudah kedaluwarsa; sesi lokal tetap dibersihkan.
    }
    clearSession()
    setUser(null)
    showSuccess('Anda telah keluar dari akun.', 'Logout Berhasil')
    navigate('/')
  }

  const pages = {
    home: () => <PublicArticleList user={user} onNavigate={navigate} />,
    detail: () => <PublicArticleDetail key={route.slug} slug={route.slug} onNavigate={navigate} />,
    login: () => <AuthPage mode="login" onNavigate={navigate} onLoginSuccess={handleLoginSuccess} />,
    register: () => <AuthPage mode="register" onNavigate={navigate} onLoginSuccess={handleLoginSuccess} />,
    author: () => <AuthorDashboard user={user} onNavigate={navigate} isDark={theme.isDark} />,
    admin: () => <AdminDashboard onNavigate={navigate} />,
    notfound: () => <NotFound onNavigate={navigate} />,
  }

  return (
    <div className="flex min-h-screen flex-col">
      <StickyNavbar user={user} currentPath={path} onNavigate={navigate} onOpenLogin={() => setAuthModalOpen(true)} onLogout={handleLogout} theme={theme} />
      <main className="flex-1">
        <Suspense fallback={pageFallback}>{redirect ? null : pages[route.name]()}</Suspense>
      </main>
      <footer className="border-t border-slate-200 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
        © 2026 Delcom Blog — Platform publikasi artikel multi-tier dengan AI Blog Generator.
      </footer>
      <AuthModal
        isOpen={authModalOpen && route.name !== 'login'}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onNavigate={navigate}
      />
    </div>
  )
}

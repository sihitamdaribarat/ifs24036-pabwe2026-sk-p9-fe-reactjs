import {
  IconFeather,
  IconLayoutDashboard,
  IconLogin2,
  IconLogout,
  IconMoon,
  IconShieldLock,
  IconSun,
  IconUserPlus,
} from '@tabler/icons-react'
import { ACCENTS } from '../../../hooks/useTheme.js'
import { initials } from '../../../helpers/toolsHelper.js'

const ACCENT_SWATCH = {
  indigo: 'bg-indigo-500',
  emerald: 'bg-emerald-500',
  rose: 'bg-rose-500',
  amber: 'bg-amber-500',
}

function NavLink({ href, active, onNavigate, icon, children }) {
  return (
    <a
      href={href}
      onClick={(event) => {
        event.preventDefault()
        onNavigate(href)
      }}
      aria-label={children}
      aria-current={active ? 'page' : undefined}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
        active
          ? 'bg-accent-50 text-accent-700 dark:bg-accent-900/40 dark:text-accent-200'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{children}</span>
    </a>
  )
}

// Navbar atas sticky (tanpa sidebar) untuk navigasi cepat seluruh halaman.
export default function StickyNavbar({ user, currentPath, onNavigate, onOpenLogin, onLogout, theme }) {
  const isHome = currentPath === '/' || currentPath === '/public' || currentPath.startsWith('/posts/')

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-950/80">
      <nav className="flex h-16 w-full items-center justify-between gap-2 px-4 sm:px-6 lg:px-10" aria-label="Navigasi utama">
        <a
          href="/"
          aria-label="Delcom Blog"
          onClick={(event) => {
            event.preventDefault()
            onNavigate('/')
          }}
          className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-slate-900 dark:text-white"
        >
          <span aria-hidden="true" className="grid h-9 w-9 place-items-center rounded-xl bg-accent-600 text-white shadow-md shadow-accent-600/30">
            <IconFeather size={20} />
          </span>
          <span className="hidden md:inline">
            Delcom<span className="text-accent-600 dark:text-accent-400">Blog</span>
          </span>
        </a>

        <div className="flex items-center gap-1">
          <NavLink href="/" active={isHome} onNavigate={onNavigate} icon={<IconFeather size={18} />}>
            Beranda
          </NavLink>
          {user && (
            <NavLink href="/author" active={currentPath === '/author'} onNavigate={onNavigate} icon={<IconLayoutDashboard size={18} />}>
              Workspace
            </NavLink>
          )}
          {user?.role === 'admin' && (
            <NavLink href="/admin" active={currentPath === '/admin'} onNavigate={onNavigate} icon={<IconShieldLock size={18} />}>
              Admin
            </NavLink>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1 lg:flex" role="group" aria-label="Warna aksen">
            {ACCENTS.map((accent) => (
              <button
                key={accent}
                type="button"
                title={`Aksen ${accent}`}
                aria-label={`Aksen ${accent}`}
                aria-pressed={theme.accent === accent}
                onClick={() => theme.setAccent(accent)}
                className={`h-4 w-4 rounded-full ${ACCENT_SWATCH[accent]} ring-offset-2 ring-offset-white transition dark:ring-offset-slate-950 ${
                  theme.accent === accent ? 'ring-2 ring-slate-400' : 'opacity-70 hover:opacity-100'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={theme.toggleTheme}
            aria-label={theme.isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {theme.isDark ? <IconSun size={20} /> : <IconMoon size={20} />}
          </button>

          {user ? (
            <>
              <span className="hidden items-center gap-2 rounded-full border border-slate-200 py-1 pl-1 pr-3 text-sm dark:border-slate-700 sm:flex">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-accent-100 text-xs font-bold text-accent-700 dark:bg-accent-900 dark:text-accent-200">
                  {initials(user.name)}
                </span>
                <span className="max-w-[10rem] truncate font-medium text-slate-700 dark:text-slate-200">{user.name}</span>
              </span>
              <button
                type="button"
                onClick={onLogout}
                aria-label="Logout"
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50"
              >
                <IconLogout size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onOpenLogin}
                aria-label="Masuk"
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <IconLogin2 size={18} />
                <span className="hidden sm:inline">Masuk</span>
              </button>
              <a
                href="/register"
                aria-label="Daftar"
                onClick={(event) => {
                  event.preventDefault()
                  onNavigate('/register')
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-accent-700"
              >
                <IconUserPlus size={18} />
                <span className="hidden sm:inline">Daftar</span>
              </a>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

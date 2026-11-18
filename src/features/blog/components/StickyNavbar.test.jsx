import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StickyNavbar from './StickyNavbar.jsx'

function setup(props = {}) {
  const theme = { isDark: false, toggleTheme: vi.fn(), accent: 'indigo', setAccent: vi.fn(), ...props.theme }
  const handlers = { onNavigate: vi.fn(), onOpenLogin: vi.fn(), onLogout: vi.fn() }
  render(<StickyNavbar user={null} currentPath="/" {...handlers} {...props} theme={theme} />)
  return { ...handlers, theme }
}

describe('StickyNavbar', () => {
  it('tamu: tombol masuk, daftar, dan navigasi', async () => {
    const user = userEvent.setup()
    const { onNavigate, onOpenLogin } = setup()

    expect(screen.getByRole('link', { name: /Beranda/ })).toHaveAttribute('aria-current', 'page')
    expect(screen.queryByRole('link', { name: /Workspace/ })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Masuk/ }))
    expect(onOpenLogin).toHaveBeenCalled()

    await user.click(screen.getByRole('link', { name: /Daftar/ }))
    expect(onNavigate).toHaveBeenCalledWith('/register')

    await user.click(screen.getByRole('link', { name: /Beranda/ }))
    expect(onNavigate).toHaveBeenCalledWith('/')

    await user.click(screen.getByRole('link', { name: /DelcomBlog/ }))
    expect(onNavigate).toHaveBeenLastCalledWith('/')
  })

  it('penulis: workspace aktif dan logout', async () => {
    const user = userEvent.setup()
    const { onNavigate, onLogout } = setup({ user: { name: 'Budi Santoso', role: 'member' }, currentPath: '/author' })

    expect(screen.getByText('BS')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Workspace/ })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: /Beranda/ })).not.toHaveAttribute('aria-current')
    expect(screen.queryByRole('link', { name: /Admin/ })).not.toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: /Workspace/ }))
    expect(onNavigate).toHaveBeenCalledWith('/author')

    await user.click(screen.getByRole('button', { name: /Logout/ }))
    expect(onLogout).toHaveBeenCalled()
  })

  it('admin: menu admin aktif', () => {
    setup({ user: { name: 'Admin', role: 'admin' }, currentPath: '/admin' })
    expect(screen.getByRole('link', { name: /Admin/ })).toHaveAttribute('aria-current', 'page')
  })

  it('beranda aktif di /public dan detail artikel', () => {
    setup({ currentPath: '/public' })
    expect(screen.getByRole('link', { name: /Beranda/ })).toHaveAttribute('aria-current', 'page')
  })

  it('beranda aktif di halaman detail artikel', () => {
    setup({ currentPath: '/posts/halo' })
    expect(screen.getByRole('link', { name: /Beranda/ })).toHaveAttribute('aria-current', 'page')
  })

  it('tema terang/gelap dan aksen warna', async () => {
    const user = userEvent.setup()
    const { theme } = setup()

    await user.click(screen.getByRole('button', { name: 'Aktifkan mode gelap' }))
    expect(theme.toggleTheme).toHaveBeenCalled()

    expect(screen.getByRole('button', { name: 'Aksen indigo' })).toHaveAttribute('aria-pressed', 'true')
    await user.click(screen.getByRole('button', { name: 'Aksen rose' }))
    expect(theme.setAccent).toHaveBeenCalledWith('rose')
  })

  it('ikon mode terang saat gelap', () => {
    setup({ theme: { isDark: true } })
    expect(screen.getByRole('button', { name: 'Aktifkan mode terang' })).toBeInTheDocument()
  })
})

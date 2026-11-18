import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AuthPage from './AuthPage.jsx'
import { login, register } from '../api/authApi.js'
import { showSuccess } from '../../../helpers/toolsHelper.js'

vi.mock('../api/authApi.js', () => ({ login: vi.fn(), register: vi.fn() }))
vi.mock('../../../helpers/toolsHelper.js', () => ({ showSuccess: vi.fn() }))

function deferred() {
  let resolve
  const promise = new Promise((r) => {
    resolve = r
  })
  return { promise, resolve }
}

describe('AuthPage - login', () => {
  it('memiliki input wajib dan login berhasil', async () => {
    const user = userEvent.setup()
    const onLoginSuccess = vi.fn()
    const pending = deferred()
    login.mockReturnValue(pending.promise)

    render(<AuthPage mode="login" onNavigate={vi.fn()} onLoginSuccess={onLoginSuccess} />)
    expect(screen.getByRole('heading', { name: 'Masuk ke Akun' })).toBeInTheDocument()

    await user.type(document.getElementById('login-username'), ' admin ')
    await user.type(document.getElementById('login-password'), 'admin')
    await user.click(document.getElementById('login-submit'))

    expect(document.getElementById('login-submit')).toBeDisabled()
    pending.resolve({ token: 't', user: { id: 1 } })

    await waitFor(() => expect(onLoginSuccess).toHaveBeenCalledWith({ token: 't', user: { id: 1 } }))
    expect(login).toHaveBeenCalledWith('admin', 'admin')
    expect(document.getElementById('login-submit')).not.toBeDisabled()
  })

  it('menampilkan pesan error saat login gagal', async () => {
    const user = userEvent.setup()
    login.mockRejectedValue(new Error('username atau password salah'))

    render(<AuthPage mode="login" onNavigate={vi.fn()} onLoginSuccess={vi.fn()} />)
    await user.type(document.getElementById('login-username'), 'admin')
    await user.type(document.getElementById('login-password'), 'salah')
    await user.click(document.getElementById('login-submit'))

    expect(await screen.findByRole('alert')).toHaveTextContent('username atau password salah')
  })

  it('navigasi ke register dan beranda', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    render(<AuthPage mode="login" onNavigate={onNavigate} onLoginSuccess={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Daftar sebagai penulis' }))
    expect(onNavigate).toHaveBeenCalledWith('/register')

    await user.click(screen.getByRole('button', { name: /Kembali ke beranda/ }))
    expect(onNavigate).toHaveBeenCalledWith('/')
  })
})

describe('AuthPage - register', () => {
  async function fillRegister(user) {
    await user.type(document.getElementById('register-name'), ' Budi Santoso ')
    await user.type(document.getElementById('register-username'), 'budi')
    await user.type(document.getElementById('register-email'), 'budi@example.com')
    await user.type(document.getElementById('register-password'), 'secret123')
    await user.click(document.getElementById('register-submit'))
  }

  it('registrasi berhasil lalu diarahkan ke login', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    register.mockResolvedValue({ id: 2 })

    render(<AuthPage mode="register" onNavigate={onNavigate} onLoginSuccess={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'Daftar Akun Penulis' })).toBeInTheDocument()
    await fillRegister(user)

    await waitFor(() => expect(onNavigate).toHaveBeenCalledWith('/login'))
    expect(register).toHaveBeenCalledWith({ name: 'Budi Santoso', username: 'budi', email: 'budi@example.com', password: 'secret123' })
    expect(showSuccess).toHaveBeenCalled()
  })

  it('menampilkan error saat registrasi gagal', async () => {
    const user = userEvent.setup()
    register.mockRejectedValue(new Error('username sudah digunakan'))

    render(<AuthPage mode="register" onNavigate={vi.fn()} onLoginSuccess={vi.fn()} />)
    await fillRegister(user)

    expect(await screen.findByRole('alert')).toHaveTextContent('username sudah digunakan')
  })

  it('tautan ke halaman login', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    render(<AuthPage mode="register" onNavigate={onNavigate} onLoginSuccess={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: 'Masuk di sini' }))
    expect(onNavigate).toHaveBeenCalledWith('/login')
  })
})

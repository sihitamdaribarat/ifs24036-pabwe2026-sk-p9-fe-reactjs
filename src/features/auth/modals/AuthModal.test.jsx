import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AuthModal from './AuthModal.jsx'
import { login } from '../api/authApi.js'

vi.mock('../api/authApi.js', () => ({ login: vi.fn(), register: vi.fn() }))
vi.mock('../../../helpers/toolsHelper.js', () => ({ showSuccess: vi.fn() }))

describe('AuthModal', () => {
  it('tidak merender apa pun saat tertutup', () => {
    const { container } = render(<AuthModal isOpen={false} onClose={vi.fn()} onLoginSuccess={vi.fn()} onNavigate={vi.fn()} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('login dari modal', async () => {
    const user = userEvent.setup()
    const onLoginSuccess = vi.fn()
    login.mockResolvedValue({ token: 't', user: { id: 1 } })

    render(<AuthModal isOpen onClose={vi.fn()} onLoginSuccess={onLoginSuccess} onNavigate={vi.fn()} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.type(document.getElementById('login-username'), 'admin')
    await user.type(document.getElementById('login-password'), 'admin')
    await user.click(document.getElementById('login-submit'))

    await waitFor(() => expect(onLoginSuccess).toHaveBeenCalledWith({ token: 't', user: { id: 1 } }))
  })

  it('tombol tutup dan pindah ke register', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onNavigate = vi.fn()
    render(<AuthModal isOpen onClose={onClose} onLoginSuccess={vi.fn()} onNavigate={onNavigate} />)

    await user.click(screen.getByRole('button', { name: 'Tutup' }))
    expect(onClose).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'Daftar sebagai penulis' }))
    expect(onClose).toHaveBeenCalledTimes(2)
    expect(onNavigate).toHaveBeenCalledWith('/register')
  })
})

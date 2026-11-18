import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AuthorDashboard from './AuthorDashboard.jsx'
import { deletePost, getMyPosts, getMyStats, togglePublish } from '../api/blogApi.js'
import { showConfirm, showError, showSuccess } from '../../../helpers/toolsHelper.js'

vi.mock('../api/blogApi.js', () => ({
  getMyPosts: vi.fn(),
  getMyStats: vi.fn(),
  togglePublish: vi.fn(),
  deletePost: vi.fn(),
}))
vi.mock('../../../helpers/toolsHelper.js', async (importOriginal) => ({
  ...(await importOriginal()),
  showConfirm: vi.fn(),
  showError: vi.fn(),
  showSuccess: vi.fn(),
}))
vi.mock('../modals/PostModal.jsx', () => ({
  default: ({ post, onClose, onSaved, isDark }) => (
    <div data-testid="post-modal" data-dark={String(isDark)}>
      <span>{post ? `modal:${post.title}` : 'modal:baru'}</span>
      <button type="button" onClick={onClose}>
        stub-tutup
      </button>
      <button type="button" onClick={() => onSaved({ id: 99 })}>
        stub-simpan
      </button>
    </div>
  ),
}))
vi.mock('../modals/AiPostGeneratorModal.jsx', () => ({
  default: ({ onClose, onApply }) => (
    <div data-testid="ai-modal">
      <button type="button" onClick={onClose}>
        stub-ai-tutup
      </button>
      <button type="button" onClick={() => onApply({ title: 'Judul AI', category: 'Opini', excerpt: 'e', content: 'c', sources: [] })}>
        stub-ai-terapkan
      </button>
    </div>
  ),
}))

const POSTS = [
  { id: 1, title: 'Artikel Terbit', slug: 'artikel-terbit', category: 'Teknologi', is_published: true, reading_time: 2, updated_at: '2026-11-18T09:00:00Z' },
  { id: 2, title: 'Draf Saya', slug: 'draf-saya', category: 'Opini', is_published: false, reading_time: 1, updated_at: '2026-11-17T09:00:00Z' },
]

const USER = { id: 1, name: 'Budi' }

function renderDashboard() {
  const onNavigate = vi.fn()
  render(<AuthorDashboard user={USER} onNavigate={onNavigate} isDark />)
  return { onNavigate }
}

describe('AuthorDashboard', () => {
  beforeEach(() => {
    getMyPosts.mockResolvedValue(POSTS)
    getMyStats.mockResolvedValue({ total: 2, published: 1, draft: 1 })
  })

  it('menampilkan statistik dan tabel artikel', async () => {
    renderDashboard()
    expect(screen.getByText('Memuat artikel...')).toBeInTheDocument()
    expect(await screen.findByText('Artikel Terbit')).toBeInTheDocument()
    expect(screen.getByText('Halo, Budi 👋')).toBeInTheDocument()
    expect(screen.getByTestId('stat-total')).toHaveTextContent('2')
    expect(screen.getByRole('switch', { name: 'Status terbit Artikel Terbit' })).toBeChecked()
    expect(screen.getByRole('switch', { name: 'Status terbit Draf Saya' })).not.toBeChecked()
    expect(screen.getByText('Terbit')).toBeInTheDocument()
    expect(screen.getByText('Draf')).toBeInTheDocument()
  })

  it('pencarian dan state kosong', async () => {
    const user = userEvent.setup()
    renderDashboard()
    await screen.findByText('Artikel Terbit')

    await user.type(screen.getByLabelText('Cari artikel saya'), 'opini')
    expect(screen.queryByText('Artikel Terbit')).not.toBeInTheDocument()
    expect(screen.getByText('Draf Saya')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Cari artikel saya'), 'zzz')
    expect(screen.getByText(/Belum ada artikel/)).toBeInTheDocument()
  })

  it('menampilkan error saat gagal memuat', async () => {
    getMyPosts.mockRejectedValue(new Error('Server error'))
    renderDashboard()
    await waitFor(() => expect(showError).toHaveBeenCalledWith('Server error'))
    expect(screen.getByText(/Belum ada artikel/)).toBeInTheDocument()
  })

  it('toggle status terbit/draf', async () => {
    const user = userEvent.setup()
    togglePublish.mockResolvedValueOnce({ id: 2, is_published: true }).mockResolvedValueOnce({ id: 1, is_published: false })
    renderDashboard()
    await screen.findByText('Artikel Terbit')

    await user.click(screen.getByRole('switch', { name: 'Status terbit Draf Saya' }))
    await waitFor(() => expect(showSuccess).toHaveBeenCalledWith('Artikel berhasil diterbitkan.'))
    expect(togglePublish).toHaveBeenCalledWith(2)

    await user.click(screen.getByRole('switch', { name: 'Status terbit Artikel Terbit' }))
    await waitFor(() => expect(showSuccess).toHaveBeenCalledWith('Artikel dikembalikan ke draf.'))
    expect(getMyPosts).toHaveBeenCalledTimes(3)

    togglePublish.mockRejectedValueOnce(new Error('gagal toggle'))
    await user.click(screen.getByRole('switch', { name: 'Status terbit Draf Saya' }))
    await waitFor(() => expect(showError).toHaveBeenCalledWith('gagal toggle'))
  })

  it('menu kebab: buka/tutup, edit, lihat publik', async () => {
    const user = userEvent.setup()
    const { onNavigate } = renderDashboard()
    await screen.findByText('Artikel Terbit')

    const kebab = screen.getByRole('button', { name: 'Menu aksi Artikel Terbit' })
    await user.click(kebab)
    expect(kebab).toHaveAttribute('aria-expanded', 'true')
    await user.click(kebab)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Menu aksi Draf Saya' }))
    expect(within(screen.getByRole('menu')).queryByText(/Lihat Publik/)).not.toBeInTheDocument()

    await user.click(kebab)
    await user.click(within(screen.getByRole('menu')).getByRole('menuitem', { name: /Lihat Publik/ }))
    expect(onNavigate).toHaveBeenCalledWith('/posts/artikel-terbit')

    await user.click(kebab)
    await user.click(screen.getByRole('menuitem', { name: /Edit/ }))
    expect(screen.getByText('modal:Artikel Terbit')).toBeInTheDocument()
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(screen.getByTestId('post-modal')).toHaveAttribute('data-dark', 'true')

    await user.click(screen.getByText('stub-tutup'))
    expect(screen.queryByTestId('post-modal')).not.toBeInTheDocument()
  })

  it('hapus artikel dengan konfirmasi', async () => {
    const user = userEvent.setup()
    renderDashboard()
    await screen.findByText('Artikel Terbit')

    showConfirm.mockResolvedValueOnce(false)
    await user.click(screen.getByRole('button', { name: 'Menu aksi Draf Saya' }))
    await user.click(screen.getByRole('menuitem', { name: /Hapus/ }))
    await waitFor(() => expect(showConfirm).toHaveBeenCalled())
    expect(deletePost).not.toHaveBeenCalled()

    showConfirm.mockResolvedValueOnce(true)
    deletePost.mockResolvedValueOnce()
    await user.click(screen.getByRole('button', { name: 'Menu aksi Draf Saya' }))
    await user.click(screen.getByRole('menuitem', { name: /Hapus/ }))
    await waitFor(() => expect(showSuccess).toHaveBeenCalledWith('Artikel berhasil dihapus.'))
    expect(deletePost).toHaveBeenCalledWith(2)

    showConfirm.mockResolvedValueOnce(true)
    deletePost.mockRejectedValueOnce(new Error('gagal hapus'))
    await user.click(screen.getByRole('button', { name: 'Menu aksi Draf Saya' }))
    await user.click(screen.getByRole('menuitem', { name: /Hapus/ }))
    await waitFor(() => expect(showError).toHaveBeenCalledWith('gagal hapus'))
  })

  it('tambah artikel lalu simpan memuat ulang data', async () => {
    const user = userEvent.setup()
    renderDashboard()
    await screen.findByText('Artikel Terbit')

    await user.click(screen.getByRole('button', { name: /Tambah Artikel/ }))
    expect(screen.getByText('modal:baru')).toBeInTheDocument()

    await user.click(screen.getByText('stub-simpan'))
    expect(screen.queryByTestId('post-modal')).not.toBeInTheDocument()
    await waitFor(() => expect(getMyPosts).toHaveBeenCalledTimes(2))
  })

  it('AI generator: tutup dan terapkan ke editor', async () => {
    const user = userEvent.setup()
    renderDashboard()
    await screen.findByText('Artikel Terbit')

    await user.click(screen.getByRole('button', { name: /AI Generator/ }))
    await user.click(screen.getByText('stub-ai-tutup'))
    expect(screen.queryByTestId('ai-modal')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /AI Generator/ }))
    await user.click(screen.getByText('stub-ai-terapkan'))
    expect(screen.queryByTestId('ai-modal')).not.toBeInTheDocument()
    expect(screen.getByText('modal:Judul AI')).toBeInTheDocument()
  })
})

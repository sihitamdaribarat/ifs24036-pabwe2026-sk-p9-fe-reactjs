import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminDashboard from './AdminDashboard.jsx'
import { getAllPosts, getUserPosts, getUsers } from '../api/adminApi.js'
import { showError } from '../../../helpers/toolsHelper.js'

vi.mock('../api/adminApi.js', () => ({ getUsers: vi.fn(), getAllPosts: vi.fn(), getUserPosts: vi.fn() }))
vi.mock('../../../helpers/toolsHelper.js', async (importOriginal) => ({
  ...(await importOriginal()),
  showError: vi.fn(),
}))

const USERS = [
  { id: 1, name: 'Administrator', username: 'admin', email: 'admin@delcom.org', role: 'admin', total_posts: 1, published_posts: 1 },
  { id: 2, name: 'Budi', username: 'budi', email: 'budi@example.com', role: 'member', total_posts: 2, published_posts: 1 },
]

const POSTS = [
  { id: 1, title: 'Sambutan Admin', slug: 'sambutan', category: 'Umum', is_published: true, updated_at: '2026-11-18T09:00:00Z', author: { username: 'admin' } },
  { id: 2, title: 'Tulisan Budi', slug: 'tulisan-budi', category: 'Teknologi', is_published: true, updated_at: '2026-11-18T09:00:00Z', author: { username: 'budi' } },
  { id: 3, title: 'Draf Budi', slug: 'draf-budi', category: 'Opini', is_published: false, updated_at: '2026-11-18T09:00:00Z', author: { username: 'budi' } },
]

function renderDashboard() {
  const onNavigate = vi.fn()
  render(<AdminDashboard onNavigate={onNavigate} />)
  return { onNavigate }
}

describe('AdminDashboard', () => {
  beforeEach(() => {
    getUsers.mockResolvedValue(USERS)
    getAllPosts.mockResolvedValue(POSTS)
  })

  it('menampilkan ringkasan, direktori pengguna dan arsip artikel', async () => {
    renderDashboard()
    expect(screen.getByText('Memuat data...')).toBeInTheDocument()

    expect(await screen.findByText('budi@example.com')).toBeInTheDocument()
    expect(screen.getByText('Total Pengguna', { selector: 'p' }).nextSibling).toHaveTextContent('2')
    expect(screen.getByText('Total Artikel', { selector: 'p' }).nextSibling).toHaveTextContent('3')
    expect(screen.getByText('Artikel Terbit', { selector: 'p' }).nextSibling).toHaveTextContent('2')
    expect(screen.getByText('admin@delcom.org')).toBeInTheDocument()
    expect(screen.getByText('member')).toBeInTheDocument()
    expect(screen.getByText('Arsip Seluruh Artikel')).toBeInTheDocument()
    expect(screen.getByText('Draf')).toBeInTheDocument()
    expect(screen.getAllByText('Terbit')).toHaveLength(2)
  })

  it('membaca artikel terbit', async () => {
    const user = userEvent.setup()
    const { onNavigate } = renderDashboard()
    await user.click(await screen.findByRole('button', { name: 'Baca Tulisan Budi' }))
    expect(onNavigate).toHaveBeenCalledWith('/posts/tulisan-budi')
    expect(screen.queryByRole('button', { name: 'Baca Draf Budi' })).not.toBeInTheDocument()
  })

  it('melihat artikel milik pengguna tertentu lalu kembali ke semua', async () => {
    const user = userEvent.setup()
    getUserPosts.mockResolvedValue(POSTS.slice(1))
    renderDashboard()
    const budiRow = (await screen.findByText('budi@example.com')).closest('tr')
    await user.click(within(budiRow).getByRole('button', { name: 'Lihat Artikel' }))

    expect(await screen.findByText('Artikel milik @budi')).toBeInTheDocument()
    expect(getUserPosts).toHaveBeenCalledWith(2)
    expect(budiRow).toHaveClass('bg-accent-50')
    expect(screen.queryByText('Sambutan Admin')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Tampilkan semua/ }))
    expect(screen.getByText('Arsip Seluruh Artikel')).toBeInTheDocument()
    expect(screen.getByText('Sambutan Admin')).toBeInTheDocument()
  })

  it('pencarian artikel dan state kosong', async () => {
    const user = userEvent.setup()
    renderDashboard()
    await screen.findByText('budi@example.com')

    await user.type(screen.getByLabelText('Cari artikel sistem'), 'opini')
    expect(screen.getByText('Draf Budi')).toBeInTheDocument()
    expect(screen.queryByText('Tulisan Budi')).not.toBeInTheDocument()

    await user.type(screen.getByLabelText('Cari artikel sistem'), 'zzz')
    expect(screen.getByText('Tidak ada artikel.')).toBeInTheDocument()
  })

  it('menampilkan error saat data gagal dimuat', async () => {
    getUsers.mockRejectedValue(new Error('Forbidden'))
    renderDashboard()
    await waitFor(() => expect(showError).toHaveBeenCalledWith('Forbidden'))
    expect(await screen.findByText('Tidak ada artikel.')).toBeInTheDocument()
  })

  it('menampilkan error saat artikel pengguna gagal dimuat', async () => {
    const user = userEvent.setup()
    getUserPosts.mockRejectedValue(new Error('pengguna tidak ditemukan'))
    renderDashboard()
    const budiRow = (await screen.findByText('budi@example.com')).closest('tr')

    await user.click(within(budiRow).getByRole('button', { name: 'Lihat Artikel' }))
    await waitFor(() => expect(showError).toHaveBeenCalledWith('pengguna tidak ditemukan'))
    expect(screen.getByText('Arsip Seluruh Artikel')).toBeInTheDocument()
  })
})

import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PublicArticleList from './PublicArticleList.jsx'
import { getCategories, getPublicPosts } from '../api/blogApi.js'

vi.mock('../api/blogApi.js', () => ({ getCategories: vi.fn(), getPublicPosts: vi.fn() }))

const POSTS = [
  {
    id: 1,
    slug: 'ai-di-sekolah',
    title: 'AI di Sekolah',
    category: 'Pendidikan',
    excerpt: 'Kecerdasan buatan di kelas.',
    cover_image_path: 'https://img.test/cover.jpg',
    published_at: '2026-11-18T09:00:00Z',
    reading_time: 3,
    author: { name: 'Budi Santoso' },
  },
  {
    id: 2,
    slug: 'tips-sehat',
    title: 'Tips Sehat',
    category: 'Gaya Hidup',
    excerpt: '',
    cover_image_path: '',
    published_at: '2026-11-17T09:00:00Z',
    reading_time: 1,
    author: { name: 'Andi' },
  },
]

function deferred() {
  let resolve
  const promise = new Promise((r) => {
    resolve = r
  })
  return { promise, resolve }
}

describe('PublicArticleList', () => {
  beforeEach(() => {
    getCategories.mockResolvedValue(['Teknologi', 'Pendidikan'])
    getPublicPosts.mockResolvedValue(POSTS)
  })

  it('menampilkan galeri artikel dan navigasi ke detail', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    render(<PublicArticleList user={null} onNavigate={onNavigate} />)

    expect(screen.getByLabelText('Memuat artikel')).toBeInTheDocument()
    expect(await screen.findByText('AI di Sekolah')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'AI di Sekolah' })).toHaveAttribute('src', 'https://img.test/cover.jpg')
    expect(screen.getByText('Baca selengkapnya artikel ini.')).toBeInTheDocument()
    expect(screen.getByText('3 menit baca')).toBeInTheDocument()
    expect(getPublicPosts).toHaveBeenCalledWith({ q: '', category: '' })

    await user.click(screen.getByText('AI di Sekolah'))
    expect(onNavigate).toHaveBeenCalledWith('/posts/ai-di-sekolah')
  })

  it('tombol tamu (Mulai Menulis / Login) dan penulis (Workspace)', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    const { unmount } = render(<PublicArticleList user={null} onNavigate={onNavigate} />)
    await screen.findByText('AI di Sekolah')

    await user.click(screen.getByRole('button', { name: /Mulai Menulis/ }))
    expect(onNavigate).toHaveBeenCalledWith('/register')
    await user.click(screen.getByRole('button', { name: 'Login' }))
    expect(onNavigate).toHaveBeenCalledWith('/login')
    unmount()

    render(<PublicArticleList user={{ name: 'Budi' }} onNavigate={onNavigate} />)
    await screen.findByText('AI di Sekolah')
    await user.click(screen.getByRole('button', { name: /Buka Workspace/ }))
    expect(onNavigate).toHaveBeenCalledWith('/author')
  })

  it('filter kategori berbentuk pill', async () => {
    const user = userEvent.setup()
    render(<PublicArticleList user={null} onNavigate={vi.fn()} />)

    const pill = await screen.findByRole('button', { name: 'Pendidikan' })
    await user.click(pill)
    await waitFor(() => expect(getPublicPosts).toHaveBeenLastCalledWith({ q: '', category: 'Pendidikan' }))
    expect(pill).toHaveAttribute('aria-pressed', 'true')

    await user.click(screen.getByRole('button', { name: 'Semua' }))
    await waitFor(() => expect(getPublicPosts).toHaveBeenLastCalledWith({ q: '', category: '' }))
  })

  it('pencarian kata kunci real-time (debounce)', async () => {
    const user = userEvent.setup()
    render(<PublicArticleList user={null} onNavigate={vi.fn()} />)
    await screen.findByText('AI di Sekolah')

    await user.type(screen.getByLabelText('Cari artikel'), '  sekolah ')
    await waitFor(() => expect(getPublicPosts).toHaveBeenLastCalledWith({ q: 'sekolah', category: '' }))
  })

  it('kategori gagal dimuat tetap menampilkan pill Semua', async () => {
    getCategories.mockRejectedValue(new Error('x'))
    render(<PublicArticleList user={null} onNavigate={vi.fn()} />)
    await screen.findByText('AI di Sekolah')
    expect(screen.getByRole('button', { name: 'Semua' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Teknologi' })).not.toBeInTheDocument()
  })

  it('state kosong dan error', async () => {
    getPublicPosts.mockResolvedValueOnce([])
    const { unmount } = render(<PublicArticleList user={null} onNavigate={vi.fn()} />)
    expect(await screen.findByText('Belum ada artikel yang cocok.')).toBeInTheDocument()
    unmount()

    getPublicPosts.mockRejectedValueOnce(new Error('Server sedang gangguan'))
    render(<PublicArticleList user={null} onNavigate={vi.fn()} />)
    expect(await screen.findByRole('alert')).toHaveTextContent('Server sedang gangguan')
  })

  it('mengabaikan respons lama saat filter berganti', async () => {
    const user = userEvent.setup()
    const slow = deferred()
    getPublicPosts.mockReturnValueOnce(slow.promise).mockResolvedValueOnce([POSTS[1]])

    render(<PublicArticleList user={null} onNavigate={vi.fn()} />)
    await user.click(await screen.findByRole('button', { name: 'Teknologi' }))
    expect(await screen.findByText('Tips Sehat')).toBeInTheDocument()

    await act(async () => slow.resolve(POSTS))
    expect(screen.queryByText('AI di Sekolah')).not.toBeInTheDocument()
  })
})

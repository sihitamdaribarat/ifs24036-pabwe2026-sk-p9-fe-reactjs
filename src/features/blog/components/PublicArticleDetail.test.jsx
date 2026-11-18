import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PublicArticleDetail from './PublicArticleDetail.jsx'
import { getPublicPost } from '../api/blogApi.js'

vi.mock('../api/blogApi.js', () => ({ getPublicPost: vi.fn() }))
vi.mock('../../../components/MarkdownViewer.jsx', () => ({
  default: ({ content }) => <div data-testid="viewer">{content}</div>,
}))

const POST = {
  id: 1,
  slug: 'ai-di-sekolah',
  title: 'AI di Sekolah',
  category: 'Pendidikan',
  excerpt: 'Ringkasan artikel.',
  content: '## Isi Markdown',
  cover_image_path: 'https://img.test/cover.jpg',
  published_at: '2026-11-18T09:00:00Z',
  reading_time: 4,
  author: { name: 'Budi Santoso', username: 'budi' },
}

describe('PublicArticleDetail', () => {
  it('menampilkan artikel lengkap', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    getPublicPost.mockResolvedValue(POST)

    render(<PublicArticleDetail slug="ai-di-sekolah" onNavigate={onNavigate} />)
    expect(screen.getByLabelText('Memuat artikel')).toBeInTheDocument()

    expect(await screen.findByRole('heading', { level: 1, name: 'AI di Sekolah' })).toBeInTheDocument()
    expect(getPublicPost).toHaveBeenCalledWith('ai-di-sekolah')
    expect(screen.getByText('Ringkasan artikel.')).toBeInTheDocument()
    expect(screen.getByText('@budi')).toBeInTheDocument()
    expect(screen.getByText('4 menit baca')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'AI di Sekolah' })).toBeInTheDocument()
    expect(screen.getByTestId('viewer')).toHaveTextContent('## Isi Markdown')

    await user.click(screen.getByRole('button', { name: /Kembali/ }))
    expect(onNavigate).toHaveBeenCalledWith('/')
  })

  it('artikel tanpa excerpt dan sampul', async () => {
    getPublicPost.mockResolvedValue({ ...POST, excerpt: '', cover_image_path: '' })
    render(<PublicArticleDetail slug="ai-di-sekolah" onNavigate={vi.fn()} />)
    await screen.findByRole('heading', { level: 1, name: 'AI di Sekolah' })
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.queryByText('Ringkasan artikel.')).not.toBeInTheDocument()
  })

  it('menampilkan pesan saat artikel tidak ditemukan', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    getPublicPost.mockRejectedValue(new Error('artikel tidak ditemukan'))

    render(<PublicArticleDetail slug="tidak-ada" onNavigate={onNavigate} />)
    expect(await screen.findByText('Artikel tidak ditemukan')).toBeInTheDocument()
    expect(screen.getByText('artikel tidak ditemukan')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Kembali/ }))
    expect(onNavigate).toHaveBeenCalledWith('/')
  })

  it('mengabaikan respons setelah komponen dilepas', async () => {
    let resolve
    getPublicPost.mockReturnValue(
      new Promise((r) => {
        resolve = r
      }),
    )
    const { unmount } = render(<PublicArticleDetail slug="x" onNavigate={vi.fn()} />)
    unmount()
    await act(async () => resolve(POST))
    expect(screen.queryByText('AI di Sekolah')).not.toBeInTheDocument()
  })
})

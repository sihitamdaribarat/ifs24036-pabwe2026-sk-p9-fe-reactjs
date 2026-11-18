import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PostModal from './PostModal.jsx'
import { createPost, updatePost } from '../api/blogApi.js'
import { showError, showSuccess } from '../../../helpers/toolsHelper.js'

vi.mock('../api/blogApi.js', () => ({
  CATEGORIES: ['Teknologi', 'Pendidikan', 'Gaya Hidup', 'Bisnis', 'Opini', 'Umum'],
  createPost: vi.fn(),
  updatePost: vi.fn(),
}))
vi.mock('../../../helpers/toolsHelper.js', () => ({ showError: vi.fn(), showSuccess: vi.fn() }))
vi.mock('../../../components/MarkdownEditor.jsx', () => ({
  default: ({ value, onChange, dark }) => (
    <textarea aria-label="Editor konten" data-dark={String(dark)} value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}))

function renderModal(props = {}) {
  const handlers = { onClose: vi.fn(), onSaved: vi.fn() }
  render(<PostModal post={null} isDark={false} {...handlers} {...props} />)
  return handlers
}

describe('PostModal', () => {
  it('layout full screen dengan header & footer kontras', () => {
    renderModal()
    const dialog = screen.getByRole('dialog')
    expect(dialog.firstChild).toHaveClass('max-w-[96vw]')
    expect(screen.getByRole('heading', { name: /Tulis Artikel Baru/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Batal' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Simpan/ })).toBeInTheDocument()
    expect(screen.getByText('Disimpan sebagai draf')).toBeInTheDocument()
  })

  it('validasi judul dan konten wajib', async () => {
    const user = userEvent.setup()
    renderModal()
    await user.click(screen.getByRole('button', { name: /Simpan/ }))
    expect(showError).toHaveBeenCalledWith('Judul dan konten artikel wajib diisi.', 'Data belum lengkap')
    expect(createPost).not.toHaveBeenCalled()
  })

  it('membuat artikel baru', async () => {
    const user = userEvent.setup()
    createPost.mockResolvedValue({ id: 10 })
    const { onSaved } = renderModal({ isDark: true })

    expect(screen.getByLabelText('Editor konten')).toHaveAttribute('data-dark', 'true')
    await user.type(screen.getByLabelText('Judul Artikel'), '  Judul Baru ')
    await user.selectOptions(screen.getByLabelText('Kategori'), 'Bisnis')
    await user.type(screen.getByLabelText(/Excerpt/), ' Ringkas ')
    await user.type(screen.getByLabelText(/Gambar Sampul/), 'https://img.test/a.jpg')
    expect(screen.getByRole('img', { name: 'Pratinjau sampul' })).toBeInTheDocument()
    await user.click(screen.getByLabelText(/Terbitkan artikel/))
    expect(screen.getByText('Tampil di halaman publik')).toBeInTheDocument()
    await user.type(screen.getByLabelText('Editor konten'), '## Isi')

    await user.click(screen.getByRole('button', { name: /Simpan/ }))

    await waitFor(() => expect(onSaved).toHaveBeenCalledWith({ id: 10 }))
    expect(createPost).toHaveBeenCalledWith({
      title: 'Judul Baru',
      category: 'Bisnis',
      excerpt: 'Ringkas',
      content: '## Isi',
      cover_image_path: 'https://img.test/a.jpg',
      is_published: true,
    })
    expect(showSuccess).toHaveBeenCalledWith('Artikel berhasil dibuat.')
  })

  it('mengedit artikel yang ada', async () => {
    const user = userEvent.setup()
    let resolve
    updatePost.mockReturnValue(
      new Promise((r) => {
        resolve = r
      }),
    )
    const post = { id: 5, title: 'Lama', category: 'Opini', excerpt: 'e', content: 'isi', cover_image_path: '', is_published: false }
    const { onSaved } = renderModal({ post })

    expect(screen.getByRole('heading', { name: /Edit Artikel/ })).toBeInTheDocument()
    expect(screen.getByLabelText('Judul Artikel')).toHaveValue('Lama')
    await user.click(screen.getByRole('button', { name: /Simpan/ }))
    expect(screen.getByRole('button', { name: /Simpan/ })).toBeDisabled()

    resolve({ id: 5 })
    await waitFor(() => expect(onSaved).toHaveBeenCalledWith({ id: 5 }))
    expect(updatePost).toHaveBeenCalledWith(5, expect.objectContaining({ title: 'Lama', category: 'Opini' }))
    expect(showSuccess).toHaveBeenCalledWith('Artikel berhasil diperbarui.')
  })

  it('menampilkan error saat penyimpanan gagal', async () => {
    const user = userEvent.setup()
    createPost.mockRejectedValue(new Error('kategori tidak valid'))
    const { onSaved } = renderModal({ post: { title: 'Dari AI', content: 'isi AI' } })

    expect(screen.getByRole('heading', { name: /Tulis Artikel Baru/ })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Simpan/ }))
    await waitFor(() => expect(showError).toHaveBeenCalledWith('kategori tidak valid'))
    expect(onSaved).not.toHaveBeenCalled()
  })

  it('tombol tutup dan batal', async () => {
    const user = userEvent.setup()
    const { onClose } = renderModal()
    await user.click(screen.getByRole('button', { name: 'Tutup' }))
    await user.click(screen.getByRole('button', { name: 'Batal' }))
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})

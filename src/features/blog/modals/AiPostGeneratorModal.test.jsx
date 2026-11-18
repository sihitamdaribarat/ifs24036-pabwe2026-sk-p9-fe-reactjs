import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AiPostGeneratorModal from './AiPostGeneratorModal.jsx'
import { generateAiPost } from '../api/blogApi.js'
import { showError } from '../../../helpers/toolsHelper.js'

vi.mock('../api/blogApi.js', () => ({
  CATEGORIES: ['Teknologi', 'Pendidikan', 'Gaya Hidup', 'Bisnis', 'Opini', 'Umum'],
  generateAiPost: vi.fn(),
}))
vi.mock('../../../helpers/toolsHelper.js', () => ({ showError: vi.fn() }))
vi.mock('../../../components/MarkdownViewer.jsx', () => ({
  default: ({ content }) => <div data-testid="viewer">{content}</div>,
}))

const ARTICLE = {
  title: 'AI dan Pendidikan',
  category: 'Pendidikan',
  excerpt: 'Ringkasan AI.',
  content: '## Isi artikel AI',
  sources: [
    { title: 'Sumber Satu', url: 'https://satu.test', snippet: 'cuplikan satu' },
    { title: 'Sumber Dua', url: 'https://dua.test', snippet: '' },
  ],
  web_search_used: true,
}

function deferred() {
  let resolve
  const promise = new Promise((r) => {
    resolve = r
  })
  return { promise, resolve }
}

function renderModal() {
  const handlers = { onClose: vi.fn(), onApply: vi.fn() }
  render(<AiPostGeneratorModal {...handlers} />)
  return handlers
}

describe('AiPostGeneratorModal', () => {
  it('layout full screen dan tombol simpan nonaktif sebelum generate', () => {
    renderModal()
    expect(screen.getByRole('dialog').firstChild).toHaveClass('max-w-[96vw]')
    expect(screen.getByText('Pratinjau artikel AI akan tampil di sini.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Simpan ke Editor/ })).toBeDisabled()
    expect(screen.getByLabelText(/Penelusuran Mesin Pencari/)).toBeChecked()
  })

  it('validasi topik wajib', async () => {
    const user = userEvent.setup()
    renderModal()
    await user.click(screen.getByRole('button', { name: /Generate Artikel/ }))
    expect(showError).toHaveBeenCalledWith('Topik artikel wajib diisi.', 'Data belum lengkap')
    expect(generateAiPost).not.toHaveBeenCalled()
  })

  it('generate dengan search engine lalu terapkan ke editor', async () => {
    const user = userEvent.setup()
    const pending = deferred()
    generateAiPost.mockReturnValue(pending.promise)
    const { onApply } = renderModal()

    await user.type(screen.getByLabelText('Topik Artikel'), ' AI di sekolah ')
    await user.selectOptions(screen.getByLabelText('Kategori'), 'Pendidikan')
    await user.type(screen.getByLabelText(/Gaya Bahasa/), ' santai ')
    await user.click(screen.getByRole('button', { name: /Generate Artikel/ }))

    expect(screen.getByText('Menelusuri mesin pencari & menyusun artikel...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Sedang membuat/ })).toBeDisabled()

    pending.resolve(ARTICLE)
    expect(await screen.findByRole('heading', { name: 'AI dan Pendidikan' })).toBeInTheDocument()
    expect(generateAiPost).toHaveBeenCalledWith({ topic: 'AI di sekolah', category: 'Pendidikan', tone: 'santai', includeWebSearch: true })
    expect(screen.getByRole('link', { name: /Sumber Satu/ })).toHaveAttribute('href', 'https://satu.test')
    expect(screen.getByText('cuplikan satu')).toBeInTheDocument()
    expect(screen.getByTestId('viewer')).toHaveTextContent('## Isi artikel AI')

    await user.click(screen.getByRole('button', { name: /Simpan ke Editor/ }))
    expect(onApply).toHaveBeenCalledWith(ARTICLE)
  })

  it('generate tanpa search engine menampilkan peringatan & tanpa sumber', async () => {
    const user = userEvent.setup()
    const pending = deferred()
    generateAiPost.mockReturnValue(pending.promise)
    renderModal()

    await user.type(screen.getByLabelText('Topik Artikel'), 'Opini')
    await user.click(screen.getByLabelText(/Penelusuran Mesin Pencari/))
    await user.click(screen.getByRole('button', { name: /Generate Artikel/ }))
    expect(screen.getByText('AI sedang menyusun artikel...')).toBeInTheDocument()

    pending.resolve({ ...ARTICLE, sources: [], search_warning: 'Penelusuran mesin pencari gagal' })
    expect(await screen.findByText('Penelusuran mesin pencari gagal')).toBeInTheDocument()
    expect(screen.getByText('Tidak ada sumber web yang digunakan.')).toBeInTheDocument()
    expect(generateAiPost).toHaveBeenCalledWith(expect.objectContaining({ includeWebSearch: false }))
  })

  it('menampilkan error saat AI gagal', async () => {
    const user = userEvent.setup()
    generateAiPost.mockRejectedValue(new Error('layanan AI belum dikonfigurasi'))
    renderModal()

    await user.type(screen.getByLabelText('Topik Artikel'), 'AI')
    await user.click(screen.getByRole('button', { name: /Generate Artikel/ }))
    await waitFor(() => expect(showError).toHaveBeenCalledWith('layanan AI belum dikonfigurasi', 'Gagal membuat artikel AI'))
    expect(screen.getByText('Pratinjau artikel AI akan tampil di sini.')).toBeInTheDocument()
  })

  it('tombol tutup dan batal', async () => {
    const user = userEvent.setup()
    const { onClose } = renderModal()
    await user.click(screen.getByRole('button', { name: 'Tutup' }))
    await user.click(screen.getByRole('button', { name: 'Batal' }))
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})

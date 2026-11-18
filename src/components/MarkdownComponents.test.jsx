import { render } from '@testing-library/react'
import Editor from '@toast-ui/editor'
import MarkdownEditor from './MarkdownEditor.jsx'
import MarkdownViewer from './MarkdownViewer.jsx'

vi.mock('@toast-ui/editor', () => {
  const instances = []
  class FakeEditor {
    constructor(options) {
      this.options = options
      this.markdown = options.initialValue
      this.setMarkdown = vi.fn((value) => {
        this.markdown = value
      })
      this.destroy = vi.fn()
      instances.push(this)
    }

    getMarkdown() {
      return this.markdown
    }

    // Simulasi pengguna mengetik di editor.
    type(value) {
      this.markdown = value
      this.options.events.change()
    }

    static factory(options) {
      return new FakeEditor(options)
    }
  }
  FakeEditor.instances = instances
  return { default: FakeEditor }
})

const last = () => Editor.instances[Editor.instances.length - 1]

describe('MarkdownEditor', () => {
  it('membuat editor dengan opsi default dan meneruskan perubahan', () => {
    window.innerWidth = 1280
    const onChange = vi.fn()
    const { rerender, unmount, getByTestId } = render(<MarkdownEditor value="# Halo" onChange={onChange} />)

    const editor = last()
    expect(getByTestId('markdown-editor')).toBeInTheDocument()
    expect(editor.options).toMatchObject({
      initialValue: '# Halo',
      initialEditType: 'markdown',
      previewStyle: 'vertical',
      theme: 'light',
      height: '520px',
      placeholder: 'Tulis artikel Anda di sini...',
    })

    editor.type('# Halo dunia')
    expect(onChange).toHaveBeenCalledWith('# Halo dunia')

    // Nilai yang sama dengan isi editor tidak memicu setMarkdown.
    rerender(<MarkdownEditor value="# Halo dunia" onChange={onChange} />)
    expect(editor.setMarkdown).not.toHaveBeenCalled()

    // Nilai dari luar (misal hasil AI) disinkronkan ke editor.
    rerender(<MarkdownEditor value="## Dari AI" onChange={onChange} />)
    expect(editor.setMarkdown).toHaveBeenCalledWith('## Dari AI')

    unmount()
    expect(editor.destroy).toHaveBeenCalled()
  })

  it('mendukung tema gelap, tinggi kustom dan mode tab di layar kecil', () => {
    window.innerWidth = 600
    render(<MarkdownEditor value="" onChange={vi.fn()} dark height="300px" placeholder="Ketik..." />)
    expect(last().options).toMatchObject({ theme: 'dark', previewStyle: 'tab', height: '300px', placeholder: 'Ketik...' })
  })

  it('memakai onChange terbaru setelah rerender', () => {
    const first = vi.fn()
    const second = vi.fn()
    const { rerender } = render(<MarkdownEditor value="a" onChange={first} />)
    rerender(<MarkdownEditor value="a" onChange={second} />)
    last().type('ab')
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledWith('ab')
  })
})

describe('MarkdownViewer', () => {
  it('merender viewer dan memperbarui konten', () => {
    const { rerender, unmount, getByTestId } = render(<MarkdownViewer content="# Artikel" />)
    const viewer = last()

    expect(viewer.options).toMatchObject({ viewer: true, initialValue: '# Artikel' })
    expect(getByTestId('markdown-viewer').className).toBe('text-left ')

    rerender(<MarkdownViewer content="# Artikel" />)
    expect(viewer.setMarkdown).not.toHaveBeenCalled()

    rerender(<MarkdownViewer content="# Baru" className="prose" />)
    expect(viewer.setMarkdown).toHaveBeenCalledWith('# Baru')
    expect(getByTestId('markdown-viewer').className).toBe('text-left prose')

    unmount()
    expect(viewer.destroy).toHaveBeenCalled()
  })
})

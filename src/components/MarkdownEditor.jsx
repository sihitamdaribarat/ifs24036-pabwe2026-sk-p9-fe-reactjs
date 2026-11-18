import { useEffect, useRef } from 'react'
import Editor from '@toast-ui/editor'
import '@toast-ui/editor/dist/toastui-editor.css'
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css'

const TOOLBAR = [
  ['heading', 'bold', 'italic', 'strike'],
  ['hr', 'quote'],
  ['ul', 'ol', 'task', 'indent', 'outdent'],
  ['table', 'image', 'link'],
  ['code', 'codeblock'],
]

// Wrapper Toast UI Editor: mode Markdown + pratinjau simultan (vertical) atau WYSIWYG,
// toolbar format lengkap, dan dukungan tema gelap.
export default function MarkdownEditor({ value, onChange, dark = false, height = '520px', placeholder = 'Tulis artikel Anda di sini...' }) {
  const containerRef = useRef(null)
  const editorRef = useRef(null)
  const onChangeRef = useRef(onChange)
  const valueRef = useRef(value)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    const editor = new Editor({
      el: containerRef.current,
      height,
      initialValue: valueRef.current,
      initialEditType: 'markdown',
      previewStyle: window.innerWidth >= 1024 ? 'vertical' : 'tab',
      theme: dark ? 'dark' : 'light',
      placeholder,
      usageStatistics: false,
      hideModeSwitch: false,
      toolbarItems: TOOLBAR,
      events: {
        change: () => {
          valueRef.current = editor.getMarkdown()
          onChangeRef.current(valueRef.current)
        },
      },
    })
    editorRef.current = editor
    return () => {
      editor.destroy()
      editorRef.current = null
    }
  }, [dark, height, placeholder])

  // Sinkronisasi nilai dari luar (misal hasil AI generator) tanpa membuat ulang editor.
  useEffect(() => {
    if (value !== valueRef.current) {
      valueRef.current = value
      editorRef.current.setMarkdown(value)
    }
  }, [value])

  return <div ref={containerRef} data-testid="markdown-editor" className="overflow-hidden rounded-xl text-left" />
}

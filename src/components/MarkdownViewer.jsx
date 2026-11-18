import { useEffect, useRef } from 'react'
import Editor from '@toast-ui/editor'
import '@toast-ui/editor/dist/toastui-editor-viewer.css'

// Wrapper Toast UI Viewer untuk menampilkan konten Markdown artikel secara responsif.
// HTML di dalam Markdown disanitasi otomatis oleh Toast UI (DOMPurify).
export default function MarkdownViewer({ content, className = '' }) {
  const containerRef = useRef(null)
  const viewerRef = useRef(null)
  const contentRef = useRef(content)

  useEffect(() => {
    const viewer = Editor.factory({
      el: containerRef.current,
      viewer: true,
      initialValue: contentRef.current,
      usageStatistics: false,
    })
    viewerRef.current = viewer
    return () => {
      viewer.destroy()
      viewerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (content !== contentRef.current) {
      contentRef.current = content
      viewerRef.current.setMarkdown(content)
    }
  }, [content])

  return <div ref={containerRef} data-testid="markdown-viewer" className={`text-left ${className}`} />
}

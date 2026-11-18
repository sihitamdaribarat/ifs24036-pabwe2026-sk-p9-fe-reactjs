import { useState } from 'react'
import { IconDeviceFloppy, IconFileText, IconLoader2, IconX } from '@tabler/icons-react'
import MarkdownEditor from '../../../components/MarkdownEditor.jsx'
import { CATEGORIES, createPost, updatePost } from '../api/blogApi.js'
import { showError, showSuccess } from '../../../helpers/toolsHelper.js'

const EMPTY_POST = { title: '', category: 'Umum', excerpt: '', content: '', cover_image_path: '', is_published: false }

const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-accent-900'

// Modal full screen penulisan artikel (buat / edit) dengan Toast UI Editor.
// Prop post: null = artikel baru; tanpa id = draf baru (misal hasil AI); dengan id = edit.
export default function PostModal({ post, onClose, onSaved, isDark }) {
  const isEdit = Boolean(post?.id)
  const [form, setForm] = useState({ ...EMPTY_POST, ...post })
  const [saving, setSaving] = useState(false)

  const setField = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    if (!form.title.trim() || !form.content.trim()) {
      showError('Judul dan konten artikel wajib diisi.', 'Data belum lengkap')
      return
    }

    const payload = {
      title: form.title.trim(),
      category: form.category,
      excerpt: form.excerpt.trim(),
      content: form.content,
      cover_image_path: form.cover_image_path.trim(),
      is_published: form.is_published,
    }

    setSaving(true)
    try {
      const saved = isEdit ? await updatePost(post.id, payload) : await createPost(payload)
      showSuccess(isEdit ? 'Artikel berhasil diperbarui.' : 'Artikel berhasil dibuat.')
      onSaved(saved)
    } catch (err) {
      showError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-2 backdrop-blur-sm sm:p-4" role="dialog" aria-modal="true" aria-labelledby="post-modal-title">
      <div className="flex h-[96vh] w-full max-w-[96vw] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between bg-accent-700 px-5 py-4 text-white">
          <h2 id="post-modal-title" className="flex items-center gap-2 text-lg font-semibold">
            <IconFileText size={22} /> {isEdit ? 'Edit Artikel' : 'Tulis Artikel Baru'}
          </h2>
          <button type="button" onClick={onClose} aria-label="Tutup" className="rounded-lg p-1.5 hover:bg-white/20">
            <IconX size={20} />
          </button>
        </div>

        <div className="grid flex-1 gap-6 overflow-y-auto p-5 lg:grid-cols-[340px_1fr]">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="post-title" className="text-sm font-medium">Judul Artikel</label>
              <input id="post-title" className={inputClass} value={form.title} onChange={setField('title')} maxLength={255} placeholder="Judul yang menarik..." />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="post-category" className="text-sm font-medium">Kategori</label>
              <select id="post-category" className={inputClass} value={form.category} onChange={setField('category')}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="post-excerpt" className="text-sm font-medium">Excerpt (ringkasan 1-2 kalimat)</label>
              <textarea id="post-excerpt" rows={4} className={inputClass} value={form.excerpt} onChange={setField('excerpt')} placeholder="Ringkasan pemikat pembaca..." />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="post-cover" className="text-sm font-medium">URL / Path Gambar Sampul</label>
              <input id="post-cover" className={inputClass} value={form.cover_image_path} onChange={setField('cover_image_path')} placeholder="https://..." />
              {form.cover_image_path && <img src={form.cover_image_path} alt="Pratinjau sampul" className="mt-2 aspect-video w-full rounded-xl object-cover" />}
            </div>
            <label htmlFor="post-published" className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-3.5 dark:border-slate-700">
              <span>
                <span className="block text-sm font-medium">Terbitkan artikel</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{form.is_published ? 'Tampil di halaman publik' : 'Disimpan sebagai draf'}</span>
              </span>
              <input id="post-published" type="checkbox" className="h-5 w-5 accent-accent-600" checked={form.is_published} onChange={setField('is_published')} />
            </label>
          </div>

          <div className="min-w-0">
            <span className="mb-1.5 block text-sm font-medium">Konten (Markdown)</span>
            <MarkdownEditor value={form.content} onChange={(content) => setForm((prev) => ({ ...prev, content }))} dark={isDark} height="calc(96vh - 220px)" />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-100 px-5 py-4 dark:border-slate-700 dark:bg-slate-800">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200">
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-accent-600 px-5 py-2.5 font-semibold text-white hover:bg-accent-700 disabled:opacity-60"
          >
            {saving ? <IconLoader2 size={18} className="animate-spin" /> : <IconDeviceFloppy size={18} />}
            Simpan
          </button>
        </div>
      </div>
    </div>
  )
}

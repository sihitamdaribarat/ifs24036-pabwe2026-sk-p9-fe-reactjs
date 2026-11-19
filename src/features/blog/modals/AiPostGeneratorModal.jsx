import { useState } from 'react'
import { IconAlertTriangle, IconExternalLink, IconLoader2, IconRobot, IconSparkles, IconWorldSearch, IconX } from '@tabler/icons-react'
import MarkdownViewer from '../../../components/MarkdownViewer.jsx'
import { CATEGORIES, generateAiPost } from '../api/blogApi.js'
import { showError } from '../../../helpers/toolsHelper.js'

const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-accent-900'

// Modal full screen AI Blog Generator dengan opsi penelusuran mesin pencari (search engine).
export default function AiPostGeneratorModal({ onClose, onApply }) {
  const [topic, setTopic] = useState('')
  const [category, setCategory] = useState('Teknologi')
  const [tone, setTone] = useState('')
  const [includeWebSearch, setIncludeWebSearch] = useState(true)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  async function handleGenerate(event) {
    event.preventDefault()
    if (!topic.trim()) {
      showError('Topik artikel wajib diisi.', 'Data belum lengkap')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      setResult(await generateAiPost({ topic: topic.trim(), category, tone: tone.trim(), includeWebSearch }))
    } catch (err) {
      showError(err.message, 'Gagal membuat artikel AI')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-2 backdrop-blur-sm sm:p-4" role="dialog" aria-modal="true" aria-labelledby="ai-modal-title">
      <div className="flex h-[96vh] w-full max-w-[96vw] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between bg-gradient-to-r from-violet-700 to-accent-700 px-5 py-4 text-white">
          <h2 id="ai-modal-title" className="flex items-center gap-2 text-lg font-semibold">
            <IconRobot size={22} /> AI Blog Generator
          </h2>
          <button type="button" onClick={onClose} aria-label="Tutup" className="rounded-lg p-1.5 hover:bg-white/20">
            <IconX size={20} />
          </button>
        </div>

        <div className="grid flex-1 gap-6 overflow-y-auto p-5 lg:grid-cols-[360px_1fr]">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="ai-topic" className="text-sm font-medium">Topik Artikel</label>
              <textarea id="ai-topic" rows={4} className={inputClass} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Contoh: Tren kecerdasan buatan di dunia pendidikan Indonesia 2026" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="ai-category" className="text-sm font-medium">Kategori</label>
              <select id="ai-category" className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="ai-tone" className="text-sm font-medium">Gaya Bahasa (opsional)</label>
              <input id="ai-tone" className={inputClass} value={tone} onChange={(e) => setTone(e.target.value)} placeholder="informatif, santai, formal..." />
            </div>
            <label htmlFor="ai-web-search" className="flex cursor-pointer items-start justify-between gap-3 rounded-xl border border-slate-200 p-3.5 dark:border-slate-700">
              <span>
                <span className="flex items-center gap-1.5 text-sm font-medium">
                  <IconWorldSearch size={18} /> Penelusuran Mesin Pencari
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Gunakan fakta & tren terkini dari web sebagai rujukan.</span>
              </span>
              <input id="ai-web-search" type="checkbox" className="mt-1 h-5 w-5 accent-accent-600" checked={includeWebSearch} onChange={(e) => setIncludeWebSearch(e.target.checked)} />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 font-semibold text-white shadow-lg shadow-violet-600/25 hover:bg-violet-700 disabled:opacity-60"
            >
              {loading ? <IconLoader2 size={18} className="animate-spin" /> : <IconSparkles size={18} />}
              {loading ? 'Sedang membuat...' : 'Generate Artikel'}
            </button>
          </form>

          <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
            {loading && (
              <div className="flex h-full min-h-64 flex-col items-center justify-center text-center text-slate-500 dark:text-slate-400">
                <IconLoader2 size={40} className="mb-3 animate-spin text-violet-600" />
                <p className="font-medium">{includeWebSearch ? 'Menelusuri mesin pencari & menyusun artikel...' : 'AI sedang menyusun artikel...'}</p>
              </div>
            )}

            {!loading && !result && (
              <div className="flex h-full min-h-64 flex-col items-center justify-center text-center text-slate-500 dark:text-slate-400">
                <IconRobot size={48} className="mb-3 text-slate-400" />
                <p className="font-medium">Pratinjau artikel AI akan tampil di sini.</p>
                <p className="text-sm">Isi topik lalu klik &quot;Generate Artikel&quot;.</p>
              </div>
            )}

            {result && (
              <div className="space-y-5">
                {result.search_warning && (
                  <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                    <IconAlertTriangle size={18} className="shrink-0" /> {result.search_warning}
                  </div>
                )}
                <div>
                  <span className="rounded-full bg-accent-100 px-3 py-1 text-xs font-semibold text-accent-700 dark:bg-accent-900/50 dark:text-accent-200">{result.category}</span>
                  <h3 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">{result.title}</h3>
                  <p className="mt-2 text-slate-600 dark:text-slate-400">{result.excerpt}</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                  <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                    <IconWorldSearch size={16} /> Sumber Rujukan Mesin Pencari
                  </h4>
                  {result.sources.length > 0 ? (
                    <ol className="list-decimal space-y-1.5 pl-5 text-sm">
                      {result.sources.map((source) => (
                        <li key={source.url}>
                          <a href={source.url} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 text-accent-600 hover:underline dark:text-accent-400">
                            {source.title} <IconExternalLink size={14} />
                          </a>
                          {source.snippet && <p className="text-xs text-slate-500 dark:text-slate-400">{source.snippet}</p>}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">Tidak ada sumber web yang digunakan.</p>
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                  <MarkdownViewer content={result.content} />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 bg-violet-50 px-5 py-4 dark:border-slate-700 dark:bg-slate-800">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200">
            Batal
          </button>
          <button
            type="button"
            onClick={() => onApply(result)}
            disabled={!result}
            className="inline-flex items-center gap-2 rounded-xl bg-accent-600 px-5 py-2.5 font-semibold text-white hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <IconSparkles size={18} /> Simpan ke Editor
          </button>
        </div>
      </div>
    </div>
  )
}

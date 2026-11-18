import { useCallback, useEffect, useState } from 'react'
import { IconDotsVertical, IconEye, IconPencil, IconPlus, IconRobot, IconSearch, IconTrash } from '@tabler/icons-react'
import PostStats from './PostStats.jsx'
import PostModal from '../modals/PostModal.jsx'
import AiPostGeneratorModal from '../modals/AiPostGeneratorModal.jsx'
import { deletePost, getMyPosts, getMyStats, togglePublish } from '../api/blogApi.js'
import { formatDateTime, readingTimeLabel, showConfirm, showError, showSuccess } from '../../../helpers/toolsHelper.js'

const CLOSED_MODAL = { open: false, post: null }

// Ruang kerja penulis (Full Width Workspace): statistik, tabel artikel dengan menu kebab,
// switch status terbit/draf, modal editor dan AI generator.
export default function AuthorDashboard({ user, onNavigate, isDark }) {
  const [posts, setPosts] = useState([])
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0 })
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [menuId, setMenuId] = useState(null)
  const [postModal, setPostModal] = useState(CLOSED_MODAL)
  const [aiOpen, setAiOpen] = useState(false)

  const load = useCallback(async () => {
    try {
      const [myPosts, myStats] = await Promise.all([getMyPosts(), getMyStats()])
      setPosts(myPosts)
      setStats(myStats)
    } catch (err) {
      showError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleToggle(post) {
    try {
      const updated = await togglePublish(post.id)
      showSuccess(updated.is_published ? 'Artikel berhasil diterbitkan.' : 'Artikel dikembalikan ke draf.')
      await load()
    } catch (err) {
      showError(err.message)
    }
  }

  async function handleDelete(post) {
    setMenuId(null)
    const confirmed = await showConfirm(`Artikel "${post.title}" akan dihapus permanen.`, 'Hapus artikel?', 'Ya, hapus')
    if (!confirmed) return
    try {
      await deletePost(post.id)
      showSuccess('Artikel berhasil dihapus.')
      await load()
    } catch (err) {
      showError(err.message)
    }
  }

  function viewPublic(post) {
    setMenuId(null)
    onNavigate(`/posts/${post.slug}`)
  }

  function openEditor(post) {
    setMenuId(null)
    setPostModal({ open: true, post })
  }

  function handleSaved() {
    setPostModal(CLOSED_MODAL)
    load()
  }

  function handleAiApply(article) {
    setAiOpen(false)
    setPostModal({
      open: true,
      post: { title: article.title, category: article.category, excerpt: article.excerpt, content: article.content, is_published: false },
    })
  }

  const keyword = query.trim().toLowerCase()
  const visiblePosts = posts.filter((p) => `${p.title} ${p.category}`.toLowerCase().includes(keyword))

  return (
    <div className="w-full space-y-6 px-4 py-8 sm:px-6 lg:px-10">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium text-accent-600 dark:text-accent-400">Workspace Penulis</p>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Halo, {user.name} 👋</h1>
          <p className="text-slate-500 dark:text-slate-400">Kelola artikel, draf, dan buat konten baru dengan bantuan AI.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setAiOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 font-semibold text-white shadow-lg shadow-violet-600/25 hover:bg-violet-700"
          >
            <IconRobot size={18} /> AI Generator
          </button>
          <button
            type="button"
            onClick={() => openEditor(null)}
            className="inline-flex items-center gap-2 rounded-xl bg-accent-600 px-4 py-2.5 font-semibold text-white shadow-lg shadow-accent-600/25 hover:bg-accent-700"
          >
            <IconPlus size={18} /> Tambah Artikel
          </button>
        </div>
      </div>

      <PostStats stats={stats} />

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Daftar Artikel Saya</h2>
          <div className="relative w-full sm:w-80">
            <IconSearch size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari judul atau kategori..."
              aria-label="Cari artikel saya"
              className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-10 pr-3 text-sm outline-none focus:border-accent-500 dark:border-slate-700 dark:bg-slate-950"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Judul</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Waktu Baca</th>
                <th className="px-4 py-3">Diperbarui</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                    Memuat artikel...
                  </td>
                </tr>
              )}
              {!loading && visiblePosts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500 dark:text-slate-400">
                    Belum ada artikel. Klik &quot;Tambah Artikel&quot; atau &quot;AI Generator&quot; untuk mulai menulis.
                  </td>
                </tr>
              )}
              {visiblePosts.map((post) => (
                <tr key={post.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="max-w-md px-4 py-3">
                    <p className="truncate font-semibold text-slate-900 dark:text-white">{post.title}</p>
                    <p className="truncate text-xs text-slate-400">/{post.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium dark:bg-slate-800">{post.category}</span>
                  </td>
                  <td className="px-4 py-3">
                    <label className="inline-flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        role="switch"
                        className="peer sr-only"
                        checked={post.is_published}
                        onChange={() => handleToggle(post)}
                        aria-label={`Status terbit ${post.title}`}
                      />
                      <span className="relative h-6 w-11 rounded-full bg-slate-300 transition after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:bg-emerald-500 peer-checked:after:translate-x-5 dark:bg-slate-700" />
                      <span className={`text-xs font-semibold ${post.is_published ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {post.is_published ? 'Terbit' : 'Draf'}
                      </span>
                    </label>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{readingTimeLabel(post.reading_time)}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDateTime(post.updated_at)}</td>
                  <td className="relative px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setMenuId(menuId === post.id ? null : post.id)}
                      aria-label={`Menu aksi ${post.title}`}
                      aria-expanded={menuId === post.id}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <IconDotsVertical size={18} />
                    </button>
                    {menuId === post.id && (
                      <div role="menu" className="absolute right-4 top-11 z-20 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-left shadow-xl dark:border-slate-700 dark:bg-slate-900">
                        <button type="button" role="menuitem" onClick={() => openEditor(post)} className="flex w-full items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800">
                          <IconPencil size={16} /> Edit
                        </button>
                        {post.is_published && (
                          <button type="button" role="menuitem" onClick={() => viewPublic(post)} className="flex w-full items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800">
                            <IconEye size={16} /> Lihat Publik
                          </button>
                        )}
                        <button type="button" role="menuitem" onClick={() => handleDelete(post)} className="flex w-full items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40">
                          <IconTrash size={16} /> Hapus
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {postModal.open && <PostModal post={postModal.post} onClose={() => setPostModal(CLOSED_MODAL)} onSaved={handleSaved} isDark={isDark} />}
      {aiOpen && <AiPostGeneratorModal onClose={() => setAiOpen(false)} onApply={handleAiApply} />}
    </div>
  )
}

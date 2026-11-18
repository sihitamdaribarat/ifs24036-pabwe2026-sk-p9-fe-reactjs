import { useEffect, useState } from 'react'
import { IconArticle, IconCircleCheck, IconEye, IconFilterOff, IconSearch, IconUsers } from '@tabler/icons-react'
import { getAllPosts, getUserPosts, getUsers } from '../api/adminApi.js'
import { formatDate, showError } from '../../../helpers/toolsHelper.js'

function SummaryCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <span className={`grid h-12 w-12 place-items-center rounded-xl ${tone}`}>
        <Icon size={24} />
      </span>
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  )
}

const th = 'px-4 py-3'
const td = 'px-4 py-3'

// Panel Administrasi (Full Width): monitoring seluruh pengguna dan artikel dalam sistem.
export default function AdminDashboard({ onNavigate }) {
  const [users, setUsers] = useState([])
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [userPosts, setUserPosts] = useState([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    Promise.all([getUsers(), getAllPosts()])
      .then(([allUsers, allPosts]) => {
        setUsers(allUsers)
        setPosts(allPosts)
      })
      .catch((err) => showError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function selectUser(user) {
    try {
      setUserPosts(await getUserPosts(user.id))
      setSelectedUser(user)
    } catch (err) {
      showError(err.message)
    }
  }

  const keyword = query.trim().toLowerCase()
  const source = selectedUser ? userPosts : posts
  const visiblePosts = source.filter((p) => `${p.title} ${p.author.username} ${p.category}`.toLowerCase().includes(keyword))
  const publishedCount = posts.filter((p) => p.is_published).length

  return (
    <div className="w-full space-y-6 px-4 py-8 sm:px-6 lg:px-10">
      <div>
        <p className="text-sm font-medium text-accent-600 dark:text-accent-400">Panel Administrasi</p>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Monitoring Sistem</h1>
        <p className="text-slate-500 dark:text-slate-400">Pantau seluruh pengguna dan arsip artikel dari semua penulis.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard icon={IconUsers} label="Total Pengguna" value={users.length} tone="bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-200" />
        <SummaryCard icon={IconArticle} label="Total Artikel" value={posts.length} tone="bg-accent-100 text-accent-700 dark:bg-accent-900/50 dark:text-accent-200" />
        <SummaryCard icon={IconCircleCheck} label="Artikel Terbit" value={publishedCount} tone="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200" />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="border-b border-slate-200 p-4 text-lg font-semibold text-slate-900 dark:border-slate-800 dark:text-white">Direktori Pengguna</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
              <tr>
                <th className={th}>ID</th>
                <th className={th}>Username</th>
                <th className={th}>Nama</th>
                <th className={th}>Email</th>
                <th className={th}>Role</th>
                <th className={th}>Total Artikel</th>
                <th className={th}>Total Terbit</th>
                <th className={`${th} text-right`}>Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                    Memuat data...
                  </td>
                </tr>
              )}
              {users.map((user) => (
                <tr key={user.id} className={selectedUser?.id === user.id ? 'bg-accent-50 dark:bg-accent-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}>
                  <td className={td}>{user.id}</td>
                  <td className={`${td} font-semibold text-slate-900 dark:text-white`}>@{user.username}</td>
                  <td className={td}>{user.name}</td>
                  <td className={td}>{user.email}</td>
                  <td className={td}>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        user.role === 'admin' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-200' : 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-200'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className={td}>{user.total_posts}</td>
                  <td className={td}>{user.published_posts}</td>
                  <td className={`${td} text-right`}>
                    <button type="button" onClick={() => selectUser(user)} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-accent-600 hover:bg-accent-50 dark:text-accent-400 dark:hover:bg-accent-900/30">
                      Lihat Artikel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{selectedUser ? `Artikel milik @${selectedUser.username}` : 'Arsip Seluruh Artikel'}</h2>
            {selectedUser && (
              <button type="button" onClick={() => setSelectedUser(null)} className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium hover:bg-slate-200 dark:bg-slate-800">
                <IconFilterOff size={14} /> Tampilkan semua
              </button>
            )}
          </div>
          <div className="relative w-full sm:w-80">
            <IconSearch size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari judul, penulis, kategori..."
              aria-label="Cari artikel sistem"
              className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-10 pr-3 text-sm outline-none focus:border-accent-500 dark:border-slate-700 dark:bg-slate-950"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
              <tr>
                <th className={th}>ID</th>
                <th className={th}>Judul</th>
                <th className={th}>Penulis</th>
                <th className={th}>Kategori</th>
                <th className={th}>Status</th>
                <th className={th}>Diperbarui</th>
                <th className={`${th} text-right`}>Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {!loading && visiblePosts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                    Tidak ada artikel.
                  </td>
                </tr>
              )}
              {visiblePosts.map((post) => (
                <tr key={post.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className={td}>{post.id}</td>
                  <td className={`${td} max-w-sm truncate font-semibold text-slate-900 dark:text-white`}>{post.title}</td>
                  <td className={td}>@{post.author.username}</td>
                  <td className={td}>{post.category}</td>
                  <td className={td}>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        post.is_published ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-200'
                      }`}
                    >
                      {post.is_published ? 'Terbit' : 'Draf'}
                    </span>
                  </td>
                  <td className={td}>{formatDate(post.updated_at)}</td>
                  <td className={`${td} text-right`}>
                    {post.is_published && (
                      <button
                        type="button"
                        onClick={() => onNavigate(`/posts/${post.slug}`)}
                        aria-label={`Baca ${post.title}`}
                        className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-accent-600 hover:bg-accent-50 dark:text-accent-400 dark:hover:bg-accent-900/30"
                      >
                        <IconEye size={14} /> Baca
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

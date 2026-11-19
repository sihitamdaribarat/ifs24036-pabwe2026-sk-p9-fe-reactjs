import { useEffect, useState } from 'react'
import { IconArticleOff, IconCalendar, IconClock, IconPencilPlus, IconSearch, IconSparkles } from '@tabler/icons-react'
import { getCategories, getPublicPosts } from '../api/blogApi.js'
import { formatDate, initials, readingTimeLabel } from '../../../helpers/toolsHelper.js'

export const SEARCH_DEBOUNCE_MS = 350

const pillClass = (active) =>
  `whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition ${
    active
      ? 'border-accent-600 bg-accent-600 text-white shadow-md shadow-accent-600/25'
      : 'border-slate-200 bg-white text-slate-600 hover:border-accent-400 hover:text-accent-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
  }`

function ArticleCard({ post, onNavigate }) {
  const href = `/posts/${post.slug}`
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
      <a
        href={href}
        onClick={(event) => {
          event.preventDefault()
          onNavigate(href)
        }}
        className="flex flex-1 flex-col"
      >
        {post.cover_image_path ? (
          <img src={post.cover_image_path} alt={post.title} loading="lazy" className="aspect-[16/9] w-full object-cover" />
        ) : (
          <div className="grid aspect-[16/9] w-full place-items-center bg-gradient-to-br from-accent-500 to-accent-900 text-5xl font-black text-white">
            {initials(post.title)}
          </div>
        )}
        <div className="flex flex-1 flex-col p-5">
          <span className="mb-3 w-fit rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700 dark:bg-accent-900/40 dark:text-accent-200">
            {post.category}
          </span>
          <h2 className="line-clamp-2 text-lg font-bold text-slate-900 group-hover:text-accent-700 dark:text-white dark:group-hover:text-accent-300">
            {post.title}
          </h2>
          <p className="mt-2 line-clamp-3 flex-1 text-sm text-slate-600 dark:text-slate-400">{post.excerpt || 'Baca selengkapnya artikel ini.'}</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-300">{post.author.name}</span>
            <span className="inline-flex items-center gap-1">
              <IconCalendar size={14} /> {formatDate(post.published_at)}
            </span>
            <span className="inline-flex items-center gap-1">
              <IconClock size={14} /> {readingTimeLabel(post.reading_time)}
            </span>
          </div>
        </div>
      </a>
    </article>
  )
}

// Beranda publik: galeri artikel terbit, live search dan filter pill kategori.
export default function PublicArticleList({ user, onNavigate }) {
  const [categories, setCategories] = useState([])
  const [category, setCategory] = useState('')
  const [q, setQ] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [result, setResult] = useState({ key: null, posts: [], error: '' })

  useEffect(() => {
    getCategories().then(setCategories, () => setCategories([]))
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(q.trim()), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [q])

  // Loading diturunkan dari kunci request: true selama hasil untuk filter aktif belum tiba.
  const requestKey = `${debouncedQ}|${category}`
  const loading = result.key !== requestKey
  const { posts, error } = result

  useEffect(() => {
    let active = true
    getPublicPosts({ q: debouncedQ, category })
      .then(
        (data) => ({ key: requestKey, posts: data, error: '' }),
        (err) => ({ key: requestKey, posts: [], error: err.message }),
      )
      .then((next) => {
        if (active) setResult(next)
      })
    return () => {
      active = false
    }
  }, [debouncedQ, category, requestKey])

  return (
    <div className="w-full">
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-accent-50 via-white to-white px-4 py-14 dark:border-slate-800 dark:from-accent-900/30 dark:via-slate-950 dark:to-slate-950 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-accent-700 shadow-sm ring-1 ring-accent-100 dark:bg-slate-900 dark:text-accent-300 dark:ring-accent-900">
            <IconSparkles size={14} /> Platform blog dengan AI & Search Engine
          </span>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Cerita, ide & wawasan dari <span className="text-accent-600 dark:text-accent-400">para penulis</span>
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Jelajahi artikel terbaru seputar teknologi, pendidikan, gaya hidup, bisnis dan opini.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {user ? (
              <button type="button" onClick={() => onNavigate('/author')} className="inline-flex items-center gap-2 rounded-xl bg-accent-600 px-5 py-2.5 font-semibold text-white shadow-lg shadow-accent-600/25 hover:bg-accent-700">
                <IconPencilPlus size={18} /> Buka Workspace
              </button>
            ) : (
              <>
                <button type="button" onClick={() => onNavigate('/register')} className="inline-flex items-center gap-2 rounded-xl bg-accent-600 px-5 py-2.5 font-semibold text-white shadow-lg shadow-accent-600/25 hover:bg-accent-700">
                  <IconPencilPlus size={18} /> Mulai Menulis
                </button>
                <button type="button" onClick={() => onNavigate('/login')} className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                  Login
                </button>
              </>
            )}
          </div>

          <div className="relative mx-auto mt-8 max-w-xl">
            <IconSearch size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Cari artikel berdasarkan kata kunci..."
              aria-label="Cari artikel"
              className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-slate-900 shadow-lg shadow-slate-200/50 outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:shadow-none dark:focus:ring-accent-900"
            />
          </div>
        </div>
      </section>

      <section className="w-full px-4 py-8 sm:px-6 lg:px-10">
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2" role="group" aria-label="Filter kategori">
          <button type="button" onClick={() => setCategory('')} className={pillClass(category === '')} aria-pressed={category === ''}>
            Semua
          </button>
          {categories.map((name) => (
            <button key={name} type="button" onClick={() => setCategory(name)} className={pillClass(category === name)} aria-pressed={category === name}>
              {name}
            </button>
          ))}
        </div>

        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-label="Memuat artikel">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-80 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
            {error}
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 py-16 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
            <IconArticleOff size={48} className="mb-3 text-slate-400" />
            <p className="font-semibold">Belum ada artikel yang cocok.</p>
            <p className="text-sm">Coba kata kunci atau kategori lain.</p>
          </div>
        )}

        {!loading && posts.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {posts.map((post) => (
              <ArticleCard key={post.id} post={post} onNavigate={onNavigate} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { IconArrowLeft, IconCalendar, IconClock, IconMoodSad } from '@tabler/icons-react'
import MarkdownViewer from '../../../components/MarkdownViewer.jsx'
import { getPublicPost } from '../api/blogApi.js'
import { formatDate, initials, readingTimeLabel } from '../../../helpers/toolsHelper.js'

// Halaman baca artikel publik (Full Width Layout) dengan render Markdown dan reading time.
// Dirender dengan key={slug} sehingga state otomatis ter-reset saat slug berganti.
export default function PublicArticleDetail({ slug, onNavigate }) {
  const [state, setState] = useState({ loading: true, post: null, error: '' })

  useEffect(() => {
    let active = true
    getPublicPost(slug)
      .then(
        (post) => ({ loading: false, post, error: '' }),
        (err) => ({ loading: false, post: null, error: err.message }),
      )
      .then((next) => {
        if (active) setState(next)
      })
    return () => {
      active = false
    }
  }, [slug])

  const backButton = (
    <button type="button" onClick={() => onNavigate('/')} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-accent-600 dark:text-slate-400">
      <IconArrowLeft size={18} /> Kembali ke daftar artikel
    </button>
  )

  if (state.loading) {
    return (
      <div className="w-full animate-pulse space-y-4 px-4 py-10 sm:px-6 lg:px-16" aria-label="Memuat artikel">
        <div className="h-6 w-32 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-12 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-72 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </div>
    )
  }

  if (state.error) {
    return (
      <div className="flex w-full flex-col items-center px-4 py-20 text-center">
        <IconMoodSad size={56} className="mb-4 text-slate-400" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Artikel tidak ditemukan</h1>
        <p className="mb-6 mt-2 text-slate-500 dark:text-slate-400">{state.error}</p>
        {backButton}
      </div>
    )
  }

  const { post } = state
  return (
    <article className="w-full px-4 py-8 sm:px-6 lg:px-16">
      {backButton}

      <header className="mt-6 border-b border-slate-200 pb-8 dark:border-slate-800">
        <span className="rounded-full bg-accent-50 px-3 py-1 text-sm font-semibold text-accent-700 dark:bg-accent-900/40 dark:text-accent-200">
          {post.category}
        </span>
        <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">{post.title}</h1>
        {post.excerpt && <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 lg:text-xl">{post.excerpt}</p>}

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-accent-600 font-bold text-white">{initials(post.author.name)}</span>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">{post.author.name}</p>
              <p className="text-xs">@{post.author.username}</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5">
            <IconCalendar size={16} /> {formatDate(post.published_at)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <IconClock size={16} /> {readingTimeLabel(post.reading_time)}
          </span>
        </div>
      </header>

      {post.cover_image_path && (
        <img src={post.cover_image_path} alt={post.title} className="mt-8 max-h-[32rem] w-full rounded-2xl object-cover shadow-lg" />
      )}

      <div className="article-content mt-8">
        <MarkdownViewer content={post.content} />
      </div>
    </article>
  )
}

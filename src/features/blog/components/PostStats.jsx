import { IconCircleCheck, IconFiles, IconPencil } from '@tabler/icons-react'

const CARDS = [
  { key: 'total', label: 'Total Artikel', icon: IconFiles, tone: 'bg-accent-100 text-accent-700 dark:bg-accent-900/50 dark:text-accent-200' },
  { key: 'published', label: 'Total Selesai / Terbit', icon: IconCircleCheck, tone: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200' },
  { key: 'draft', label: 'Belum Selesai / Draf', icon: IconPencil, tone: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-200' },
]

// 3 kartu statistik artikel penulis (Total, Terbit, Draf).
export default function PostStats({ stats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {CARDS.map(({ key, label, icon: Icon, tone }) => (
        <div key={key} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className={`grid h-12 w-12 place-items-center rounded-xl ${tone}`}>
            <Icon size={24} />
          </span>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white" data-testid={`stat-${key}`}>
              {stats[key]}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

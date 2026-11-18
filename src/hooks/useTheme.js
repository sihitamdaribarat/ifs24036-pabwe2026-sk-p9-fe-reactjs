import { useCallback, useEffect, useState } from 'react'

export const ACCENTS = ['indigo', 'emerald', 'rose', 'amber']
const THEME_KEY = 'delcom_blog_theme'
const ACCENT_KEY = 'delcom_blog_accent'

function initialTheme() {
  const saved = localStorage.getItem(THEME_KEY)
  if (saved === 'dark' || saved === 'light') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function initialAccent() {
  const saved = localStorage.getItem(ACCENT_KEY)
  return ACCENTS.includes(saved) ? saved : ACCENTS[0]
}

// Custom hook tema dark/light & warna aksen; disimpan di localStorage dan
// diterapkan ke <html class="dark" data-accent="...">.
export default function useTheme() {
  const [theme, setTheme] = useState(initialTheme)
  const [accent, setAccentState] = useState(initialAccent)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.dataset.accent = accent
    localStorage.setItem(ACCENT_KEY, accent)
  }, [accent])

  const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])
  const setAccent = useCallback((value) => {
    if (ACCENTS.includes(value)) setAccentState(value)
  }, [])

  return { theme, isDark: theme === 'dark', toggleTheme, accent, setAccent }
}

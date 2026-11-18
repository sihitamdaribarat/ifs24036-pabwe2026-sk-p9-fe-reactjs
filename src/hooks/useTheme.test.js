import { act, renderHook } from '@testing-library/react'
import useTheme, { ACCENTS } from './useTheme.js'

function mockPrefersDark(matches) {
  vi.spyOn(window, 'matchMedia').mockReturnValue({ matches })
}

describe('useTheme', () => {
  afterEach(() => {
    document.documentElement.classList.remove('dark')
  })

  it('mengikuti preferensi sistem (terang)', () => {
    mockPrefersDark(false)
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('light')
    expect(result.current.isDark).toBe(false)
    expect(result.current.accent).toBe(ACCENTS[0])
    expect(document.documentElement.dataset.accent).toBe('indigo')
  })

  it('mengikuti preferensi sistem (gelap)', () => {
    mockPrefersDark(true)
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('membaca tema & aksen tersimpan', () => {
    localStorage.setItem('delcom_blog_theme', 'light')
    localStorage.setItem('delcom_blog_accent', 'rose')
    mockPrefersDark(true)
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('light')
    expect(result.current.accent).toBe('rose')

    localStorage.setItem('delcom_blog_theme', 'dark')
    localStorage.setItem('delcom_blog_accent', 'tidak-valid')
    const second = renderHook(() => useTheme())
    expect(second.result.current.theme).toBe('dark')
    expect(second.result.current.accent).toBe('indigo')
  })

  it('toggleTheme dan setAccent', () => {
    mockPrefersDark(false)
    const { result } = renderHook(() => useTheme())

    act(() => result.current.toggleTheme())
    expect(result.current.theme).toBe('dark')
    expect(localStorage.getItem('delcom_blog_theme')).toBe('dark')

    act(() => result.current.toggleTheme())
    expect(result.current.theme).toBe('light')

    act(() => result.current.setAccent('emerald'))
    expect(result.current.accent).toBe('emerald')
    expect(localStorage.getItem('delcom_blog_accent')).toBe('emerald')

    act(() => result.current.setAccent('ungu'))
    expect(result.current.accent).toBe('emerald')
  })
})

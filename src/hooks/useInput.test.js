import { act, renderHook } from '@testing-library/react'
import useInput from './useInput.js'

describe('useInput', () => {
  it('menggunakan nilai awal default kosong', () => {
    const { result } = renderHook(() => useInput())
    expect(result.current[0]).toBe('')
  })

  it('memperbarui nilai lewat onChange dan setValue', () => {
    const { result } = renderHook(() => useInput('awal'))
    expect(result.current[0]).toBe('awal')

    act(() => result.current[1]({ target: { value: 'baru' } }))
    expect(result.current[0]).toBe('baru')

    act(() => result.current[2]('manual'))
    expect(result.current[0]).toBe('manual')
  })
})

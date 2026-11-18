import Swal from 'sweetalert2'
import { formatDate, formatDateTime, initials, readingTimeLabel, showConfirm, showError, showSuccess } from './toolsHelper.js'

vi.mock('sweetalert2', () => ({ default: { fire: vi.fn() } }))

describe('dialog SweetAlert2', () => {
  it('showSuccess dengan judul default & kustom', () => {
    showSuccess('Tersimpan')
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ icon: 'success', title: 'Berhasil', text: 'Tersimpan' }))
    showSuccess('Tersimpan', 'Mantap')
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ title: 'Mantap' }))
  })

  it('showError dengan judul default & kustom', () => {
    showError('Gagal')
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ icon: 'error', title: 'Terjadi Kesalahan', text: 'Gagal' }))
    showError('Gagal', 'Oops')
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ title: 'Oops' }))
  })

  it('showConfirm mengembalikan isConfirmed', async () => {
    Swal.fire.mockResolvedValueOnce({ isConfirmed: true })
    await expect(showConfirm('Hapus?')).resolves.toBe(true)
    expect(Swal.fire).toHaveBeenLastCalledWith(
      expect.objectContaining({ title: 'Apakah Anda yakin?', confirmButtonText: 'Ya, lanjutkan', showCancelButton: true }),
    )

    Swal.fire.mockResolvedValueOnce({ isConfirmed: false })
    await expect(showConfirm('Hapus?', 'Judul', 'Ya, hapus')).resolves.toBe(false)
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ title: 'Judul', confirmButtonText: 'Ya, hapus' }))
  })
})

describe('format tanggal & teks', () => {
  it('formatDate', () => {
    expect(formatDate('2026-11-18T09:00:00Z')).toMatch(/2026/)
    expect(formatDate(null)).toBe('-')
    expect(formatDate('bukan tanggal')).toBe('-')
  })

  it('formatDateTime', () => {
    expect(formatDateTime('2026-11-18T09:00:00Z')).toMatch(/2026/)
    expect(formatDateTime(undefined)).toBe('-')
  })

  it('readingTimeLabel', () => {
    expect(readingTimeLabel(5)).toBe('5 menit baca')
    expect(readingTimeLabel(0)).toBe('1 menit baca')
    expect(readingTimeLabel(undefined)).toBe('1 menit baca')
  })

  it('initials', () => {
    expect(initials('budi santoso wijaya')).toBe('BS')
    expect(initials('Admin')).toBe('A')
    expect(initials('')).toBe('?')
    expect(initials('   ')).toBe('?')
  })
})

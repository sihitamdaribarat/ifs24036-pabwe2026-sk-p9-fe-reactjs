// Dialog notifikasi SweetAlert2 & utilitas format tanggal.
// SweetAlert2 dimuat saat pertama kali dialog dibutuhkan (dynamic import) agar tidak
// membebani unduhan JavaScript awal halaman.
const fire = (options) => import('sweetalert2').then(({ default: Swal }) => Swal.fire(options))

export function showSuccess(message, title = 'Berhasil') {
  return fire({ icon: 'success', title, text: message, timer: 1800, showConfirmButton: false })
}

export function showError(message, title = 'Terjadi Kesalahan') {
  return fire({ icon: 'error', title, text: message, confirmButtonColor: '#e11d48' })
}

export async function showConfirm(message, title = 'Apakah Anda yakin?', confirmText = 'Ya, lanjutkan') {
  const result = await fire({
    icon: 'warning',
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Batal',
    confirmButtonColor: '#e11d48',
    reverseButtons: true,
  })
  return result.isConfirmed
}

function toDate(value) {
  const date = new Date(value)
  return value && !Number.isNaN(date.getTime()) ? date : null
}

// Contoh: "18 November 2026"
export function formatDate(value) {
  const date = toDate(value)
  return date ? date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'
}

// Contoh: "18 Nov 2026, 09.30"
export function formatDateTime(value) {
  const date = toDate(value)
  return date
    ? date.toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '-'
}

export function readingTimeLabel(minutes) {
  return `${Math.max(1, Number(minutes) || 1)} menit baca`
}

export function initials(name) {
  return (
    String(name || '?')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('') || '?'
  )
}

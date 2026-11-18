import { IconLogin2, IconX } from '@tabler/icons-react'
import { AuthForm } from '../components/AuthPage.jsx'

// Modal login cepat dari navbar halaman publik (input id="login-username").
export default function AuthModal({ isOpen, onClose, onLoginSuccess, onNavigate }) {
  if (!isOpen) return null

  function handleSwitch() {
    onClose()
    onNavigate('/register')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between bg-accent-600 px-6 py-4 text-white">
          <h2 id="auth-modal-title" className="flex items-center gap-2 text-lg font-semibold">
            <IconLogin2 size={20} /> Masuk ke Delcom Blog
          </h2>
          <button type="button" onClick={onClose} aria-label="Tutup" className="rounded-lg p-1 hover:bg-white/20">
            <IconX size={20} />
          </button>
        </div>
        <div className="p-6">
          <AuthForm mode="login" onLoginSuccess={onLoginSuccess} onSwitchMode={handleSwitch} />
        </div>
      </div>
    </div>
  )
}

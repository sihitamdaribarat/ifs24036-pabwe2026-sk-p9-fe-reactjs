import { useState } from 'react'
import { IconArrowLeft, IconLoader2, IconLogin2, IconSparkles, IconUserPlus } from '@tabler/icons-react'
import useInput from '../../../hooks/useInput.js'
import { showSuccess } from '../../../helpers/toolsHelper.js'
import { login, register } from '../api/authApi.js'

const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-accent-500 focus:ring-4 focus:ring-accent-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-accent-900'

function Field({ id, label, children }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      {children}
    </div>
  )
}

// Form login / register yang dipakai bersama oleh AuthPage dan AuthModal.
export function AuthForm({ mode, onLoginSuccess, onSwitchMode }) {
  const isLogin = mode === 'login'
  const [name, onNameChange] = useInput('')
  const [username, onUsernameChange] = useInput('')
  const [email, onEmailChange] = useInput('')
  const [password, onPasswordChange] = useInput('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isLogin) {
        const data = await login(username.trim(), password)
        onLoginSuccess(data)
      } else {
        await register({ name: name.trim(), username: username.trim(), email: email.trim(), password })
        showSuccess('Akun berhasil dibuat. Silakan login.', 'Registrasi Berhasil')
        onSwitchMode('login')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const prefix = isLogin ? 'login' : 'register'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300">
          {error}
        </div>
      )}

      {!isLogin && (
        <Field id="register-name" label="Nama Lengkap">
          <input id="register-name" className={inputClass} value={name} onChange={onNameChange} required maxLength={100} placeholder="Budi Santoso" />
        </Field>
      )}

      <Field id={`${prefix}-username`} label={isLogin ? 'Username atau Email' : 'Username'}>
        <input
          id={`${prefix}-username`}
          className={inputClass}
          value={username}
          onChange={onUsernameChange}
          required
          autoComplete="username"
          placeholder={isLogin ? 'admin' : 'budi'}
          pattern={isLogin ? undefined : '[A-Za-z0-9]{3,50}'}
          title={isLogin ? undefined : 'Username 3-50 karakter huruf/angka tanpa spasi'}
        />
      </Field>

      {!isLogin && (
        <Field id="register-email" label="Email">
          <input id="register-email" type="email" className={inputClass} value={email} onChange={onEmailChange} required placeholder="budi@example.com" />
        </Field>
      )}

      <Field id={`${prefix}-password`} label="Password">
        <input
          id={`${prefix}-password`}
          type="password"
          className={inputClass}
          value={password}
          onChange={onPasswordChange}
          required
          minLength={isLogin ? undefined : 6}
          autoComplete={isLogin ? 'current-password' : 'new-password'}
          placeholder="••••••••"
        />
      </Field>

      <button
        id={`${prefix}-submit`}
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-600 px-4 py-3 font-semibold text-white shadow-lg shadow-accent-600/25 transition hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? <IconLoader2 size={18} className="animate-spin" /> : isLogin ? <IconLogin2 size={18} /> : <IconUserPlus size={18} />}
        {isLogin ? 'Masuk' : 'Daftar Sekarang'}
      </button>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        {isLogin ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
        <button type="button" onClick={() => onSwitchMode(isLogin ? 'register' : 'login')} className="font-semibold text-accent-600 hover:underline dark:text-accent-400">
          {isLogin ? 'Daftar sebagai penulis' : 'Masuk di sini'}
        </button>
      </p>
    </form>
  )
}

// Halaman login / register mandiri (/login, /register).
export default function AuthPage({ mode, onNavigate, onLoginSuccess }) {
  const isLogin = mode === 'login'

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 md:grid-cols-2">
        <div className="hidden flex-col justify-between bg-gradient-to-br from-accent-600 to-accent-900 p-10 text-white md:flex">
          <div className="flex items-center gap-2 text-lg font-bold">
            <IconSparkles /> Delcom Blog
          </div>
          <div>
            <h2 className="text-3xl font-bold leading-tight">
              {isLogin ? 'Selamat datang kembali, Penulis!' : 'Mulai perjalanan menulis Anda.'}
            </h2>
            <p className="mt-4 text-accent-100">
              Tulis artikel Markdown, kelola draf, dan hasilkan ide tulisan dengan AI Blog Generator yang terhubung ke mesin pencari.
            </p>
          </div>
          <p className="text-sm text-accent-200">© 2026 Delcom Blog</p>
        </div>

        <div className="p-8 sm:p-10">
          <button type="button" onClick={() => onNavigate('/')} className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-accent-600 dark:text-slate-400">
            <IconArrowLeft size={16} /> Kembali ke beranda
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{isLogin ? 'Masuk ke Akun' : 'Daftar Akun Penulis'}</h1>
          <p className="mb-6 mt-1 text-sm text-slate-500 dark:text-slate-400">
            {isLogin ? 'Gunakan username atau email Anda.' : 'Isi data berikut untuk membuat akun penulis baru.'}
          </p>
          <AuthForm key={mode} mode={mode} onLoginSuccess={onLoginSuccess} onSwitchMode={(next) => onNavigate(`/${next}`)} />
        </div>
      </div>
    </div>
  )
}

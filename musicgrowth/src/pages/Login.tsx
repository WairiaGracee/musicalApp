import { useState } from 'react'
import { Music2, Loader2 } from 'lucide-react'
import { authApi } from '../api/auth'

export function Login({ onDone }: { onDone: () => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [form, setForm] = useState({ username: '', email: '', password: '', first_name: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handle = async () => {
    if (!form.username || !form.password) return
    setLoading(true)
    setError('')
    try {
      if (mode === 'login') {
        await authApi.login(form.username, form.password)
      } else {
        await authApi.register(form)
      }
      onDone()
    } catch (e: any) {
      setError(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-forest-800 flex items-center justify-center px-5">
      <div className="w-full max-w-sm animate-fade-up">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-gold-400 rounded-xl flex items-center justify-center">
            <Music2 size={20} className="text-forest-800" />
          </div>
          <span className="font-display text-cream-50 text-xl">Music</span>
          <span className="font-display italic text-gold-300 text-xl -ml-2">Growth</span>
        </div>

        <h1 className="font-display text-4xl text-cream-50 mb-2">
          {mode === 'login' ? 'Welcome back.' : 'Create account.'}
        </h1>
        <p className="text-forest-400 text-sm mb-8">
          {mode === 'login' ? 'Sign in to continue your journey.' : 'Start your musical journey today.'}
        </p>

        <div className="space-y-3">
          {mode === 'register' && (
            <input
              type="text"
              placeholder="Your name"
              value={form.first_name}
              onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))}
              className="w-full bg-forest-700 border border-forest-600 rounded-xl px-4 py-3.5 text-cream-50 placeholder-forest-500 focus:outline-none focus:border-gold-400 transition-colors"
            />
          )}
          <input
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
            className="w-full bg-forest-700 border border-forest-600 rounded-xl px-4 py-3.5 text-cream-50 placeholder-forest-500 focus:outline-none focus:border-gold-400 transition-colors"
          />
          {mode === 'register' && (
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className="w-full bg-forest-700 border border-forest-600 rounded-xl px-4 py-3.5 text-cream-50 placeholder-forest-500 focus:outline-none focus:border-gold-400 transition-colors"
            />
          )}
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && handle()}
            className="w-full bg-forest-700 border border-forest-600 rounded-xl px-4 py-3.5 text-cream-50 placeholder-forest-500 focus:outline-none focus:border-gold-400 transition-colors"
          />

          {error && (
            <p className="text-red-400 text-xs px-1">{error}</p>
          )}

          <button
            onClick={handle}
            disabled={loading || !form.username || !form.password}
            className="w-full bg-gold-400 text-forest-800 py-4 rounded-xl font-medium text-base hover:bg-gold-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading
              ? <Loader2 size={18} className="animate-spin mx-auto" />
              : mode === 'login' ? 'Sign in' : 'Create account'
            }
          </button>

          <p className="text-center text-sm text-forest-400 pt-2">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
              className="text-gold-400 hover:text-gold-300 font-medium"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
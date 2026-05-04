import { useState } from 'react'
import { Music2 } from 'lucide-react'
import { profileDb, seedDemoData } from '../lib/db'

export function Onboarding({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState('')
  const [withDemo, setWithDemo] = useState(true)

  const handleStart = () => {
    if (!name.trim()) return
    profileDb.create(name.trim())
    if (withDemo) seedDemoData()
    onDone()
  }

  return (
    <div className="min-h-screen bg-forest-800 flex items-center justify-center px-5">
      <div className="w-full max-w-sm animate-fade-up">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-gold-400 rounded-xl flex items-center justify-center">
            <Music2 size={20} className="text-forest-800" />
          </div>
          <div className="flex items-center gap-1">
            <span className="font-display text-cream-50 text-xl">Music</span>
            <span className="font-display italic text-gold-300 text-xl">Growth</span>
          </div>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl text-cream-50 mb-3 leading-tight">
          Welcome to your musical journey<span className="text-gold-400">.</span>
        </h1>
        <p className="text-forest-400 mb-8 leading-relaxed text-sm">
          A personal space to grow intentionally as a vocalist and musician — with a plan, not just practice.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-forest-400 uppercase tracking-wider mb-2">What should we call you?</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleStart()}
              placeholder="Your name"
              className="w-full bg-forest-700 border border-forest-600 rounded-xl px-4 py-3.5 text-cream-50 placeholder-forest-500 focus:outline-none focus:border-gold-400 transition-colors text-base"
              autoFocus
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={withDemo} onChange={e => setWithDemo(e.target.checked)} className="mt-0.5 accent-gold-400 w-4 h-4" />
            <span className="text-sm text-forest-400 leading-relaxed">
              Load example sessions and a sample plan so you can explore right away
            </span>
          </label>

          <button
            onClick={handleStart}
            disabled={!name.trim()}
            className="w-full bg-gold-400 text-forest-800 py-4 rounded-xl font-medium text-base hover:bg-gold-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Start my journey
          </button>
        </div>
      </div>
    </div>
  )
}
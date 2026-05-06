import { useEffect, useState } from 'react'
import { Flame, Check, Calendar, Sparkles, Loader2, Trophy, Target } from 'lucide-react'
import { challengesApi } from '../api/songs'
import type { MonthlyChallenge } from '../types'
import { format, getDaysInMonth } from 'date-fns'

const MONTH_KEY = new Date().toISOString().slice(0, 7)

export function Challenge() {
  const [challenge, setChallenge] = useState<MonthlyChallenge | null>(null)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    challengesApi.getCurrent().then(c => setChallenge(c)).catch(() => null)
  }, [])

  const reload = () => {
    challengesApi.getCurrent().then(c => setChallenge(c)).catch(() => null)
  }

  const toggleExercise = (exerciseId: string) => {
    if (!challenge) return
    challengesApi.toggleExercise(challenge.id, exerciseId).then(updated => {
      setChallenge(updated)
    }).catch(() => null)
  }

  const toggleDay = (date: string) => {
    if (!challenge) return
    challengesApi.markDayDone(challenge.id, date).then(updated => {
      setChallenge(updated)
    }).catch(() => null)
  }

  const generateChallenge = async () => {
    setGenerating(true)
    try {
      const generated = await challengesApi.generate()
      setChallenge(generated)
    } catch (err) {
      console.error('Challenge generation failed:', err)
    } finally {
      setGenerating(false)
    }
  }

  const monthLabel = format(new Date(), 'MMMM yyyy')
  const daysInMonth = getDaysInMonth(new Date())
  const today = new Date().getDate()
  const completedExercises = challenge?.exercises.filter(e => e.completed).length ?? 0
  const totalExercises = challenge?.exercises.length ?? 0
  const streak = challenge?.completedDays.length ?? 0

  return (
    <div className="animate-fade-up px-4 sm:px-0 max-w-2xl mx-auto">
      <div className="mb-6">
        <p className="text-xs text-forest-400 uppercase tracking-wider mb-1">{monthLabel}</p>
        <h1 className="font-display text-3xl sm:text-4xl text-forest-800 mb-1">
          Monthly Challenge<span className="text-gold-400">.</span>
        </h1>
        <p className="text-forest-400 text-sm">One skill. Thirty days. Real growth.</p>
      </div>

      {!challenge ? (
        <div className="card text-center py-16">
          <Trophy size={36} className="text-gold-400 mx-auto mb-4" />
          <h2 className="font-display text-2xl text-forest-800 mb-2">No challenge this month</h2>
          <p className="text-forest-400 text-sm mb-6 max-w-xs mx-auto">
            Let AI create a focused monthly challenge based on your current level and goals.
          </p>
          <button
            onClick={generateChallenge}
            disabled={generating}
            className="btn-primary inline-flex items-center gap-2"
          >
            {generating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {generating ? 'Generating...' : 'Generate challenge'}
          </button>
        </div>
      ) : (
        <>
          {/* Hero card */}
          <div className="bg-forest-800 rounded-2xl p-5 sm:p-6 mb-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <span className="tag bg-gold-400 text-forest-800 mb-2">{challenge.skill}</span>
                <h2 className="font-display text-2xl sm:text-3xl text-cream-50 mt-2">{challenge.title}</h2>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-display text-3xl text-gold-400">{streak}</p>
                <p className="text-xs text-forest-400">days done</p>
              </div>
            </div>
            <p className="text-forest-300 text-sm leading-relaxed mb-4">{challenge.description}</p>
            {challenge.targetSong && (
              <div className="flex items-center gap-2 bg-forest-700 rounded-xl px-3 py-2.5">
                <Target size={14} className="text-gold-300 flex-shrink-0" />
                <div>
                  <p className="text-xs text-forest-400">Target song</p>
                  <p className="text-sm text-cream-100 font-medium">{challenge.targetSong}</p>
                </div>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="card mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-forest-700">Exercises completed</p>
              <p className="text-sm text-gold-500 font-medium">{completedExercises}/{totalExercises}</p>
            </div>
            <div className="h-2 bg-cream-200 rounded-full">
              <div
                className="h-2 bg-gold-400 rounded-full transition-all duration-500"
                style={{ width: totalExercises > 0 ? `${(completedExercises / totalExercises) * 100}%` : '0%' }}
              />
            </div>
          </div>

          {/* Exercises */}
          <div className="mb-4">
            <p className="text-xs text-forest-400 uppercase tracking-wider mb-3 px-1">This month's exercises</p>
            <div className="space-y-3">
              {challenge.exercises.map((ex, i) => (
                <div
                  key={ex.id}
                  onClick={() => toggleExercise(ex.id)}
                  className={`card cursor-pointer transition-all active:scale-[0.99] ${ex.completed ? 'opacity-60' : 'hover:border-forest-300'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5 transition-all ${
                      ex.completed ? 'bg-forest-500 border-forest-500' : 'border-cream-200'
                    }`}>
                      {ex.completed
                        ? <Check size={13} className="text-white" />
                        : <span className="text-xs text-forest-400 font-medium">{i + 1}</span>
                      }
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium mb-1 ${ex.completed ? 'line-through text-forest-400' : 'text-forest-700'}`}>
                        {ex.title}
                      </p>
                      <p className="text-xs text-forest-400 leading-relaxed">{ex.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily tracker */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={16} className="text-forest-500" />
              <h3 className="font-display text-lg text-forest-800">Daily practice tracker</h3>
            </div>
            <p className="text-xs text-forest-400 mb-4">Tap a day to mark it as practiced.</p>
            <div className="grid grid-cols-7 gap-1.5">
              {['M','T','W','T','F','S','S'].map((d, i) => (
                <p key={i} className="text-center text-xs text-forest-300 pb-1">{d}</p>
              ))}
              {Array.from({ length: (new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay() + 6) % 7 }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const dateStr = `${MONTH_KEY}-${day.toString().padStart(2, '0')}`
                const done = challenge.completedDays.includes(dateStr)
                const isToday = day === today
                const isFuture = day > today
                return (
                  <button
                    key={day}
                    onClick={() => !isFuture && toggleDay(dateStr)}
                    disabled={isFuture}
                    className={`aspect-square rounded-lg text-xs font-medium transition-all flex items-center justify-center ${
                      done
                        ? 'bg-forest-500 text-white'
                        : isToday
                        ? 'border-2 border-gold-400 text-forest-700'
                        : isFuture
                        ? 'text-forest-200 cursor-default'
                        : 'bg-cream-100 text-forest-500 hover:bg-cream-200 active:scale-95'
                    }`}
                  >
                    {done ? <Flame size={11} /> : day}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="text-center mt-4">
            <button
              onClick={generateChallenge}
              disabled={generating}
              className="btn-ghost text-xs inline-flex items-center gap-1.5"
            >
              {generating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              Regenerate challenge
            </button>
          </div>
        </>
      )}
    </div>
  )
}
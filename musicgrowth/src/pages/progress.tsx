import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { sessionsDb } from '../lib/db'
import type { PracticeSession } from '../types'
import { format, parseISO, startOfWeek, endOfWeek, eachWeekOfInterval, subWeeks } from 'date-fns'

export function Progress() {
  const [sessions, setSessions] = useState<PracticeSession[]>([])

  useEffect(() => {
    const all = sessionsDb.getAll()
    setSessions(all)
  }, [])

  const now = new Date()
  const weeks = eachWeekOfInterval({ start: subWeeks(now, 7), end: now }, { weekStartsOn: 1 })

  const chartData = weeks.map(weekStart => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
    const weekSessions = sessions.filter(s => {
      const d = parseISO(s.date)
      return d >= weekStart && d <= weekEnd
    })
    return {
      week: format(weekStart, 'MMM d'),
      voice: weekSessions.filter(s => s.type === 'voice').reduce((sum, s) => sum + s.durationMinutes, 0),
      ear: weekSessions.filter(s => s.type === 'ear_training').reduce((sum, s) => sum + s.durationMinutes, 0),
    }
  })

  const totalVoice = sessions.filter(s => s.type === 'voice').reduce((sum, s) => sum + s.durationMinutes, 0)
  const totalEar = sessions.filter(s => s.type === 'ear_training').reduce((sum, s) => sum + s.durationMinutes, 0)
  const totalSessions = sessions.length
  const avgDuration = totalSessions > 0 ? Math.round((totalVoice + totalEar) / totalSessions) : 0
  const avgMood = sessions.length > 0
    ? (sessions.reduce((sum, s) => sum + s.mood, 0) / sessions.length).toFixed(1)
    : '—'

  return (
    <div className="animate-fade-up max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl text-forest-800 mb-1">Progress<span className="text-gold-400">.</span></h1>
        <p className="text-forest-400 text-sm">See how far you've come.</p>
      </div>

      {/* Stats grid — 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total sessions', value: totalSessions.toString() },
          { label: 'Voice minutes', value: `${totalVoice}m` },
          { label: 'Ear training', value: `${totalEar}m` },
          { label: 'Avg session', value: `${avgDuration}m` },
        ].map(stat => (
          <div key={stat.label} className="card text-center py-4">
            <p className="font-display text-2xl sm:text-3xl text-forest-800 mb-1">{stat.value}</p>
            <p className="text-xs text-forest-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card">
        <h2 className="font-display text-lg text-forest-800 mb-5">Practice — last 8 weeks</h2>
        {sessions.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F2EAD8" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#5F5E5A' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#5F5E5A' }} axisLine={false} tickLine={false} unit="m" width={30} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #F2EAD8', borderRadius: 10, fontSize: 12 }} />
              <Bar dataKey="voice" name="Voice" fill="#D9A090" radius={[4, 4, 0, 0]} />
              <Bar dataKey="ear" name="Ear training" fill="#4A7C59" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center">
            <p className="text-forest-300 text-sm">Log sessions to see your chart.</p>
          </div>
        )}
        <div className="flex items-center gap-5 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-blush-300" />
            <span className="text-xs text-forest-400">Voice</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-forest-400" />
            <span className="text-xs text-forest-400">Ear training</span>
          </div>
        </div>
      </div>

      {/* Mood tracker */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg text-forest-800">Session mood</h2>
          <div className="text-right">
            <p className="font-display text-2xl text-gold-400">{avgMood}</p>
            <p className="text-xs text-forest-400">avg / 5</p>
          </div>
        </div>
        <div className="space-y-2.5">
          {sessions.slice(0, 8).map(s => (
            <div key={s.id} className="flex items-center gap-3">
              <p className="text-xs text-forest-400 w-14 flex-shrink-0">{format(parseISO(s.date), 'MMM d')}</p>
              <p className="text-xs text-forest-600 flex-1 truncate">{s.focus}</p>
              <div className="flex gap-0.5 flex-shrink-0">
                {[1,2,3,4,5].map(n => (
                  <div key={n} className={`w-2 h-2 rounded-full ${n <= s.mood ? 'bg-gold-400' : 'bg-cream-200'}`} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
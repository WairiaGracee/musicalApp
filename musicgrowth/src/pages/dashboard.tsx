import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Mic2, Music, Flame, TrendingUp, ChevronRight, Sparkles, Guitar, Trophy } from 'lucide-react'
import { sessionsApi } from '../api/sessions'
import { plansApi } from '../api/plans'
import { goalsApi } from '../api/goals'
import { songsApi } from '../api/songs'
import { challengesApi } from '../api/songs'
import { authApi } from '../api/auth'
import type { PracticeSession, WeeklyPlan, Goal, WeeklySong, MonthlyChallenge } from '../types'
import { format, isThisWeek, parseISO } from 'date-fns'

const MONTH_KEY = new Date().toISOString().slice(0, 7)

export function Dashboard() {
  const [sessions, setSessions] = useState<PracticeSession[]>([])
  const [plan, setPlan] = useState<WeeklyPlan | null>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [songs, setSongs] = useState<WeeklySong[]>([])
  const [challenge, setChallenge] = useState<MonthlyChallenge | null>(null)
  const [userName, setUserName] = useState('Musician')

  useEffect(() => {
    authApi.getProfile().then(p => setUserName(p.username)).catch(() => null)
    sessionsApi.getAll().then(setSessions).catch(() => null)
    plansApi.getCurrent().then(p => setPlan(p)).catch(() => null)
    goalsApi.getAll().then(g => setGoals(g.filter(x => x.status === 'active'))).catch(() => null)
    songsApi.getThisWeek().then(setSongs).catch(() => null)
    challengesApi.getCurrent().then(c => setChallenge(c)).catch(() => null)
  }, [])

  const thisWeekSessions = sessions.filter(s => isThisWeek(parseISO(s.date), { weekStartsOn: 1 }))
  const totalMinutesThisWeek = thisWeekSessions.reduce((sum, s) => sum + s.durationMinutes, 0)
  const voiceMinutes = thisWeekSessions.filter(s => s.type === 'voice').reduce((sum, s) => sum + s.durationMinutes, 0)
  const earMinutes = thisWeekSessions.filter(s => s.type === 'ear_training').reduce((sum, s) => sum + s.durationMinutes, 0)

  const completedTasks = plan?.tasks.filter(t => t.completed).length ?? 0
  const totalTasks = plan?.tasks.length ?? 0

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="animate-fade-up space-y-5">
      {/* Header */}
      <div className="pt-1">
        <p className="text-forest-500 text-sm mb-0.5">{greeting} ✨</p>
        <h1 className="font-display text-3xl sm:text-4xl text-forest-800">
          {userName}<span className="text-gold-400">.</span>
        </h1>
        <p className="text-forest-400 text-sm mt-1">{format(new Date(), 'EEEE, MMMM d')}</p>
      </div>

      {/* Stats row */}
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-3">
        {[
          { icon: <Flame size={16} className="text-gold-400" />, label: 'This week', value: `${totalMinutesThisWeek}m`, sub: `${thisWeekSessions.length} sessions` },
          { icon: <Mic2 size={16} className="text-blush-300" />, label: 'Voice', value: `${voiceMinutes}m`, sub: 'this week' },
          { icon: <Music size={16} className="text-forest-400" />, label: 'Ear training', value: `${earMinutes}m`, sub: 'this week' },
        ].map(stat => (
          <div key={stat.label} className="card flex-shrink-0 w-36 md:w-auto">
            <div className="flex items-center gap-1.5 mb-2">{stat.icon}<span className="text-xs text-forest-400">{stat.label}</span></div>
            <p className="font-display text-2xl sm:text-3xl text-forest-800">{stat.value}</p>
            <p className="text-xs text-forest-400 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Songs this week */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Guitar size={16} className="text-gold-400" />
            <h2 className="font-display text-lg text-forest-800">Songs this week</h2>
          </div>
          <Link to="/studio" className="text-xs text-forest-400 hover:text-forest-600 flex items-center gap-0.5">
            Studio <ChevronRight size={12} />
          </Link>
        </div>
        {songs.length > 0 ? (
          <div className="space-y-2">
            {songs.map((song, i) => (
              <div key={song.id} className="flex items-center gap-3 bg-cream-50 rounded-xl px-3 py-2.5 border border-cream-200">
                <div className="w-8 h-8 bg-forest-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="font-display text-gold-300 text-sm">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-forest-700 truncate">{song.title}</p>
                  <p className="text-xs text-forest-400">{song.artist}</p>
                </div>
              </div>
            ))}
            {songs.length < 2 && (
              <Link to="/studio" className="flex items-center justify-center gap-2 border-2 border-dashed border-cream-200 rounded-xl py-3 text-xs text-forest-400 hover:border-forest-300 transition-all">
                + Add second song
              </Link>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-forest-400 text-sm mb-3">No songs chosen yet this week</p>
            <Link to="/studio" className="btn-primary text-xs">Pick your songs</Link>
          </div>
        )}
      </div>

      {/* Weekly plan + Monthly challenge */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles size={15} className="text-gold-400" />
              <h2 className="font-display text-base text-forest-800">This week</h2>
            </div>
            <Link to="/plan" className="text-xs text-forest-400 hover:text-forest-600 flex items-center gap-0.5">
              View <ChevronRight size={12} />
            </Link>
          </div>
          {plan ? (
            <>
              <div className="mb-3">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-forest-400">{completedTasks}/{totalTasks} tasks</span>
                  <span className="text-xs text-gold-500">{totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%</span>
                </div>
                <div className="h-1.5 bg-cream-200 rounded-full">
                  <div className="h-1.5 bg-gold-400 rounded-full transition-all" style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }} />
                </div>
              </div>
              <div className="space-y-1.5">
                {plan.tasks.slice(0, 3).map((task: any) => (
                  <div key={task.id} className="flex items-center gap-2.5 py-1.5">
                    <div className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 ${task.completed ? 'bg-forest-500 border-forest-500' : 'border-cream-200'}`} />
                    <span className={`text-xs flex-1 truncate ${task.completed ? 'line-through text-forest-300' : 'text-forest-600'}`}>{task.title}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-forest-400 text-xs mb-2">No plan yet</p>
              <Link to="/plan" className="btn-primary text-xs">Generate plan</Link>
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy size={15} className="text-gold-400" />
              <h2 className="font-display text-base text-forest-800">Challenge</h2>
            </div>
            <Link to="/challenge" className="text-xs text-forest-400 hover:text-forest-600 flex items-center gap-0.5">
              View <ChevronRight size={12} />
            </Link>
          </div>
          {challenge ? (
            <>
              <p className="text-xs text-forest-400 mb-1">{format(new Date(), 'MMMM')}</p>
              <p className="font-medium text-forest-700 text-sm mb-3">{challenge.title}</p>
              <div className="h-1.5 bg-cream-200 rounded-full">
                <div
                  className="h-1.5 bg-forest-500 rounded-full transition-all"
                  style={{ width: `${challenge.exercises.length > 0 ? (challenge.exercises.filter(e => e.completed).length / challenge.exercises.length) * 100 : 0}%` }}
                />
              </div>
              <div className="flex items-center gap-1.5 mt-3">
                <Flame size={13} className="text-gold-400" />
                <span className="text-xs text-forest-500">{challenge.completedDays.length} days practiced</span>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-forest-400 text-xs mb-2">No challenge yet</p>
              <Link to="/challenge" className="btn-primary text-xs">Start challenge</Link>
            </div>
          )}
        </div>
      </div>

      {/* Active goals */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={15} className="text-forest-500" />
            <h2 className="font-display text-lg text-forest-800">Active goals</h2>
          </div>
          <Link to="/goals" className="text-xs text-forest-400 hover:text-forest-600 flex items-center gap-0.5">
            Manage <ChevronRight size={12} />
          </Link>
        </div>
        {goals.length > 0 ? (
          <div className="space-y-4">
            {goals.slice(0, 2).map(goal => {
              const done = goal.milestones.filter(m => m.completed).length
              const total = goal.milestones.length
              const pct = total > 0 ? Math.round((done / total) * 100) : 0
              return (
                <div key={goal.id}>
                  <div className="flex items-start justify-between mb-1.5">
                    <p className="text-sm font-medium text-forest-700 flex-1 pr-2">{goal.title}</p>
                    <span className={goal.type === 'voice' ? 'tag-voice' : 'tag-ear'}>
                      {goal.type === 'voice' ? 'Voice' : 'Ear'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-cream-200 rounded-full">
                      <div className="h-1 bg-forest-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-forest-400">{done}/{total}</span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-forest-400 text-sm mb-2">No goals yet</p>
            <Link to="/goals" className="btn-primary text-xs">Add goal</Link>
          </div>
        )}
      </div>

      {/* Recent sessions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg text-forest-800">Recent sessions</h2>
          <Link to="/log" className="btn-ghost text-xs">+ Log</Link>
        </div>
        {sessions.length > 0 ? (
          <div className="space-y-1">
            {sessions.slice(0, 4).map(session => (
              <div key={session.id} className="flex items-center gap-3 py-2.5 border-b border-cream-100 last:border-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${session.type === 'voice' ? 'bg-blush-100' : 'bg-forest-800'}`}>
                  {session.type === 'voice'
                    ? <Mic2 size={13} className="text-blush-300" />
                    : <Music size={13} className="text-gold-300" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-forest-700 truncate">{session.focus}</p>
                  <p className="text-xs text-forest-400">{format(parseISO(session.date), 'MMM d')} · {session.durationMinutes}m</p>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(n => (
                    <div key={n} className={`w-1.5 h-1.5 rounded-full ${n <= session.mood ? 'bg-gold-400' : 'bg-cream-200'}`} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-forest-400 text-sm text-center py-6">Log your first practice session!</p>
        )}
      </div>
    </div>
  )
}
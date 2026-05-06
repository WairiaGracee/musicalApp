import { useEffect, useState } from 'react'
import { Target, Plus, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { goalsApi } from '../api/goals'
import type { Goal, GoalStatus } from '../types'
import { format, parseISO } from 'date-fns'

export function Goals() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '',
    type: 'voice' as 'voice' | 'ear_training' | 'general',
    targetDate: '', milestone1: '', milestone2: '', milestone3: '',
  })

  useEffect(() => {
    goalsApi.getAll().then(setGoals).catch(() => null)
  }, [])

  const reload = () => goalsApi.getAll().then(setGoals).catch(() => null)

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    goalsApi.toggleMilestone(goalId, milestoneId).then(reload).catch(() => null)
  }

  const updateStatus = (id: string, status: GoalStatus) => {
    goalsApi.update(id, { status }).then(reload).catch(() => null)
  }

  const handleAdd = () => {
    if (!form.title.trim()) return
    const milestones = [form.milestone1, form.milestone2, form.milestone3]
      .filter(m => m.trim())
      .map(m => ({ id: crypto.randomUUID(), title: m.trim(), completed: false }))
    goalsApi.create({
      title: form.title,
      description: form.description,
      type: form.type,
      targetDate: form.targetDate,
      status: 'active',
      milestones,
    }).then(() => {
      setForm({ title: '', description: '', type: 'voice', targetDate: '', milestone1: '', milestone2: '', milestone3: '' })
      setShowForm(false)
      reload()
    }).catch(() => null)
  }

  const active = goals.filter(g => g.status === 'active')
  const completed = goals.filter(g => g.status === 'completed')

  return (
    <div className="animate-fade-up max-w-2xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl text-forest-800 mb-1">Goals<span className="text-gold-400">.</span></h1>
          <p className="text-forest-400 text-sm">Set intentions. Track milestones.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 flex-shrink-0">
          <Plus size={15} /> New goal
        </button>
      </div>

      {showForm && (
        <div className="card mb-5 animate-fade-up">
          <h2 className="font-display text-lg text-forest-800 mb-4">New goal</h2>
          <div className="space-y-3">
            <input type="text" placeholder="Goal title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="input" />
            <textarea placeholder="What does achieving this look like?" rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="textarea" />
            <div className="grid grid-cols-2 gap-3">
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as typeof form.type }))} className="input">
                <option value="voice">Voice</option>
                <option value="ear_training">Ear Training</option>
                <option value="general">General</option>
              </select>
              <input type="date" value={form.targetDate} onChange={e => setForm(p => ({ ...p, targetDate: e.target.value }))} className="input" />
            </div>
            <div>
              <p className="text-xs text-forest-400 uppercase tracking-wider mb-2">Milestones (up to 3)</p>
              <div className="space-y-2">
                {['milestone1', 'milestone2', 'milestone3'].map((key, i) => (
                  <input key={key} type="text" placeholder={`Milestone ${i + 1}`}
                    value={form[key as keyof typeof form]}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    className="input text-sm" />
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={handleAdd} className="btn-primary flex-1">Save goal</button>
              <button onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {active.length > 0 && (
        <div className="mb-6">
          <p className="text-xs text-forest-400 uppercase tracking-wider mb-3">Active ({active.length})</p>
          <div className="space-y-3">
            {active.map(goal => (
              <GoalCard key={goal.id} goal={goal}
                isExpanded={expanded === goal.id}
                onToggleExpand={() => setExpanded(expanded === goal.id ? null : goal.id)}
                onToggleMilestone={toggleMilestone}
                onUpdateStatus={updateStatus} />
            ))}
          </div>
        </div>
      )}

      {active.length === 0 && !showForm && (
        <div className="card text-center py-14">
          <Target size={30} className="text-gold-400 mx-auto mb-3" />
          <p className="text-forest-400 text-sm">No active goals yet. Set your first one!</p>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <p className="text-xs text-forest-400 uppercase tracking-wider mb-3">Completed ({completed.length})</p>
          <div className="space-y-3 opacity-60">
            {completed.map(goal => (
              <GoalCard key={goal.id} goal={goal}
                isExpanded={expanded === goal.id}
                onToggleExpand={() => setExpanded(expanded === goal.id ? null : goal.id)}
                onToggleMilestone={toggleMilestone}
                onUpdateStatus={updateStatus} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function GoalCard({ goal, isExpanded, onToggleExpand, onToggleMilestone, onUpdateStatus }: {
  goal: Goal; isExpanded: boolean
  onToggleExpand: () => void
  onToggleMilestone: (gid: string, mid: string) => void
  onUpdateStatus: (id: string, s: GoalStatus) => void
}) {
  const done = goal.milestones.filter(m => m.completed).length
  const total = goal.milestones.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className="card">
      <div className="flex items-start gap-3 cursor-pointer" onClick={onToggleExpand}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="text-sm font-medium text-forest-700">{goal.title}</p>
            <span className={goal.type === 'voice' ? 'tag-voice' : goal.type === 'ear_training' ? 'tag-ear' : 'tag bg-cream-200 text-forest-500'}>
              {goal.type === 'voice' ? 'Voice' : goal.type === 'ear_training' ? 'Ear' : 'General'}
            </span>
          </div>
          {goal.targetDate && (
            <p className="text-xs text-forest-300 mb-2">Target: {format(parseISO(goal.targetDate), 'MMM d, yyyy')}</p>
          )}
          {total > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 bg-cream-200 rounded-full">
                <div className="h-1 bg-forest-500 rounded-full" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs text-forest-400">{done}/{total}</span>
            </div>
          )}
        </div>
        {isExpanded ? <ChevronUp size={16} className="text-forest-300 flex-shrink-0 mt-1" /> : <ChevronDown size={16} className="text-forest-300 flex-shrink-0 mt-1" />}
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-cream-100">
          {goal.description && <p className="text-sm text-forest-500 mb-4 leading-relaxed">{goal.description}</p>}
          {goal.milestones.length > 0 && (
            <div className="space-y-2.5 mb-4">
              {goal.milestones.map(m => (
                <div key={m.id} className="flex items-center gap-3 cursor-pointer" onClick={() => onToggleMilestone(goal.id, m.id)}>
                  <div className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${m.completed ? 'bg-forest-500 border-forest-500' : 'border-cream-200'}`}>
                    {m.completed && <Check size={11} className="text-white" />}
                  </div>
                  <span className={`text-sm ${m.completed ? 'line-through text-forest-300' : 'text-forest-600'}`}>{m.title}</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            {goal.status === 'active' && (
              <button onClick={() => onUpdateStatus(goal.id, 'completed')} className="btn-ghost text-xs flex items-center gap-1">
                <Check size={12} /> Mark complete
              </button>
            )}
            {goal.status === 'completed' && (
              <button onClick={() => onUpdateStatus(goal.id, 'active')} className="btn-ghost text-xs">Reopen</button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
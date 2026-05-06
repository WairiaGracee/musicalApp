import { useEffect, useState } from 'react'
import { Sparkles, Loader2, ExternalLink, Check } from 'lucide-react'
import { plansApi } from '../api/plans'
import type { WeeklyPlan } from '../types'
import { format, parseISO } from 'date-fns'

export function Plan() {
  const [plan, setPlan] = useState<WeeklyPlan | null>(null)
  const [aiThinking, setAiThinking] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    plansApi.getCurrent()
      .then(p => { setPlan(p); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const toggleTask = async (taskId: string) => {
    if (!plan) return
    const task = plan.tasks.find((t: any) => t.id === taskId)
    if (!task) return
    try {
      const updated = await plansApi.updateTask(plan.id, taskId, !task.completed)
      setPlan(updated)
    } catch {
      // optimistic update fallback
      setPlan(prev => prev ? {
        ...prev,
        tasks: prev.tasks.map((t: any) => t.id === taskId ? { ...t, completed: !t.completed } : t)
      } : prev)
    }
  }

  const generatePlan = async () => {
    setAiThinking(true)
    try {
      const newPlan = await plansApi.generate()
      setPlan(newPlan)
    } catch (err) {
      console.error('Plan generation failed:', err)
    } finally {
      setAiThinking(false)
    }
  }

  // Safely format dates — handle both camelCase and snake_case from backend
  const getWeekLabel = () => {
    if (!plan) return format(new Date(), "'Week of' MMM d, yyyy")
    const start = plan.weekStart || (plan as any).week_start
    const end = plan.weekEnd || (plan as any).week_end
    if (!start || !end) return 'This week'
    try {
      return `${format(parseISO(start), 'MMM d')} – ${format(parseISO(end), 'MMM d, yyyy')}`
    } catch {
      return 'This week'
    }
  }

  const completedTasks = plan?.tasks.filter((t: any) => t.completed).length ?? 0
  const totalTasks = plan?.tasks.length ?? 0
  const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="text-forest-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="animate-fade-up max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-3xl sm:text-4xl text-forest-800 mb-1">
          This week<span className="text-gold-400">.</span>
        </h1>
        <p className="text-forest-400 text-sm">{getWeekLabel()}</p>
      </div>

      {!plan ? (
        <div className="card text-center py-16 px-6">
          <Sparkles size={32} className="text-gold-400 mx-auto mb-4" />
          <h2 className="font-display text-2xl text-forest-800 mb-2">Generate your week's plan</h2>
          <p className="text-forest-400 text-sm mb-8 max-w-xs mx-auto">
            Claude looks at your recent practice and suggests a focused, personalised plan for this week.
          </p>
          <button
            onClick={generatePlan}
            disabled={aiThinking}
            className="btn-primary inline-flex items-center gap-2"
          >
            {aiThinking ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
            {aiThinking ? 'Thinking...' : 'Generate with AI'}
          </button>
        </div>
      ) : (
        <>
          {/* AI suggestion */}
          {plan.aiSuggestion && (
            <div className="bg-forest-800 rounded-2xl p-5 mb-5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={13} className="text-gold-300" />
                <span className="text-xs text-gold-300 font-medium">AI coach</span>
              </div>
              <p className="text-cream-100 text-sm leading-relaxed italic font-display">
                "{plan.aiSuggestion}"
              </p>
            </div>
          )}

          {/* Focus */}
          {plan.focus && (
            <div className="mb-5">
              <p className="text-xs text-forest-400 uppercase tracking-wider mb-1">Week focus</p>
              <p className="font-display text-lg sm:text-xl text-forest-700">{plan.focus}</p>
            </div>
          )}

          {/* Progress bar */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-2 bg-cream-200 rounded-full">
              <div
                className="h-2 bg-gold-400 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-sm text-forest-500 flex-shrink-0">{completedTasks}/{totalTasks}</span>
          </div>

          {/* Tasks */}
          <div className="space-y-3">
            {plan.tasks.map((task: any) => (
              <div
                key={task.id}
                className={`card cursor-pointer transition-all active:scale-[0.99] ${task.completed ? 'opacity-60' : ''}`}
                onClick={() => toggleTask(task.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                    task.completed ? 'bg-forest-500 border-forest-500' : 'border-cream-200'
                  }`}>
                    {task.completed && <Check size={12} className="text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className={`text-sm font-medium ${task.completed ? 'line-through text-forest-400' : 'text-forest-700'}`}>
                        {task.title}
                      </p>
                      <span className={task.type === 'voice' ? 'tag-voice' : 'tag-ear'}>
                        {task.type === 'voice' ? 'Voice' : 'Ear'}
                      </span>
                    </div>
                    <p className="text-xs text-forest-400 leading-relaxed">{task.description}</p>
                    {task.resources && task.resources.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {task.resources.map((url: string) => {
                          try {
                            return (
                              <a key={url} href={url} target="_blank" rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-xs text-forest-500 underline underline-offset-2">
                                {new URL(url).hostname} <ExternalLink size={10} />
                              </a>
                            )
                          } catch {
                            return <span key={url} className="text-xs text-forest-400">{url}</span>
                          }
                        })}
                      </div>
                    )}
                    <p className="text-xs text-forest-300 mt-2">
                      Target: {task.days_target || task.daysTarget || '—'}×/week
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={generatePlan}
              disabled={aiThinking}
              className="btn-ghost inline-flex items-center gap-2 text-xs"
            >
              {aiThinking ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
              Regenerate plan
            </button>
          </div>
        </>
      )}
    </div>
  )
}
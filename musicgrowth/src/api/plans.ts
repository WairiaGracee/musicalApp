import { api } from './client'
import type { WeeklyPlan } from '../types'

function toCamel(p: any): WeeklyPlan {
  return {
    id: String(p.id),
    weekStart: p.week_start,
    weekEnd: p.week_end,
    focus: p.focus || '',
    aiSuggestion: p.ai_suggestion || '',
    tasks: p.tasks || [],
  }
}

function unwrap(data: any): any[] {
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.results)) return data.results
  return []
}

export const plansApi = {
  async getCurrent(): Promise<WeeklyPlan | null> {
    try {
      const data = await api.get<any>('/api/plans/current/')
      if (!data) return null
      return toCamel(data)
    } catch {
      return null
    }
  },

  async generate(): Promise<WeeklyPlan> {
    const data = await api.post<any>('/api/plans/generate/', {})
    return toCamel(data)
  },

  async updateTask(planId: string, taskId: string, completed: boolean): Promise<WeeklyPlan> {
    const data = await api.get<any>('/api/plans/')
    const plans = unwrap(data)
    const plan = plans.find((p: any) => String(p.id) === planId)
    if (!plan) throw new Error('Plan not found')

    const updatedTasks = plan.tasks.map((t: any) =>
      t.id === taskId ? { ...t, completed } : t
    )
    const updated = await api.patch<any>(`/api/plans/${planId}/`, { tasks: updatedTasks })
    return toCamel(updated)
  },
}
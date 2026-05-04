import { api } from './client'
import type { WeeklyPlan } from '../types'

function toCamel(p: any): WeeklyPlan {
  return {
    id: String(p.id),
    weekStart: p.week_start,
    weekEnd: p.week_end,
    focus: p.focus,
    aiSuggestion: p.ai_suggestion,
    tasks: p.tasks || [],
  }
}

export const plansApi = {
  async getCurrent(): Promise<WeeklyPlan | null> {
    const data = await api.get<any>('/api/plans/current/')
    return data ? toCamel(data) : null
  },

  async generate(): Promise<WeeklyPlan> {
    const data = await api.post<any>('/api/plans/generate/', {})
    return toCamel(data)
  },

  async updateTask(planId: string, taskId: string, completed: boolean): Promise<WeeklyPlan> {
    // Get current plan, update task, patch back
    const plans = await api.get<any[]>('/api/plans/')
    const plan = plans.find((p: any) => String(p.id) === planId)
    if (!plan) throw new Error('Plan not found')

    const updatedTasks = plan.tasks.map((t: any) =>
      t.id === taskId ? { ...t, completed } : t
    )
    const data = await api.patch<any>(`/api/plans/${planId}/`, { tasks: updatedTasks })
    return toCamel(data)
  },
}
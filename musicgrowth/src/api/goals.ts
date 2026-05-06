import { api } from './client'
import type { Goal, GoalStatus } from '../types'

function toCamel(g: any): Goal {
  return {
    id: String(g.id),
    title: g.title,
    description: g.description || '',
    type: g.type,
    targetDate: g.target_date || '',
    status: g.status,
    milestones: g.milestones || [],
  }
}

function unwrap(data: any): any[] {
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.results)) return data.results
  return []
}

export const goalsApi = {
  async getAll(): Promise<Goal[]> {
    const data = await api.get<any>('/api/goals/')
    return unwrap(data).map(toCamel)
  },

  async create(goal: Omit<Goal, 'id'>): Promise<Goal> {
    const data = await api.post<any>('/api/goals/', {
      title: goal.title,
      description: goal.description,
      type: goal.type,
      target_date: goal.targetDate || null,
      status: goal.status,
      milestones: goal.milestones,
    })
    return toCamel(data)
  },

  async update(id: string, updates: Partial<Goal>): Promise<Goal> {
    const payload: any = { ...updates }
    if (updates.targetDate !== undefined) {
      payload.target_date = updates.targetDate || null
      delete payload.targetDate
    }
    const data = await api.patch<any>(`/api/goals/${id}/`, payload)
    return toCamel(data)
  },

  async toggleMilestone(goalId: string, milestoneId: string): Promise<Goal> {
    const all = await api.get<any>('/api/goals/')
    const goals = unwrap(all)
    const goal = goals.find((g: any) => String(g.id) === goalId)
    if (!goal) throw new Error('Goal not found')

    const updatedMilestones = goal.milestones.map((m: any) =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    )
    const data = await api.patch<any>(`/api/goals/${goalId}/`, { milestones: updatedMilestones })
    return toCamel(data)
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/goals/${id}/`)
  },
}
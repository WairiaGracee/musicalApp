import { api } from './client'
import type { PracticeSession } from '../types'

export interface SessionPayload {
  date: string
  type: string
  duration_minutes: number
  focus: string
  notes: string
  mood: number
  techniques: string[]
  songs_worked_on: string[]
}

function toCamel(s: any): PracticeSession {
  return {
    id: String(s.id),
    date: s.date,
    type: s.type,
    durationMinutes: s.duration_minutes,
    focus: s.focus,
    notes: s.notes || '',
    mood: s.mood,
    techniques: s.techniques || [],
    songsWorkedOn: s.songs_worked_on || [],
  }
}

function unwrap(data: any): any[] {
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.results)) return data.results
  return []
}

export const sessionsApi = {
  async getAll(): Promise<PracticeSession[]> {
    const data = await api.get<any>('/api/sessions/')
    return unwrap(data).map(toCamel)
  },

  async create(session: Omit<PracticeSession, 'id'>): Promise<PracticeSession> {
    const payload: SessionPayload = {
      date: session.date,
      type: session.type,
      duration_minutes: session.durationMinutes,
      focus: session.focus,
      notes: session.notes,
      mood: session.mood,
      techniques: session.techniques || [],
      songs_worked_on: session.songsWorkedOn || [],
    }
    const data = await api.post<any>('/api/sessions/', payload)
    return toCamel(data)
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/sessions/${id}/`)
  },
}
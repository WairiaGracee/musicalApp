import { api } from './client'
import type { WeeklySong, MonthlyChallenge } from '../types'

function unwrap(data: any): any[] {
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.results)) return data.results
  return []
}

// ─── Songs ────────────────────────────────────────────────────────────────────

function songToCamel(s: any): WeeklySong {
  return {
    id: String(s.id),
    title: s.title,
    artist: s.artist,
    addedDate: s.added_date,
    techniques: s.techniques || [],
    vocalLayers: s.vocal_layers || { lead: false, backing: false },
    recordings: s.recordings || [],
    notes: s.notes || '',
  }
}

export const songsApi = {
  async getAll(): Promise<WeeklySong[]> {
    const data = await api.get<any>('/api/songs/')
    return unwrap(data).map(songToCamel)
  },

  async getThisWeek(): Promise<WeeklySong[]> {
    const all = await this.getAll()
    const today = new Date()
    const monday = new Date(today)
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7))
    monday.setHours(0, 0, 0, 0)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    sunday.setHours(23, 59, 59, 999)
    return all.filter(s => {
      const d = new Date(s.addedDate)
      return d >= monday && d <= sunday
    })
  },

  async create(song: Omit<WeeklySong, 'id'>): Promise<WeeklySong> {
    const data = await api.post<any>('/api/songs/', {
      title: song.title,
      artist: song.artist,
      added_date: song.addedDate,
      techniques: song.techniques,
      vocal_layers: song.vocalLayers,
      recordings: song.recordings,
      notes: song.notes,
    })
    return songToCamel(data)
  },

  async update(id: string, updates: Partial<WeeklySong>): Promise<WeeklySong> {
    const payload: any = {}
    if (updates.techniques !== undefined) payload.techniques = updates.techniques
    if (updates.vocalLayers !== undefined) payload.vocal_layers = updates.vocalLayers
    if (updates.recordings !== undefined) payload.recordings = updates.recordings
    if (updates.notes !== undefined) payload.notes = updates.notes
    const data = await api.patch<any>(`/api/songs/${id}/`, payload)
    return songToCamel(data)
  },

  async addRecording(songId: string, recording: Omit<WeeklySong['recordings'][0], 'id'>): Promise<WeeklySong> {
    const all = await this.getAll()
    const song = all.find(s => s.id === songId)
    if (!song) throw new Error('Song not found')
    const newRecording = { ...recording, id: crypto.randomUUID() }
    return this.update(songId, { recordings: [...song.recordings, newRecording] })
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/songs/${id}/`)
  },
}

// ─── Challenges ───────────────────────────────────────────────────────────────

function challengeToCamel(c: any): MonthlyChallenge {
  return {
    id: String(c.id),
    month: c.month,
    title: c.title,
    skill: c.skill,
    description: c.description,
    targetSong: c.target_song || '',
    exercises: c.exercises || [],
    completedDays: c.completed_days || [],
  }
}

export const challengesApi = {
  async getCurrent(): Promise<MonthlyChallenge | null> {
    try {
      const data = await api.get<any>('/api/challenges/current/')
      if (!data) return null
      return challengeToCamel(data)
    } catch {
      return null
    }
  },

  async generate(): Promise<MonthlyChallenge> {
    const data = await api.post<any>('/api/challenges/generate/', {})
    return challengeToCamel(data)
  },

  async toggleExercise(challengeId: string, exerciseId: string): Promise<MonthlyChallenge> {
    const all = await api.get<any>('/api/challenges/')
    const challenges = unwrap(all)
    const challenge = challenges.find((c: any) => String(c.id) === challengeId)
    if (!challenge) throw new Error('Challenge not found')

    const updatedExercises = challenge.exercises.map((e: any) =>
      e.id === exerciseId ? { ...e, completed: !e.completed } : e
    )
    const data = await api.patch<any>(`/api/challenges/${challengeId}/`, {
      exercises: updatedExercises,
    })
    return challengeToCamel(data)
  },

  async markDayDone(challengeId: string, date: string): Promise<MonthlyChallenge> {
    const all = await api.get<any>('/api/challenges/')
    const challenges = unwrap(all)
    const challenge = challenges.find((c: any) => String(c.id) === challengeId)
    if (!challenge) throw new Error('Challenge not found')

    const already = challenge.completed_days.includes(date)
    const updatedDays = already
      ? challenge.completed_days.filter((d: string) => d !== date)
      : [...challenge.completed_days, date]

    const data = await api.patch<any>(`/api/challenges/${challengeId}/`, {
      completed_days: updatedDays,
    })
    return challengeToCamel(data)
  },
}
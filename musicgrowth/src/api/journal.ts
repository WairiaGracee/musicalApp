import { api } from './client'
import type { JournalEntry } from '../types'

function toCamel(e: any): JournalEntry {
  return {
    id: String(e.id),
    date: e.date,
    title: e.title,
    content: e.content,
    tags: e.tags || [],
  }
}

function unwrap(data: any): any[] {
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.results)) return data.results
  return []
}

export const journalApi = {
  async getAll(): Promise<JournalEntry[]> {
    const data = await api.get<any>('/api/journal/')
    return unwrap(data).map(toCamel)
  },

  async create(entry: Omit<JournalEntry, 'id'>): Promise<JournalEntry> {
    const data = await api.post<any>('/api/journal/', entry)
    return toCamel(data)
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/journal/${id}/`)
  },
}
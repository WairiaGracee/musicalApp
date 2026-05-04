import { useEffect, useState } from 'react'
import { BookOpen, Plus, Trash2, ArrowLeft } from 'lucide-react'
import { journalDb } from '../lib/db'
import type { JournalEntry } from '../types'
import { format, parseISO } from 'date-fns'

export function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState<JournalEntry | null>(null)
  const [form, setForm] = useState({ title: '', content: '', tags: '' })

  useEffect(() => {
    const all = journalDb.getAll()
    setEntries(all)
  }, [])

  const reload = () => setEntries(journalDb.getAll())

  const handleSave = () => {
    if (!form.content.trim()) return
    journalDb.add({
      date: new Date().toISOString().split('T')[0],
      title: form.title || format(new Date(), 'MMMM d, yyyy'),
      content: form.content,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    })
    setForm({ title: '', content: '', tags: '' })
    setShowForm(false)
    reload()
  }

  const handleDelete = (id: string) => {
    journalDb.delete(id)
    if (selected?.id === id) setSelected(null)
    reload()
  }

  // On mobile: show list → tap → show entry (no split view)
  // On desktop: split view

  if (selected && !showForm) {
    return (
      <div className="animate-fade-up max-w-2xl mx-auto">
        <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-forest-400 text-sm mb-5 md:hidden">
          <ArrowLeft size={16} /> Back to journal
        </button>
        <div className="card">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="font-display text-2xl text-forest-800">{selected.title}</h2>
              <p className="text-xs text-forest-400 mt-1">{format(parseISO(selected.date), 'EEEE, MMMM d, yyyy')}</p>
            </div>
            <button onClick={() => handleDelete(selected.id)} className="text-forest-300 hover:text-red-400 transition-colors p-1 ml-2">
              <Trash2 size={15} />
            </button>
          </div>
          {selected.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {selected.tags.map(tag => (
                <span key={tag} className="text-xs bg-cream-100 text-forest-500 px-2.5 py-1 rounded-full">{tag}</span>
              ))}
            </div>
          )}
          <p className="text-sm text-forest-600 leading-relaxed whitespace-pre-wrap">{selected.content}</p>
        </div>
      </div>
    )
  }

  if (showForm) {
    return (
      <div className="animate-fade-up max-w-2xl mx-auto">
        <button onClick={() => setShowForm(false)} className="flex items-center gap-2 text-forest-400 text-sm mb-5">
          <ArrowLeft size={16} /> Cancel
        </button>
        <div className="card">
          <h2 className="font-display text-xl text-forest-800 mb-4">New entry</h2>
          <div className="space-y-3">
            <input type="text" placeholder="Title (optional)" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="input" />
            <textarea
              placeholder="Write freely about your session, how you felt, what clicked..."
              value={form.content}
              onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
              rows={8}
              className="textarea"
              autoFocus
            />
            <input type="text" placeholder="Tags: voice, breakthrough, struggling..." value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} className="input" />
            <div className="flex gap-2 pt-1">
              <button onClick={handleSave} disabled={!form.content.trim()} className="btn-primary flex-1 disabled:opacity-40">Save entry</button>
              <button onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-up max-w-2xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl text-forest-800 mb-1">Journal<span className="text-gold-400">.</span></h1>
          <p className="text-forest-400 text-sm">Reflect on your musical journey.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 flex-shrink-0">
          <Plus size={15} /> Write
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="card text-center py-16">
          <BookOpen size={28} className="text-gold-400 mx-auto mb-3" />
          <p className="text-forest-400 text-sm mb-4">Your journal is empty.</p>
          <button onClick={() => setShowForm(true)} className="btn-primary text-xs">Write your first entry</button>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map(entry => (
            <div
              key={entry.id}
              onClick={() => setSelected(entry)}
              className="card cursor-pointer hover:border-forest-300 transition-all active:scale-[0.99]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-forest-700 mb-0.5 truncate">{entry.title}</p>
                  <p className="text-xs text-forest-400 mb-2">{format(parseISO(entry.date), 'MMM d, yyyy')}</p>
                  <p className="text-xs text-forest-400 line-clamp-2 leading-relaxed">{entry.content}</p>
                </div>
              </div>
              {entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {entry.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-xs bg-cream-100 text-forest-400 px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mic2, Music, Check } from 'lucide-react'
import { sessionsApi } from '../api/sessions'
import type { SessionType } from '../types'

const VOICE_TECHNIQUES = [
  'Breath support', 'Lip trills', 'Sirens', 'Mixed voice',
  'Head voice', 'Chest voice', 'Resonance', 'Articulation', 'Vibrato',
]

const EAR_TECHNIQUES = [
  'Interval recognition', 'Chord quality', 'Melody dictation',
  'Rhythm training', 'Scale recognition', 'Absolute pitch', 'Sight singing',
]

export function LogSession() {
  const navigate = useNavigate()
  const [type, setType] = useState<SessionType>('voice')
  const [focus, setFocus] = useState('')
  const [duration, setDuration] = useState(30)
  const [notes, setNotes] = useState('')
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5>(3)
  const [selectedTechniques, setSelectedTechniques] = useState<string[]>([])
  const [songs, setSongs] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const techniques = type === 'voice' ? VOICE_TECHNIQUES : EAR_TECHNIQUES

  const toggleTechnique = (t: string) => {
    setSelectedTechniques(prev =>
      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
    )
  }

  const handleSave = async () => {
    if (!focus.trim()) return
    setSaving(true)
    try {
      await sessionsApi.create({
        date: new Date().toISOString().split('T')[0],
        type,
        durationMinutes: duration,
        focus: focus.trim(),
        notes: notes.trim(),
        mood,
        techniques: selectedTechniques,
        songsWorkedOn: songs.trim() ? songs.split(',').map(s => s.trim()) : [],
      })
      setSaved(true)
      setTimeout(() => navigate('/'), 1200)
    } catch {
      setSaving(false)
    }
  }

  const moodLabels = ['', 'Rough', 'Meh', 'Okay', 'Good', 'Great!']

  if (saved) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center animate-fade-up">
          <div className="w-14 h-14 bg-forest-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <Check size={24} className="text-white" />
          </div>
          <h2 className="font-display text-2xl text-forest-800">Session logged!</h2>
          <p className="text-forest-400 text-sm mt-1">Heading back...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-up max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-3xl sm:text-4xl text-forest-800 mb-1">Log session<span className="text-gold-400">.</span></h1>
        <p className="text-forest-400 text-sm">Record what you worked on today.</p>
      </div>

      <div className="flex gap-3 mb-5">
        <button
          onClick={() => { setType('voice'); setSelectedTechniques([]) }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
            type === 'voice' ? 'bg-blush-100 text-blush-300 border border-blush-200' : 'bg-white border border-cream-200 text-forest-400'
          }`}
        >
          <Mic2 size={16} /> Voice
        </button>
        <button
          onClick={() => { setType('ear_training'); setSelectedTechniques([]) }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
            type === 'ear_training' ? 'bg-forest-800 text-gold-300 border border-forest-700' : 'bg-white border border-cream-200 text-forest-400'
          }`}
        >
          <Music size={16} /> Ear Training
        </button>
      </div>

      <div className="card space-y-5">
        <div>
          <label className="block text-xs text-forest-400 mb-2 uppercase tracking-wider">What did you focus on?</label>
          <input type="text" value={focus} onChange={e => setFocus(e.target.value)}
            placeholder={type === 'voice' ? 'e.g. Chest to head voice transition' : 'e.g. Interval recognition'}
            className="input" />
        </div>

        <div>
          <label className="block text-xs text-forest-400 mb-2 uppercase tracking-wider">
            Duration: <span className="text-forest-600 font-medium">{duration} min</span>
          </label>
          <input type="range" min={5} max={120} step={5} value={duration}
            onChange={e => setDuration(Number(e.target.value))} className="w-full accent-forest-500" />
          <div className="flex justify-between text-xs text-forest-300 mt-1"><span>5m</span><span>120m</span></div>
        </div>

        <div>
          <label className="block text-xs text-forest-400 mb-2 uppercase tracking-wider">Techniques practiced</label>
          <div className="flex flex-wrap gap-2">
            {techniques.map(t => (
              <button key={t} onClick={() => toggleTechnique(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedTechniques.includes(t) ? 'bg-forest-600 text-cream-50' : 'bg-cream-100 text-forest-500 hover:bg-cream-200'
                }`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {type === 'voice' && (
          <div>
            <label className="block text-xs text-forest-400 mb-2 uppercase tracking-wider">Songs worked on</label>
            <input type="text" value={songs} onChange={e => setSongs(e.target.value)}
              placeholder="e.g. Rise Up, Halo (comma separated)" className="input" />
          </div>
        )}

        <div>
          <label className="block text-xs text-forest-400 mb-3 uppercase tracking-wider">
            How did it feel? <span className="text-forest-600">{moodLabels[mood]}</span>
          </label>
          <div className="flex gap-2">
            {([1, 2, 3, 4, 5] as const).map(n => (
              <button key={n} onClick={() => setMood(n)}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                  mood === n ? 'bg-gold-400 text-forest-800' : 'bg-cream-100 text-forest-400'
                }`}>
                {n}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs text-forest-400 mb-2 uppercase tracking-wider">Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="What went well? What was challenging?" rows={3} className="textarea" />
        </div>

        <button onClick={handleSave} disabled={!focus.trim() || saving}
          className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed py-3.5">
          {saving ? 'Saving...' : 'Save session'}
        </button>
      </div>
    </div>
  )
}
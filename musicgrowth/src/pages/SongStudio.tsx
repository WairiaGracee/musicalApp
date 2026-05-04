import { useEffect, useState, useRef } from 'react'
import { songsApi } from '../api/songs'
import {
  Plus, Mic, Square, Play, Pause, Trash2,
  Layers, Sparkles, Music2, ChevronDown, ChevronUp,
  Loader2, CheckCircle2, Search, ArrowLeft,
} from 'lucide-react'
import type { WeeklySong } from '../types'
import { format, parseISO } from 'date-fns'

const VOCAL_TECHNIQUES = [
  'Belting', 'Chest voice', 'Head voice', 'Mixed voice', 'Falsetto',
  'Vibrato', 'Breath support', 'Riffs & runs', 'Melisma', 'Resonance',
  'Twang', 'Legato', 'Staccato', 'Dynamics', 'Passaggio',
]

const techniqueInfo: Record<string, string> = {
  'Belting': 'Powerful chest-voice singing above your natural break. Defines pop and musical theatre.',
  'Chest voice': 'Your lower, fuller register. Resonance vibrates mainly in your chest.',
  'Head voice': 'Your upper register — lighter and more controlled. Resonance shifts toward the head.',
  'Mixed voice': 'A blend of chest and head voice. Allows power across your full range.',
  'Falsetto': 'A light, breathy upper register often used for stylistic effect.',
  'Vibrato': 'A controlled oscillation in pitch that adds warmth to sustained notes.',
  'Breath support': 'Using your diaphragm to control airflow — the foundation of all singing.',
  'Riffs & runs': 'Fast ornamental melodic passages. The signature of gospel and R&B.',
  'Melisma': 'Singing multiple notes on one syllable — core to Gospel, R&B, and soul.',
  'Resonance': 'Where sound "lives" in your body. Shapes tone quality.',
  'Twang': 'A bright, forward nasal sound that adds edge and projection.',
  'Legato': 'Smooth, connected singing — notes flow into each other.',
  'Staccato': 'Short, detached notes. The opposite of legato.',
  'Dynamics': 'Controlling volume for musical expression — whisper to full power.',
  'Passaggio': 'The transition zone between chest and head voice.',
}

const WAVEFORM_BARS = Array.from({ length: 32 }, (_, i) => ({
  height: 20 + (i % 5) * 12,
  delay: i * 0.05,
}))

export function SongStudio() {
  const [songs, setSongs] = useState<WeeklySong[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Record<string, 'practice' | 'record' | 'techniques'>>({})

  useEffect(() => {
    songsApi.getThisWeek().then(all => {
      setSongs(all)
      if (all.length > 0) setExpanded(all[0].id)
    }).catch(() => null)
  }, [])

  const reload = () => {
    songsApi.getThisWeek().then(setSongs).catch(() => null)
  }

  const removeSong = (id: string) => {
    songsApi.delete(id).then(() => {
      reload()
      if (expanded === id) setExpanded(null)
    }).catch(() => null)
  }

  const getTab = (id: string) => activeTab[id] ?? 'practice'
  const setTab = (id: string, tab: 'practice' | 'record' | 'techniques') =>
    setActiveTab(p => ({ ...p, [id]: tab }))

  const canAddMore = songs.length < 2

  if (showSearch) {
    return (
      <SongSearchModal
        onAdd={song => {
          songsApi.create(song).then(() => {
            reload()
            setShowSearch(false)
          }).catch(() => null)
        }}
        onClose={() => setShowSearch(false)}
      />
    )
  }

  return (
    <div className="animate-fade-up max-w-2xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl text-forest-800 mb-1">Song Studio<span className="text-gold-400">.</span></h1>
          <p className="text-forest-400 text-sm">Pick 2 songs this week. Learn them deeply.</p>
        </div>
        {canAddMore && (
          <button onClick={() => setShowSearch(true)} className="btn-primary flex items-center gap-2 flex-shrink-0">
            <Plus size={15} /> Add song
          </button>
        )}
      </div>

      {songs.length === 0 && (
        <div className="card text-center py-16 px-6">
          <Music2 size={36} className="text-gold-400 mx-auto mb-4" />
          <h2 className="font-display text-2xl text-forest-800 mb-2">No songs this week</h2>
          <p className="text-forest-400 text-sm mb-6 max-w-xs mx-auto">
            Pick up to 2 songs to focus on — practice their layers, record yourself, and learn the techniques.
          </p>
          <button onClick={() => setShowSearch(true)} className="btn-primary inline-flex items-center gap-2">
            <Plus size={15} /> Add your first song
          </button>
        </div>
      )}

      <div className="space-y-4">
        {songs.map((song, idx) => (
          <div key={song.id} className="card">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setExpanded(expanded === song.id ? null : song.id)}>
              <div className="w-11 h-11 bg-forest-800 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="font-display text-gold-300 text-lg">{idx + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-forest-800 truncate text-sm">{song.title}</p>
                <p className="text-xs text-forest-400">{song.artist}</p>
              </div>
              <button
                onClick={e => { e.stopPropagation(); removeSong(song.id) }}
                className="p-2 text-forest-300 hover:text-red-400 transition-colors rounded-lg"
              >
                <Trash2 size={14} />
              </button>
              {expanded === song.id ? <ChevronUp size={16} className="text-forest-300" /> : <ChevronDown size={16} className="text-forest-300" />}
            </div>

            {expanded === song.id && (
              <div className="mt-4 pt-4 border-t border-cream-100">
                <div className="flex gap-1 mb-4 bg-cream-100 p-1 rounded-xl">
                  {(['practice', 'record', 'techniques'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setTab(song.id, tab)}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                        getTab(song.id) === tab ? 'bg-white text-forest-700 shadow-sm' : 'text-forest-400'
                      }`}
                    >
                      {tab === 'practice' ? '🎵 Layers' : tab === 'record' ? '🎤 Record' : '✨ Techniques'}
                    </button>
                  ))}
                </div>

                {getTab(song.id) === 'practice' && <VocalLayersTab song={song} onUpdate={reload} />}
                {getTab(song.id) === 'record' && <RecordTab song={song} onUpdate={reload} />}
                {getTab(song.id) === 'techniques' && <TechniquesTab song={song} onUpdate={reload} />}
              </div>
            )}
          </div>
        ))}

        {songs.length === 1 && (
          <div
            onClick={() => setShowSearch(true)}
            className="border-2 border-dashed border-cream-200 rounded-2xl py-8 text-center cursor-pointer hover:border-forest-300 hover:bg-cream-50 transition-all active:scale-[0.99]"
          >
            <Plus size={20} className="text-forest-300 mx-auto mb-1.5" />
            <p className="text-sm text-forest-400">Add a second song</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Vocal Layers Tab ─────────────────────────────────────────────────────────
function VocalLayersTab({ song, onUpdate }: { song: WeeklySong; onUpdate: () => void }) {
  const [leadPlaying, setLeadPlaying] = useState(false)
  const [backingPlaying, setBackingPlaying] = useState(false)
  const [separating, setSeparating] = useState(false)
  const [separated, setSeparated] = useState(song.vocalLayers.lead || song.vocalLayers.backing)

  const handleSeparate = () => {
    setSeparating(true)
    setTimeout(() => {
      songsApi.update(song.id, { vocalLayers: { lead: true, backing: true } }).then(() => {
        setSeparated(true)
        setSeparating(false)
        onUpdate()
      })
    }, 2500)
  }

  return (
    <div>
      <p className="text-xs text-forest-400 leading-relaxed mb-4">
        Separate <span className="font-medium text-forest-600">{song.title}</span> into vocal layers to practice each independently.
      </p>
      {!separated ? (
        <div className="bg-cream-50 rounded-xl p-5 text-center border border-cream-200">
          <Layers size={24} className="text-forest-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-forest-700 mb-1">AI Vocal Separation</p>
          <p className="text-xs text-forest-400 mb-4 leading-relaxed">
            Isolate lead and backing vocals to practice each part separately.
            <span className="block mt-0.5 text-forest-300">(Audio processing coming soon — UI preview)</span>
          </p>
          <button onClick={handleSeparate} disabled={separating} className="btn-primary inline-flex items-center gap-2">
            {separating ? <Loader2 size={14} className="animate-spin" /> : <Layers size={14} />}
            {separating ? 'Separating...' : 'Separate vocals'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-blush-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-forest-700">Lead Vocals</p>
                <p className="text-xs text-forest-400">Main melody</p>
              </div>
              <button
                onClick={() => setLeadPlaying(!leadPlaying)}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${leadPlaying ? 'bg-blush-300 text-white' : 'bg-white text-blush-300 border border-blush-200'}`}
              >
                {leadPlaying ? <Pause size={14} /> : <Play size={14} />}
              </button>
            </div>
            <Waveform active={leadPlaying} color="#D9A090" />
          </div>
          <div className="bg-forest-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-cream-100">Backing Vocals</p>
                <p className="text-xs text-forest-400">Harmonies & layers</p>
              </div>
              <button
                onClick={() => setBackingPlaying(!backingPlaying)}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${backingPlaying ? 'bg-gold-400 text-forest-800' : 'bg-forest-700 text-gold-300 border border-forest-600'}`}
              >
                {backingPlaying ? <Pause size={14} /> : <Play size={14} />}
              </button>
            </div>
            <Waveform active={backingPlaying} color="#D4A843" />
          </div>
          <p className="text-xs text-forest-300 text-center">Tip: Mute lead vocals and sing along to just the backing track.</p>
        </div>
      )}
    </div>
  )
}

// ─── Record Tab ───────────────────────────────────────────────────────────────
function RecordTab({ song, onUpdate }: { song: WeeklySong; onUpdate: () => void }) {
  const [recording, setRecording] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [latestFeedback, setLatestFeedback] = useState<{ score: number; notes: string } | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startRecording = () => {
    setRecording(true)
    setSeconds(0)
    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
  }

  const stopRecording = () => {
    setRecording(false)
    if (timerRef.current) clearInterval(timerRef.current)
    setAnalyzing(true)
    const score = Math.floor(Math.random() * 25) + 70
    const feedbacks = [
      'Good breath control! Watch your pitch on the higher notes — slightly flat. Try opening your mouth wider.',
      'Strong start! Your chest voice is solid. The head voice transition needs work — try a lighter approach.',
      'Great energy! Some throat tension on sustained notes. Practice jaw release before your next session.',
      'Lovely tone. Focus on your vowel shapes — especially "ee" sounds which thin out.',
    ]
    const notes = feedbacks[Math.floor(Math.random() * feedbacks.length)]
    setTimeout(() => {
      songsApi.addRecording(song.id, {
        date: new Date().toISOString().split('T')[0],
        durationSeconds: seconds,
        feedbackNotes: notes,
        score,
      }).then(() => {
        setLatestFeedback({ score, notes })
        setAnalyzing(false)
        onUpdate()
      })
    }, 3000)
  }

  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  return (
    <div>
      <p className="text-xs text-forest-400 leading-relaxed mb-4">
        Record yourself singing <span className="font-medium text-forest-600">{song.title}</span>. AI listens and gives feedback.
        <span className="block mt-0.5 text-forest-300">(Mic + AI analysis coming soon — UI preview)</span>
      </p>
      <div className="bg-forest-800 rounded-xl p-6 text-center mb-4">
        {recording && (
          <div className="mb-4">
            <RecordingWaveform />
            <p className="text-gold-300 font-mono text-2xl mt-3">{fmt(seconds)}</p>
          </div>
        )}
        {analyzing && (
          <div className="mb-4 py-4">
            <Loader2 size={28} className="text-gold-400 animate-spin mx-auto mb-2" />
            <p className="text-cream-200 text-sm">Analysing your performance...</p>
          </div>
        )}
        {!recording && !analyzing && <Mic size={28} className="text-forest-500 mx-auto mb-4" />}
        <button
          onClick={recording ? stopRecording : startRecording}
          disabled={analyzing}
          className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto transition-all ${recording ? 'bg-red-500 hover:bg-red-600 animate-pulse-slow' : 'bg-gold-400 hover:bg-gold-300'} disabled:opacity-40`}
        >
          {recording ? <Square size={18} className="text-white" /> : <Mic size={20} className="text-forest-800" />}
        </button>
        <p className="text-xs text-forest-400 mt-2">{recording ? 'Tap to stop' : 'Tap to record'}</p>
      </div>

      {latestFeedback && (
        <div className="card animate-fade-up mb-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-forest-700 flex items-center gap-1.5">
              <Sparkles size={13} className="text-gold-400" /> AI Feedback
            </p>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-16 bg-cream-200 rounded-full">
                <div className="h-1.5 bg-gold-400 rounded-full" style={{ width: `${latestFeedback.score}%` }} />
              </div>
              <span className="text-sm font-medium text-gold-500">{latestFeedback.score}/100</span>
            </div>
          </div>
          <p className="text-xs text-forest-500 leading-relaxed">{latestFeedback.notes}</p>
        </div>
      )}

      {song.recordings.length > 0 && (
        <div>
          <p className="text-xs text-forest-400 uppercase tracking-wider mb-2">Past recordings</p>
          <div className="space-y-2">
            {song.recordings.slice(0, 3).map(rec => (
              <div key={rec.id} className="flex items-center gap-3 py-2.5 px-3 bg-cream-50 rounded-xl border border-cream-200">
                <Play size={12} className="text-forest-400 flex-shrink-0" />
                <span className="text-xs text-forest-500 flex-1">{format(parseISO(rec.date), 'MMM d')}</span>
                <span className="text-xs text-forest-400">{fmt(rec.durationSeconds)}</span>
                <span className="text-xs font-medium text-gold-500">{rec.score}/100</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Techniques Tab ───────────────────────────────────────────────────────────
function TechniquesTab({ song, onUpdate }: { song: WeeklySong; onUpdate: () => void }) {
  const [analyzing, setAnalyzing] = useState(false)
  const [techniques, setTechniques] = useState<string[]>(song.techniques)

  const analyzeWithAI = () => {
    setAnalyzing(true)
    const shuffled = [...VOCAL_TECHNIQUES].sort(() => 0.5 - Math.random())
    const detected = shuffled.slice(0, 4)
    setTimeout(() => {
      songsApi.update(song.id, { techniques: detected }).then(() => {
        setTechniques(detected)
        setAnalyzing(false)
        onUpdate()
      })
    }, 2000)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-forest-500">Techniques in <span className="font-medium text-forest-700">{song.title}</span></p>
        <button onClick={analyzeWithAI} disabled={analyzing} className="btn-ghost text-xs flex items-center gap-1">
          {analyzing ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
          {analyzing ? 'Analysing...' : 'AI detect'}
        </button>
      </div>
      {techniques.length === 0 ? (
        <div className="text-center py-8 bg-cream-50 rounded-xl border border-cream-200">
          <Sparkles size={22} className="text-gold-400 mx-auto mb-2" />
          <p className="text-sm text-forest-400 mb-3">No techniques detected yet</p>
          <button onClick={analyzeWithAI} className="btn-primary text-xs inline-flex items-center gap-1.5">
            <Sparkles size={12} /> Detect with AI
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {techniques.map(t => (
            <div key={t} className="bg-cream-50 border border-cream-200 rounded-xl p-3.5">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 size={14} className="text-forest-500 flex-shrink-0" />
                <p className="text-sm font-medium text-forest-700">{t}</p>
              </div>
              {techniqueInfo[t] && (
                <p className="text-xs text-forest-400 leading-relaxed pl-5">{techniqueInfo[t]}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Song Search Modal ────────────────────────────────────────────────────────
function SongSearchModal({ onAdd, onClose }: { onAdd: (song: Omit<WeeklySong, 'id'>) => void; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [artist, setArtist] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<{ title: string; artist: string }[]>([])

  const search = () => {
    if (!query.trim()) return
    setSearching(true)
    setTimeout(() => {
      setResults([
        { title: query, artist: artist || 'Unknown Artist' },
        { title: `${query} (Acoustic)`, artist: artist || 'Various' },
        { title: `${query} (Live)`, artist: artist || 'Various' },
      ])
      setSearching(false)
    }, 800)
  }

  const addSong = (s: { title: string; artist: string }) => {
    onAdd({
      title: s.title,
      artist: s.artist,
      addedDate: new Date().toISOString().split('T')[0],
      techniques: [],
      vocalLayers: { lead: false, backing: false },
      recordings: [],
      notes: '',
    })
  }

  return (
    <div className="animate-fade-up max-w-2xl mx-auto">
      <button onClick={onClose} className="flex items-center gap-2 text-forest-400 text-sm mb-5">
        <ArrowLeft size={16} /> Back to studio
      </button>
      <div className="card">
        <h2 className="font-display text-xl text-forest-800 mb-5">Search for a song</h2>
        <div className="space-y-3 mb-5">
          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="Song title (e.g. Rise Up)" className="input" autoFocus />
          <input type="text" value={artist} onChange={e => setArtist(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="Artist (optional)" className="input" />
          <button onClick={search} disabled={!query.trim() || searching}
            className="btn-primary w-full flex items-center justify-center gap-2">
            {searching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            {searching ? 'Searching...' : 'Search'}
          </button>
        </div>
        {results.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-forest-400 uppercase tracking-wider">Results</p>
            {results.map((r, i) => (
              <div key={i} onClick={() => addSong(r)}
                className="flex items-center gap-3 p-3 bg-cream-50 rounded-xl border border-cream-200 cursor-pointer hover:border-forest-300 transition-all">
                <div className="w-9 h-9 bg-forest-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Music2 size={15} className="text-gold-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-forest-700 truncate">{r.title}</p>
                  <p className="text-xs text-forest-400">{r.artist}</p>
                </div>
                <Plus size={16} className="text-forest-400 flex-shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Visual helpers ───────────────────────────────────────────────────────────
function Waveform({ active, color }: { active: boolean; color: string }) {
  return (
    <div className="flex items-center gap-0.5 h-8">
      {WAVEFORM_BARS.map((bar, i) => (
        <div key={i} className="flex-1 rounded-full"
          style={{
            height: active ? `${bar.height}%` : '20%',
            backgroundColor: color,
            opacity: active ? 0.7 : 0.3,
            transition: active ? `height 0.3s ease ${bar.delay}s` : 'height 0.5s ease',
          }}
        />
      ))}
    </div>
  )
}

function RecordingWaveform() {
  return (
    <div className="flex items-center justify-center gap-1 h-10">
      {Array.from({ length: 16 }).map((_, i) => (
        <div key={i} className="w-1 bg-red-400 rounded-full animate-pulse"
          style={{ height: `${20 + (i % 4) * 15}%`, animationDelay: `${i * 0.08}s`, animationDuration: '0.6s' }}
        />
      ))}
    </div>
  )
}
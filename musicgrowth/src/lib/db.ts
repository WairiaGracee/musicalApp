import type {
  PracticeSession,
  WeeklyPlan,
  Goal,
  JournalEntry,
  UserProfile,
  WeeklySong,
  MonthlyChallenge,
} from '../types'

// ─── Keys ─────────────────────────────────────────────────────────────────────
const KEYS = {
  profile: 'mg_profile',
  sessions: 'mg_sessions',
  plans: 'mg_plans',
  goals: 'mg_goals',
  journal: 'mg_journal',
  songs: 'mg_songs',
  challenges: 'mg_challenges',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function get<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]') as T[]
  } catch {
    return []
  }
}

function set<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data))
}

function uid(): string {
  return crypto.randomUUID()
}

// ─── Profile ──────────────────────────────────────────────────────────────────
export const profileDb = {
  get(): UserProfile | null {
    try {
      const raw = localStorage.getItem(KEYS.profile)
      return raw ? (JSON.parse(raw) as UserProfile) : null
    } catch {
      return null
    }
  },
  save(profile: UserProfile): void {
    localStorage.setItem(KEYS.profile, JSON.stringify(profile))
  },
  create(name: string): UserProfile {
    const profile: UserProfile = {
      id: uid(),
      name,
      createdAt: new Date().toISOString(),
      voiceLevel: 'intermediate',
      instrumentLevel: 'beginner',
      goals: [],
    }
    this.save(profile)
    return profile
  },
}

// ─── Sessions ─────────────────────────────────────────────────────────────────
export const sessionsDb = {
  getAll(): PracticeSession[] {
    return get<PracticeSession>(KEYS.sessions).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  },
  add(session: Omit<PracticeSession, 'id'>): PracticeSession {
    const all = get<PracticeSession>(KEYS.sessions)
    const newSession = { ...session, id: uid() }
    set(KEYS.sessions, [newSession, ...all])
    return newSession
  },
  delete(id: string): void {
    set(KEYS.sessions, get<PracticeSession>(KEYS.sessions).filter(s => s.id !== id))
  },
}

// ─── Weekly Plans ─────────────────────────────────────────────────────────────
export const plansDb = {
  getAll(): WeeklyPlan[] {
    return get<WeeklyPlan>(KEYS.plans)
  },
  getCurrent(): WeeklyPlan | null {
    const all = get<WeeklyPlan>(KEYS.plans)
    const today = new Date().toISOString().split('T')[0]
    return all.find(p => p.weekStart <= today && p.weekEnd >= today) ?? null
  },
  add(plan: Omit<WeeklyPlan, 'id'>): WeeklyPlan {
    const all = get<WeeklyPlan>(KEYS.plans)
    const newPlan = { ...plan, id: uid() }
    set(KEYS.plans, [newPlan, ...all])
    return newPlan
  },
  updateTask(planId: string, taskId: string, completed: boolean): void {
    const all = get<WeeklyPlan>(KEYS.plans)
    const updated = all.map(p => {
      if (p.id !== planId) return p
      return {
        ...p,
        tasks: p.tasks.map(t => (t.id === taskId ? { ...t, completed } : t)),
      }
    })
    set(KEYS.plans, updated)
  },
}

// ─── Goals ────────────────────────────────────────────────────────────────────
export const goalsDb = {
  getAll(): Goal[] {
    return get<Goal>(KEYS.goals)
  },
  add(goal: Omit<Goal, 'id'>): Goal {
    const all = get<Goal>(KEYS.goals)
    const newGoal = { ...goal, id: uid() }
    set(KEYS.goals, [newGoal, ...all])
    return newGoal
  },
  update(id: string, updates: Partial<Goal>): void {
    const all = get<Goal>(KEYS.goals)
    set(KEYS.goals, all.map(g => (g.id === id ? { ...g, ...updates } : g)))
  },
  toggleMilestone(goalId: string, milestoneId: string): void {
    const all = get<Goal>(KEYS.goals)
    set(
      KEYS.goals,
      all.map(g => {
        if (g.id !== goalId) return g
        return {
          ...g,
          milestones: g.milestones.map(m =>
            m.id === milestoneId ? { ...m, completed: !m.completed } : m
          ),
        }
      })
    )
  },
}

// ─── Journal ──────────────────────────────────────────────────────────────────
export const journalDb = {
  getAll(): JournalEntry[] {
    return get<JournalEntry>(KEYS.journal).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  },
  add(entry: Omit<JournalEntry, 'id'>): JournalEntry {
    const all = get<JournalEntry>(KEYS.journal)
    const newEntry = { ...entry, id: uid() }
    set(KEYS.journal, [newEntry, ...all])
    return newEntry
  },
  delete(id: string): void {
    set(KEYS.journal, get<JournalEntry>(KEYS.journal).filter(e => e.id !== id))
  },
}

// ─── Seed demo data ───────────────────────────────────────────────────────────
export function seedDemoData(): void {
  if (sessionsDb.getAll().length > 0) return

  const today = new Date()
  const fmt = (d: Date) => d.toISOString().split('T')[0]
  const dayAgo = (n: number) => {
    const d = new Date(today)
    d.setDate(d.getDate() - n)
    return fmt(d)
  }

  sessionsDb.add({ date: dayAgo(0), type: 'voice', durationMinutes: 35, focus: 'Breath support & chest voice', notes: 'Felt strong on lower range today!', mood: 4, techniques: ['Breath support', 'Lip trills'] })
  sessionsDb.add({ date: dayAgo(1), type: 'ear_training', durationMinutes: 20, focus: 'Interval recognition', notes: 'Thirds are getting easier', mood: 3 })
  sessionsDb.add({ date: dayAgo(3), type: 'voice', durationMinutes: 45, focus: 'Head voice transition', notes: 'Struggled a bit with the passaggio but improving', mood: 3, techniques: ['Mixed voice', 'Sirens'] })
  sessionsDb.add({ date: dayAgo(5), type: 'ear_training', durationMinutes: 15, focus: 'Chord quality', notes: 'Major vs minor is clear now', mood: 5 })

  const weekStart = fmt(new Date(today.setDate(today.getDate() - today.getDay() + 1)))
  const weekEnd = fmt(new Date(new Date(weekStart).setDate(new Date(weekStart).getDate() + 6)))

  plansDb.add({
    weekStart,
    weekEnd,
    focus: 'Building consistency in head voice & interval ear training',
    aiSuggestion: "This week, focus on your head voice transition — it's the bridge that will unlock your upper range. Pair it with daily interval ear training to sharpen your musical ear. Try singing along to a song you love in falsetto to make the practice feel joyful!",
    tasks: [
      { id: crypto.randomUUID(), type: 'voice', title: 'Siren exercises', description: 'Do 10 mins of siren glides from chest to head voice daily. Feel for the smooth blend.', daysTarget: 5, completed: true },
      { id: crypto.randomUUID(), type: 'voice', title: 'Learn "Rise Up" by Andra Day', description: 'Work through the verses — great for chest/mix work.', daysTarget: 3, completed: false },
      { id: crypto.randomUUID(), type: 'ear_training', title: 'Interval ear training', description: 'Use musictheory.net or Teoria — 15 mins of interval recognition per session.', resources: ['https://www.musictheory.net/exercises/ear-interval', 'https://teoria.com'], daysTarget: 4, completed: false },
      { id: crypto.randomUUID(), type: 'ear_training', title: 'Chord quality drill', description: 'Practice identifying major, minor, augmented, diminished chords by ear.', daysTarget: 2, completed: false },
    ],
  })

  goalsDb.add({
    type: 'voice',
    title: 'Master my head voice',
    description: 'Develop a smooth, connected head voice that blends naturally with chest voice',
    targetDate: dayAgo(-60),
    status: 'active',
    milestones: [
      { id: crypto.randomUUID(), title: 'Understand the passaggio (break point)', completed: true },
      { id: crypto.randomUUID(), title: 'Do sirens without cracking daily for 2 weeks', completed: false },
      { id: crypto.randomUUID(), title: 'Sing a full song using mixed voice', completed: false },
    ],
  })

  goalsDb.add({
    type: 'ear_training',
    title: 'Identify all intervals by ear',
    description: 'Recognize every interval from unison to octave without hesitation',
    targetDate: dayAgo(-90),
    status: 'active',
    milestones: [
      { id: crypto.randomUUID(), title: 'Perfect unison, octave, perfect 5th', completed: true },
      { id: crypto.randomUUID(), title: 'Major and minor 3rds & 6ths', completed: true },
      { id: crypto.randomUUID(), title: 'Tritone, major & minor 2nd & 7th', completed: false },
    ],
  })

  journalDb.add({
    date: dayAgo(1),
    title: 'Something clicked today',
    content: "I was doing my sirens and for the first time I didn't crack on the transition. It was like my voice just... flowed. I know it won't be consistent yet but this gave me so much hope. Music is such a journey.",
    tags: ['voice', 'breakthrough', 'head voice'],
  })

  // Seed demo songs
  songsDb.add({
    title: 'Rise Up',
    artist: 'Andra Day',
    addedDate: fmt(today),
    techniques: ['Belting', 'Breath support', 'Chest voice', 'Vibrato'],
    vocalLayers: { lead: true, backing: false },
    recordings: [],
    notes: 'Focus on the chorus belt — keep breath engaged throughout.',
  })

  // Seed monthly challenge
  const monthKey = fmt(today).slice(0, 7)
  challengesDb.saveMonth({
    id: crypto.randomUUID(),
    month: monthKey,
    title: 'Riffs & Runs',
    skill: 'Riffs & Runs',
    description: 'This month we master vocal riffs and runs — the ornamental melismatic phrases that add flair and personality to your voice. From simple 3-note riffs to full gospel runs, you\'ll build speed, accuracy, and musicality.',
    targetSong: 'Halo by Beyoncé',
    completedDays: [],
    exercises: [
      { id: crypto.randomUUID(), title: 'The 3-note riff drill', description: 'Sing Do-Re-Mi-Re-Do quickly on each note of the scale. Start slow (♩=60), build to ♩=100. Aim for clean articulation on each note.', completed: false },
      { id: crypto.randomUUID(), title: 'The pentatonic run', description: 'Run up and down the pentatonic scale (1-2-3-5-6) in one breath. Keep your throat relaxed — tension kills runs.', completed: false },
      { id: crypto.randomUUID(), title: 'Gospel turn pattern', description: 'Practice the classic gospel turn: 3-2-1-2-3. Slow it down, then speed it up. Record yourself and listen back.', completed: false },
      { id: crypto.randomUUID(), title: 'Copy a riff from your song', description: 'Pick one riff from your chosen song this week and slow it down to learn every note. Then sing it at full speed.', completed: false },
    ],
  })
}

// ─── Songs ────────────────────────────────────────────────────────────────────
export const songsDb = {
  getAll(): WeeklySong[] {
    return get<WeeklySong>(KEYS.songs)
  },
  getThisWeek(): WeeklySong[] {
    const today = new Date()
    const monday = new Date(today)
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7))
    monday.setHours(0, 0, 0, 0)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    sunday.setHours(23, 59, 59, 999)
    return get<WeeklySong>(KEYS.songs).filter(s => {
      const d = new Date(s.addedDate)
      return d >= monday && d <= sunday
    })
  },
  add(song: Omit<WeeklySong, 'id'>): WeeklySong {
    const all = get<WeeklySong>(KEYS.songs)
    const newSong = { ...song, id: crypto.randomUUID() }
    set(KEYS.songs, [newSong, ...all])
    return newSong
  },
  update(id: string, updates: Partial<WeeklySong>): void {
    const all = get<WeeklySong>(KEYS.songs)
    set(KEYS.songs, all.map(s => s.id === id ? { ...s, ...updates } : s))
  },
  delete(id: string): void {
    set(KEYS.songs, get<WeeklySong>(KEYS.songs).filter(s => s.id !== id))
  },
  addRecording(songId: string, recording: Omit<WeeklySong['recordings'][0], 'id'>): void {
    const all = get<WeeklySong>(KEYS.songs)
    set(KEYS.songs, all.map(s => {
      if (s.id !== songId) return s
      return { ...s, recordings: [...s.recordings, { ...recording, id: crypto.randomUUID() }] }
    }))
  },
}

// ─── Monthly Challenges ───────────────────────────────────────────────────────
export const challengesDb = {
  getMonth(month: string): MonthlyChallenge | null {
    const all = get<MonthlyChallenge>(KEYS.challenges)
    return all.find(c => c.month === month) ?? null
  },
  saveMonth(challenge: MonthlyChallenge): void {
    const all = get<MonthlyChallenge>(KEYS.challenges).filter(c => c.month !== challenge.month)
    set(KEYS.challenges, [challenge, ...all])
  },
  toggleExercise(month: string, exerciseId: string): void {
    const all = get<MonthlyChallenge>(KEYS.challenges)
    set(KEYS.challenges, all.map(c => {
      if (c.month !== month) return c
      return {
        ...c,
        exercises: c.exercises.map(e =>
          e.id === exerciseId ? { ...e, completed: !e.completed } : e
        ),
      }
    }))
  },
  markDayDone(month: string, date: string): void {
    const all = get<MonthlyChallenge>(KEYS.challenges)
    set(KEYS.challenges, all.map(c => {
      if (c.month !== month) return c
      const already = c.completedDays.includes(date)
      return {
        ...c,
        completedDays: already
          ? c.completedDays.filter(d => d !== date)
          : [...c.completedDays, date],
      }
    }))
  },
}
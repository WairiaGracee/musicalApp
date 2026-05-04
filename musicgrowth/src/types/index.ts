// ─── User & Profile ───────────────────────────────────────────────────────────

export interface UserProfile {
  id: string
  name: string
  createdAt: string
  voiceLevel: 'beginner' | 'intermediate' | 'advanced'
  instrumentLevel: 'beginner' | 'intermediate' | 'advanced'
  goals: string[]
}

// ─── Practice Session ─────────────────────────────────────────────────────────

export type SessionType = 'voice' | 'ear_training'

export interface PracticeSession {
  id: string
  date: string
  type: SessionType
  durationMinutes: number
  focus: string
  notes: string
  mood: 1 | 2 | 3 | 4 | 5
  techniques?: string[]
  songsWorkedOn?: string[]
}

// ─── Weekly Plan ──────────────────────────────────────────────────────────────

export interface WeeklyTask {
  id: string
  type: SessionType
  title: string
  description: string
  resources?: string[]
  completed: boolean
  daysTarget: number
}

export interface WeeklyPlan {
  id: string
  weekStart: string
  weekEnd: string
  focus: string
  tasks: WeeklyTask[]
  aiSuggestion?: string
}

// ─── Goal ─────────────────────────────────────────────────────────────────────

export type GoalStatus = 'active' | 'completed' | 'paused'

export interface Goal {
  id: string
  title: string
  description: string
  type: SessionType | 'general'
  targetDate: string
  status: GoalStatus
  milestones: Milestone[]
}

export interface Milestone {
  id: string
  title: string
  completed: boolean
}

// ─── Journal ──────────────────────────────────────────────────────────────────

export interface JournalEntry {
  id: string
  date: string
  title: string
  content: string
  linkedSession?: string
  tags: string[]
}

// ─── Song Studio ──────────────────────────────────────────────────────────────

export interface WeeklySong {
  id: string
  title: string
  artist: string
  addedDate: string
  techniques: string[]
  vocalLayers: { lead: boolean; backing: boolean }
  recordings: SongRecording[]
  notes: string
}

export interface SongRecording {
  id: string
  date: string
  durationSeconds: number
  feedbackNotes: string
  score: number
}

// ─── Monthly Challenge ────────────────────────────────────────────────────────

export interface MonthlyChallenge {
  id: string
  month: string
  title: string
  skill: string
  description: string
  targetSong?: string
  exercises: ChallengeExercise[]
  completedDays: string[]
}

export interface ChallengeExercise {
  id: string
  title: string
  description: string
  completed: boolean
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface WeeklyStats {
  week: string
  voiceMinutes: number
  earTrainingMinutes: number
  sessionsCount: number
}
export interface Skill {
  metric: string
  experience: number
  level: number
  rank: number
  ehp?: number
}

export interface Boss {
  metric: string
  kills: number
  rank: number
  ehb?: number
}

export interface Activity {
  metric: string
  score: number
  rank: number
}

export interface SnapshotData {
  skills: Record<string, Skill>
  bosses: Record<string, Boss>
  activities: Record<string, Activity>
}

export interface WOMSnapshot {
  id: number
  playerId: number
  createdAt: string
  data: SnapshotData
}

export interface WOMPlayer {
  id: number
  username: string
  displayName: string
  type: string
  build: string
  latestSnapshot: WOMSnapshot | null
  updatedAt: string
}

export interface Player {
  id: string
  username: string
  display_name: string | null
  created_at: string
}

export interface Snapshot {
  id: string
  player_id: string
  taken_at: string
  data: WOMSnapshot
}

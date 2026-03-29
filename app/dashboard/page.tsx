'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatXP } from '@/lib/wom'

interface PlayerWithSnapshot {
  id: string
  username: string
  display_name: string | null
  created_at: string
  snapshots: Array<{ data: any; taken_at: string }>
}

export default function DashboardPage() {
  const [players, setPlayers] = useState<PlayerWithSnapshot[]>([])
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => { loadPlayers() }, [])

  async function loadPlayers() {
    const res = await fetch('/api/players')
    if (res.status === 401) { router.push('/'); return }
    const data = await res.json()
    setPlayers(data)
    setLoading(false)
  }

  async function addPlayer(e: React.FormEvent) {
    e.preventDefault()
    if (!username.trim()) return
    setAdding(true)
    setError('')

    const res = await fetch('/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim() }),
    })

    if (res.ok) {
      setUsername('')
      await loadPlayers()
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to add player')
    }
    setAdding(false)
  }

  async function removePlayer(id: string) {
    if (!confirm('Remove this player?')) return
    await fetch('/api/players', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    await loadPlayers()
  }

  async function logout() {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/')
  }

  function getSortedSnapshots(player: PlayerWithSnapshot) {
    return [...(player.snapshots ?? [])].sort((a, b) =>
      new Date(b.taken_at).getTime() - new Date(a.taken_at).getTime()
    )
  }

  function getLatestSnapshot(player: PlayerWithSnapshot) {
    return getSortedSnapshots(player)[0] ?? null
  }

  function findSnapshotDaysAgo(snapshots: PlayerWithSnapshot['snapshots'], days: number) {
    const target = Date.now() - days * 24 * 60 * 60 * 1000
    return snapshots.slice(1).reduce<typeof snapshots[0] | null>((best, s) => {
      const t = new Date(s.taken_at).getTime()
      if (!best) return s
      return Math.abs(t - target) < Math.abs(new Date(best.taken_at).getTime() - target) ? s : best
    }, null)
  }

  function xpGainSince(snapshots: PlayerWithSnapshot['snapshots'], days: number): number | null | 'no-data' {
    const sorted = getSortedSnapshots({ snapshots } as PlayerWithSnapshot)
    const latest = sorted[0]
    const compare = findSnapshotDaysAgo(sorted, days)
    if (!latest || !compare) return 'no-data'
    const latestXp = latest.data?.data?.skills?.overall?.experience
    const prevXp = compare.data?.data?.skills?.overall?.experience
    if (!latestXp || !prevXp) return 'no-data'
    return latestXp - prevXp
  }

  function renderGain(gain: number | null | 'no-data') {
    if (gain === 'no-data') return <span style={{ color: 'var(--text-3)' }}>—</span>
    if (gain === 0) return <span style={{ color: 'var(--text-2)' }}>+0</span>
    if (gain !== null && gain > 0) return <span style={{ color: '#6ab04c' }}>+{formatXP(gain)}</span>
    return <span style={{ color: 'var(--text-3)' }}>—</span>
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '24px 16px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h1 className="font-runescape" style={{ fontSize: 20, color: 'var(--gold)' }}>
            ⚔️ OSRS Tracker
          </h1>
          <button className="btn-ghost" onClick={logout} style={{ fontSize: 12 }}>Log out</button>
        </div>

        {/* Add player */}
        <div className="panel" style={{ marginBottom: 20 }}>
          <div className="panel-header">Track a Player</div>
          <div style={{ padding: 16 }}>
            <form onSubmit={addPlayer} style={{ display: 'flex', gap: 10 }}>
              <input
                className="osrs-input"
                placeholder="RuneScape username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                disabled={adding}
              />
              <button className="btn-gold" type="submit" disabled={adding || !username.trim()}>
                {adding ? 'Adding...' : 'Add'}
              </button>
            </form>
            {error && <p style={{ color: 'var(--error)', fontSize: 12, marginTop: 8 }}>{error}</p>}
          </div>
        </div>

        {/* Players list */}
        <div className="panel">
          <div className="panel-header">Tracked Players</div>
          {loading ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-3)' }}>Loading...</div>
          ) : players.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
              No players tracked yet. Add one above.
            </div>
          ) : (
            <table className="osrs-table">
              <thead>
                <tr>
                  <th colSpan={3} />
                  <th colSpan={3} style={{ textAlign: 'center', borderBottom: '1px solid var(--gold-dim)', color: 'var(--gold-dim)', paddingBottom: 2, fontSize: 9 }}>
                    EXP Gained
                  </th>
                  <th />
                </tr>
                <tr>
                  <th>Player</th>
                  <th className="num" style={{ whiteSpace: 'nowrap' }}>Level</th>
                  <th className="num" style={{ whiteSpace: 'nowrap' }}>Total EXP</th>
                  <th className="num" style={{ whiteSpace: 'nowrap' }}>24h</th>
                  <th className="num" style={{ whiteSpace: 'nowrap' }}>7d</th>
                  <th className="num" style={{ whiteSpace: 'nowrap' }}>30d</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {players.map(player => {
                  const sorted = getSortedSnapshots(player)
                  const snap = sorted[0] ?? null
                  const overall = snap?.data?.data?.skills?.overall
                  return (
                    <tr key={player.id}>
                      <td>
                        <Link
                          href={`/player/${player.username}`}
                          style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: 500 }}
                        >
                          {player.display_name || player.username}
                        </Link>
                      </td>
                      <td className="num">
                        {overall ? overall.level.toLocaleString() : '—'}
                      </td>
                      <td className="num">
                        {overall ? formatXP(overall.experience) : '—'}
                      </td>
                      <td className="num">{renderGain(xpGainSince(sorted, 1))}</td>
                      <td className="num">{renderGain(xpGainSince(sorted, 7))}</td>
                      <td className="num">{renderGain(xpGainSince(sorted, 30))}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn-danger" onClick={() => removePlayer(player.id)}>Remove</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        <p style={{ marginTop: 12, fontSize: 11, color: 'var(--text-3)', textAlign: 'center' }}>
          Snapshots taken daily · Data via Wise Old Man
        </p>
      </div>
    </div>
  )
}

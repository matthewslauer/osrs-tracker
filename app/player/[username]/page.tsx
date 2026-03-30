'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Player, Snapshot } from '@/types'
import { formatXP, formatNumber } from '@/lib/wom'
import SkillsTab from '@/components/SkillsTab'
import BossesTab from '@/components/BossesTab'
import ActivitiesTab from '@/components/ActivitiesTab'

type Tab = 'skills' | 'bosses' | 'activities'

export default function PlayerPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params)
  const [player, setPlayer] = useState<Player | null>(null)
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [tab, setTab] = useState<Tab>('skills')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/players/${username}`)
      if (res.status === 401) { router.push('/'); return }
      if (!res.ok) { router.push('/dashboard'); return }
      const data = await res.json()
      setPlayer(data.player)
      setSnapshots(data.snapshots)
      setLoading(false)
    }
    load()
  }, [username, router])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--text-3)' }}>Loading...</p>
    </div>
  )

  const latest = snapshots[0]
  const previous = snapshots[1]
  const overall = latest?.data?.data?.skills?.overall
  const totalBossKills = latest ? Object.values(latest.data.data.bosses).reduce((sum, b) => sum + (b?.kills > 0 ? b.kills : 0), 0) : 0
  const totalClues = latest?.data?.data?.activities?.clue_scrolls_all?.score ?? 0

  function findSnapshotDaysAgo(days: number) {
    const target = Date.now() - days * 24 * 60 * 60 * 1000
    return snapshots.slice(1).reduce<Snapshot | null>((best, s) => {
      const t = new Date(s.taken_at).getTime()
      if (!best) return s
      return Math.abs(t - target) < Math.abs(new Date(best.taken_at).getTime() - target) ? s : best
    }, null)
  }

  function xpGainSince(snap: Snapshot | null): number | null | 'no-data' {
    if (!snap || !overall) return 'no-data'
    const prevXp = snap.data?.data?.skills?.overall?.experience
    if (!prevXp) return 'no-data'
    return overall.experience - prevXp
  }

  const snapWeek = findSnapshotDaysAgo(7)
  const snapMonth = findSnapshotDaysAgo(30)
  const gainDay = xpGainSince(previous ?? null)
  const gainWeek = xpGainSince(snapWeek)
  const gainMonth = xpGainSince(snapMonth)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '24px 16px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>

        {/* Back */}
        <Link href="/dashboard" style={{ color: 'var(--text-3)', fontSize: 12, textDecoration: 'none' }}>
          ← Back
        </Link>

        {/* Player header */}
        <div style={{
          marginTop: 12,
          marginBottom: 20,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}>
          <div>
            <h1 className="font-runescape" style={{ fontSize: 24, color: 'var(--gold)', letterSpacing: '0.03em' }}>
              {player?.display_name || username}
            </h1>
            {latest && (
              <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
                Last updated {new Date(latest.taken_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            )}
          </div>

          {overall && (
            <div className="player-header-stats" style={{ display: 'flex', gap: 24, justifyContent: 'flex-end' }}>
              <div className="player-header-stats-row" style={{ display: 'flex', gap: 24, justifyContent: 'flex-end' }}>
                {[
                  { label: 'Total Level', value: overall.level.toLocaleString(), color: 'var(--gold-light)' },
                  { label: 'Total EXP', value: formatXP(overall.experience), color: 'var(--gold-light)' },
                  { label: 'Rank', value: overall.rank > 0 ? formatNumber(overall.rank) : '—', color: 'var(--text-2)' },
                  ...(totalBossKills > 0 ? [{ label: 'Boss KC', value: formatNumber(totalBossKills), color: 'var(--text-2)' }] : []),
                  ...(totalClues > 0 ? [{ label: 'Clues', value: formatNumber(totalClues), color: 'var(--text-2)' }] : []),
                ].map((stat, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 2 }}>{stat.label}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: stat.color, fontFamily: 'Cinzel, serif' }}>{stat.value}</div>
                  </div>
                ))}
              </div>

              <div className="player-header-divider" style={{ width: 1, background: 'var(--border)', alignSelf: 'stretch' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 10, color: 'var(--gold-dim)', fontFamily: 'Cinzel, serif', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  EXP Gained
                </div>
                <div className="player-header-stats-row" style={{ display: 'flex', gap: 24 }}>
                  {[
                    { label: 'Last 24h', gain: gainDay },
                    { label: 'Last 7d', gain: gainWeek },
                    { label: 'Last 30d', gain: gainMonth },
                  ].map(({ label, gain }) => (
                    <div key={label} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 2 }}>{label}</div>
                      <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Cinzel, serif',
                        color: gain === 'no-data' || gain === null ? 'var(--text-3)' : gain > 0 ? '#6ab04c' : 'var(--text-2)' }}>
                        {gain === 'no-data' || gain === null ? '—' : gain > 0 ? `+${formatXP(gain)}` : '+0'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs + content */}
        {latest ? (
          <div className="panel">
            <div className="tab-bar">
              {(['skills', 'bosses', 'activities'] as Tab[]).map(t => (
                <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                  {t}
                </button>
              ))}
            </div>
            <div style={{ padding: 16 }}>
              {tab === 'skills' && <SkillsTab latest={latest} previous={previous} snapshots={snapshots} />}
              {tab === 'bosses' && <BossesTab latest={latest} previous={previous} snapWeek={snapWeek} snapMonth={snapMonth} />}
              {tab === 'activities' && <ActivitiesTab latest={latest} previous={previous} snapWeek={snapWeek} snapMonth={snapMonth} />}
            </div>
          </div>
        ) : (
          <div className="panel" style={{ padding: 48, textAlign: 'center' }}>
            <p style={{ color: 'var(--gold)', fontFamily: 'Cinzel, serif', fontSize: 14, marginBottom: 8 }}>No Data Yet</p>
            <p style={{ color: 'var(--text-3)', fontSize: 13 }}>Check back after the daily snapshot runs.</p>
          </div>
        )}
      </div>
    </div>
  )
}

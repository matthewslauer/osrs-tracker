import { Snapshot } from '@/types'
import { formatNumber, skillLabel } from '@/lib/wom'

interface Props {
  latest: Snapshot
  previous?: Snapshot
  snapWeek?: Snapshot | null
  snapMonth?: Snapshot | null
}

const ACTIVITY_GROUPS: Record<string, string[]> = {
  'Clue Scrolls': [
    'clue_scrolls_all', 'clue_scrolls_beginner', 'clue_scrolls_easy',
    'clue_scrolls_medium', 'clue_scrolls_hard', 'clue_scrolls_elite', 'clue_scrolls_master',
  ],
  'PvP & Minigames': [
    'bounty_hunter_hunter', 'bounty_hunter_rogue', 'last_man_standing',
    'pvp_arena', 'soul_wars_zeal',
  ],
  'Skilling Activities': [
    'guardians_of_the_rift', 'tempoross', 'wintertodt',
  ],
  Other: [
    'league_points', 'deadman_points', 'colosseum_glory', 'collections_logged',
  ],
}

export default function ActivitiesTab({ latest, previous, snapWeek, snapMonth }: Props) {
  const activities = latest.data.data.activities

  function gain(key: string, snap?: Snapshot | null) {
    if (!snap) return null
    const prev = snap.data.data.activities[key]
    if (!prev) return null
    return activities[key].score - prev.score
  }

  function renderGain(val: number | null) {
    if (val === null) return <span style={{ color: 'var(--text-3)' }}>—</span>
    if (val > 0) return <span style={{ color: '#6ab04c' }}>+{formatNumber(val)}</span>
    return <span style={{ color: 'var(--text-2)' }}>+0</span>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {Object.entries(ACTIVITY_GROUPS).map(([group, keys]) => {
        const rows = keys
          .map(key => ({ key, data: activities[key] }))
          .filter(({ data }) => data && data.score > 0)

        if (rows.length === 0) return null

        return (
          <div key={group}>
            <p style={{
              fontFamily: 'Cinzel, serif',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--gold-dim)',
              marginBottom: 6,
            }}>
              {group}
            </p>
            <table className="osrs-table">
              <thead>
                <tr>
                  <th>Activity</th>
                  <th className="num">Score</th>
                  <th className="num">Last 24h</th>
                  <th className="num">Last 7d</th>
                  <th className="num">Last 30d</th>
                  <th className="num">Rank</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ key, data }) => (
                  <tr key={key}>
                    <td>{skillLabel(key)}</td>
                    <td className="num">{formatNumber(data.score)}</td>
                    <td className="num">{renderGain(gain(key, previous))}</td>
                    <td className="num">{renderGain(gain(key, snapWeek))}</td>
                    <td className="num">{renderGain(gain(key, snapMonth))}</td>
                    <td className="num rank">{data.rank > 0 ? formatNumber(data.rank) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      })}

      {Object.values(activities).every(a => !a || a.score <= 0) && (
        <p style={{ color: 'var(--text-3)', fontSize: 13 }}>No activity data recorded.</p>
      )}
    </div>
  )
}

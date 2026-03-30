import { Snapshot } from '@/types'
import { BOSS_GROUPS, formatNumber, skillLabel } from '@/lib/wom'

interface Props {
  latest: Snapshot
  previous?: Snapshot
  snapWeek?: Snapshot | null
  snapMonth?: Snapshot | null
}

export default function BossesTab({ latest, previous, snapWeek, snapMonth }: Props) {
  const bosses = latest.data.data.bosses

  function gain(key: string, snap?: Snapshot | null) {
    if (!snap) return null
    const prev = snap.data.data.bosses[key]
    if (!prev) return null
    const diff = bosses[key].kills - prev.kills
    return diff
  }

  function renderGain(val: number | null) {
    if (val === null) return <span style={{ color: 'var(--text-3)' }}>—</span>
    if (val > 0) return <span style={{ color: '#6ab04c' }}>+{formatNumber(val)}</span>
    return <span style={{ color: 'var(--text-2)' }}>+0</span>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {Object.entries(BOSS_GROUPS).map(([group, bossKeys]) => {
        const rows = bossKeys
          .map(key => ({ key, data: bosses[key] }))
          .filter(({ data }) => data && data.kills > 0)

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
            <div className="table-scroll"><table className="osrs-table">
              <thead>
                <tr>
                  <th>Boss</th>
                  <th className="num">Kills</th>
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
                    <td className="num">{formatNumber(data.kills)}</td>
                    <td className="num">{renderGain(gain(key, previous))}</td>
                    <td className="num">{renderGain(gain(key, snapWeek))}</td>
                    <td className="num">{renderGain(gain(key, snapMonth))}</td>
                    <td className="num rank">{data.rank > 0 ? formatNumber(data.rank) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          </div>
        )
      })}

      {Object.values(bosses).every(b => !b || b.kills <= 0) && (
        <p style={{ color: 'var(--text-3)', fontSize: 13 }}>No boss kills recorded.</p>
      )}
    </div>
  )
}

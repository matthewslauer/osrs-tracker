'use client'

import { useState, useMemo } from 'react'
import { Snapshot } from '@/types'
import { SKILLS, SKILL_ICONS, formatXP, formatNumber, skillLabel, getLevelProgress } from '@/lib/wom'
import XPChart from './XPChart'

interface Props {
  latest: Snapshot
  snapshots: Snapshot[]
}

const MILESTONE_PCT = 0.9

const GAIN_PERIODS = [
  { label: '1D', days: 1 },
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
]

export default function SkillsTab({ latest, snapshots }: Props) {
  const [selectedSkill, setSelectedSkill] = useState<string>('overall')
  const [showVirtual, setShowVirtual] = useState(false)
  const [gainPeriod, setGainPeriod] = useState(1)
  const skills = latest.data.data.skills

  // Find comparison snapshot for selected gain period
  const compareSnapshot = useMemo(() => {
    const sorted = [...snapshots].sort((a, b) =>
      new Date(b.taken_at).getTime() - new Date(a.taken_at).getTime()
    )
    const target = Date.now() - gainPeriod * 24 * 60 * 60 * 1000
    return sorted.slice(1).reduce<Snapshot | null>((best, s) => {
      const t = new Date(s.taken_at).getTime()
      if (!best) return s
      return Math.abs(t - target) < Math.abs(new Date(best.taken_at).getTime() - target) ? s : best
    }, null)
  }, [snapshots, gainPeriod])

  // Heatmap normalization
  const maxGain = useMemo(() => {
    const gains = SKILLS.filter(s => s !== 'overall').map(skill => {
      const s = skills[skill]
      const prev = compareSnapshot?.data.data.skills[skill]
      return (s && prev) ? Math.max(0, s.experience - prev.experience) : 0
    })
    return Math.max(...gains, 1)
  }, [skills, compareSnapshot])

  return (
    <div>
      {/* Chart */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--gold)', fontFamily: 'Cinzel, serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {skillLabel(selectedSkill)} — EXP Over Time
          </span>
        </div>
        <XPChart snapshots={snapshots} skill={selectedSkill} />
      </div>

      {/* Controls row below chart */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--text-3)' }}>EXP Gains:</span>
          {GAIN_PERIODS.map(p => (
            <button
              key={p.label}
              onClick={() => setGainPeriod(p.days)}
              style={{
                fontSize: 11, padding: '3px 10px',
                background: gainPeriod === p.days ? 'var(--surface3)' : 'transparent',
                border: `1px solid ${gainPeriod === p.days ? 'var(--gold-dim)' : 'var(--border)'}`,
                borderRadius: 4,
                color: gainPeriod === p.days ? 'var(--gold)' : 'var(--text-3)',
                cursor: 'pointer',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 11, color: 'var(--text-3)', userSelect: 'none' }}>
          <input
            type="checkbox"
            checked={showVirtual}
            onChange={e => setShowVirtual(e.target.checked)}
            style={{ accentColor: 'var(--gold)', cursor: 'pointer' }}
          />
          Virtual levels
        </label>
      </div>

      {/* Skill grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
        gap: 6,
        marginBottom: 16,
      }}>
        {SKILLS.filter(s => s !== 'overall').map(skill => {
          const s = skills[skill]
          if (!s) return null
          const prev = compareSnapshot?.data.data.skills[skill]
          const gain = prev ? Math.max(0, s.experience - prev.experience) : 0
          const isSelected = selectedSkill === skill
          const heat = gain / maxGain
          const { virtualLevel, progressPct, xpToNext } = getLevelProgress(s.experience)
          const isMilestone = progressPct >= MILESTONE_PCT
          const isMaxed = virtualLevel >= 99
          const showXpToLevel = xpToNext !== null && (virtualLevel < 99 || showVirtual)

          const heatBg = heat > 0
            ? `linear-gradient(135deg, rgba(200,155,60,${heat * 0.18}) 0%, var(--surface2) 100%)`
            : undefined

          return (
            <button
              key={skill}
              onClick={() => setSelectedSkill(skill)}
              style={{
                background: isSelected ? 'var(--surface3)' : heatBg ?? 'var(--surface2)',
                border: `1px solid ${isSelected ? 'var(--gold)' : isMilestone ? 'rgba(200,155,60,0.5)' : 'var(--border)'}`,
                borderRadius: 6,
                padding: '10px 10px 0',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'left',
                transition: 'border-color 0.12s, background 0.12s',
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <img
                  src={SKILL_ICONS[skill]}
                  alt={skill}
                  width={16}
                  height={16}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
                <span style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'capitalize' }}>
                  {skillLabel(skill)}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--gold-light)', fontVariantNumeric: 'tabular-nums' }}>
                  {isMaxed ? 99 : virtualLevel}
                  {showVirtual && virtualLevel > 99 && (
                    <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-3)', marginLeft: 3 }}>
                      ({virtualLevel})
                    </span>
                  )}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
                  {formatXP(s.experience)}
                </span>
              </div>

              <div style={{ height: 14, display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                <span style={{ fontSize: 10, color: '#6ab04c' }}>
                  {gain > 0 ? `+${formatXP(gain)}` : ''}
                </span>
              </div>
              <div style={{ height: 14, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 4 }}>
                <span style={{ fontSize: 10, color: isMilestone ? 'var(--gold)' : 'var(--text-3)' }}>
                  {showXpToLevel ? `${formatXP(xpToNext!)} to lvl` : ''}
                </span>
              </div>

              <div style={{ height: 3, background: 'var(--border)', marginLeft: -10, marginRight: -10 }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(progressPct * 100, 100)}%`,
                  background: isMilestone ? '#c89b3c' : virtualLevel >= 99 ? '#6ab04c' : 'var(--gold-dim)',
                  transition: 'width 0.3s ease',
                }} />
              </div>
            </button>
          )
        })}
      </div>

      {/* Overall row */}
      {skills.overall && (
        <button
          onClick={() => setSelectedSkill('overall')}
          className="skills-total-btn"
          style={{
            width: '100%',
            background: selectedSkill === 'overall' ? 'var(--surface3)' : 'var(--surface2)',
            border: `1px solid ${selectedSkill === 'overall' ? 'var(--gold)' : 'var(--border)'}`,
            borderRadius: 6,
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
            cursor: 'pointer',
            transition: 'border-color 0.12s, background 0.12s',
          }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 60 }}>
            <img src={SKILL_ICONS.overall} alt="overall" width={18} height={18} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 12, color: 'var(--gold)', letterSpacing: '0.05em' }}>Total</span>
          </div>
          <div className="skills-total-stats" style={{ display: 'flex', gap: 32 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Level</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--gold-light)' }}>{skills.overall.level.toLocaleString()}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>EXP</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--gold-light)' }}>{formatXP(skills.overall.experience)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Rank</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-2)' }}>{skills.overall.rank > 0 ? formatNumber(skills.overall.rank) : '—'}</div>
            </div>
          </div>
        </button>
      )}

      <p style={{ fontSize: 11, color: 'var(--text-3)' }}>Click a skill to view EXP history</p>
    </div>
  )
}

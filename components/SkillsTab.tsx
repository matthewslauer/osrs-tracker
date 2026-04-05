'use client'

import { useState } from 'react'
import { Snapshot } from '@/types'
import { SKILLS, SKILL_ICONS, formatXP, formatNumber, skillLabel, getLevelProgress } from '@/lib/wom'
import XPChart from './XPChart'

interface Props {
  latest: Snapshot
  previous?: Snapshot
  snapshots: Snapshot[]
}

const MILESTONE_PCT = 0.9 // highlight when >= 90% to next level

export default function SkillsTab({ latest, previous, snapshots }: Props) {
  const [selectedSkill, setSelectedSkill] = useState<string>('overall')
  const [showVirtual, setShowVirtual] = useState(false)
  const skills = latest.data.data.skills

  // Calculate max gain across all skills for heatmap normalization
  const allGains = SKILLS.filter(s => s !== 'overall').map(skill => {
    const s = skills[skill]
    const prev = previous?.data.data.skills[skill]
    return (s && prev) ? Math.max(0, s.experience - prev.experience) : 0
  })
  const maxGain = Math.max(...allGains, 1)

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--gold)', fontFamily: 'Cinzel, serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {skillLabel(selectedSkill)} — EXP Over Time
          </span>
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
        <XPChart snapshots={snapshots} skill={selectedSkill} />
      </div>

      {/* Skill grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
        gap: 6,
        marginBottom: 16,
      }}>
        {SKILLS.filter(s => s !== 'overall').map((skill, idx) => {
          const s = skills[skill]
          if (!s) return null
          const prev = previous?.data.data.skills[skill]
          const gain = prev ? Math.max(0, s.experience - prev.experience) : 0
          const isSelected = selectedSkill === skill
          const heat = gain / maxGain
          const { virtualLevel, progressPct, xpToNext } = getLevelProgress(s.experience)
          const isMilestone = progressPct >= MILESTONE_PCT
          const isMaxed = virtualLevel >= 99
          const showXpToLevel = xpToNext !== null && (virtualLevel < 99 || showVirtual)

          // Heatmap: warm gold tint scaled by relative gain
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
              {/* Top: icon + name */}
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

              {/* Level + EXP */}
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

              {/* Fixed-height info row — always takes same space */}
              <div style={{ height: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 10, color: '#6ab04c' }}>
                  {gain > 0 ? `+${formatXP(gain)} (24h)` : ''}
                </span>
                {showXpToLevel && (
                  <span style={{ fontSize: 10, color: isMilestone ? 'var(--gold)' : 'var(--text-3)' }}>
                    {formatXP(xpToNext!)} to lvl
                  </span>
                )}
              </div>

              {/* Progress bar — always at bottom */}
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

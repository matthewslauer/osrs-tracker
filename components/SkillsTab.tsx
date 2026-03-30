'use client'

import { useState } from 'react'
import { Snapshot } from '@/types'
import { SKILLS, SKILL_ICONS, formatXP, formatNumber, skillLabel } from '@/lib/wom'
import XPChart from './XPChart'

interface Props {
  latest: Snapshot
  previous?: Snapshot
  snapshots: Snapshot[]
}

export default function SkillsTab({ latest, previous, snapshots }: Props) {
  const [selectedSkill, setSelectedSkill] = useState<string>('overall')
  const skills = latest.data.data.skills

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--gold)', fontFamily: 'Cinzel, serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {skillLabel(selectedSkill)} — EXP Over Time
          </span>
        </div>
        <XPChart snapshots={snapshots} skill={selectedSkill} />
      </div>

      {/* Skill grid for non-overall skills */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
        gap: 6,
        marginBottom: 16,
      }}>
        {SKILLS.filter(s => s !== 'overall').map(skill => {
          const s = skills[skill]
          if (!s) return null
          const prev = previous?.data.data.skills[skill]
          const gain = prev ? s.experience - prev.experience : null
          const isSelected = selectedSkill === skill

          return (
            <button
              key={skill}
              onClick={() => setSelectedSkill(skill)}
              style={{
                background: isSelected ? 'var(--surface3)' : 'var(--surface2)',
                border: `1px solid ${isSelected ? 'var(--gold)' : 'var(--border)'}`,
                borderRadius: 6,
                padding: '10px 10px 8px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                textAlign: 'left',
                transition: 'border-color 0.12s, background 0.12s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--gold-light)', fontVariantNumeric: 'tabular-nums' }}>
                  {s.level}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
                  {formatXP(s.experience)} exp
                </span>
              </div>
              {gain !== null && gain > 0 && (
                <span style={{ fontSize: 10, color: '#6ab04c' }}>+{formatXP(gain)} exp</span>
              )}
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

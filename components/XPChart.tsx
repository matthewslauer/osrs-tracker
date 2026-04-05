'use client'

import { useState } from 'react'
import { Snapshot } from '@/types'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { formatXP } from '@/lib/wom'

interface Props {
  snapshots: Snapshot[]
  skill: string
}

const WINDOWS = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: 'All', days: null },
]

export default function XPChart({ snapshots, skill }: Props) {
  const [window, setWindow] = useState<number | null>(null)

  const cutoff = window ? Date.now() - window * 24 * 60 * 60 * 1000 : null

  const data = [...snapshots]
    .reverse()
    .filter(s => !cutoff || new Date(s.taken_at).getTime() >= cutoff)
    .map(s => ({
      date: new Date(s.taken_at).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
      xp: s.data.data.skills[skill]?.experience ?? 0,
      level: s.data.data.skills[skill]?.level ?? 0,
    }))
    .filter(d => d.xp > 0)

  if (data.length < 2) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-3)', fontSize: 13,
        background: 'var(--surface2)', borderRadius: 6, border: '1px solid var(--border)' }}>
        Not enough data points yet for a chart.
      </div>
    )
  }

  const xpValues = data.map(d => d.xp)
  const minXp = Math.min(...xpValues)
  const maxXp = Math.max(...xpValues)
  const padding = (maxXp - minXp) * 0.05
  const yMin = Math.floor((minXp - padding) / 1000) * 1000
  const yMax = Math.ceil((maxXp + padding) / 1000) * 1000

  return (
    <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '12px 8px 8px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4, marginBottom: 8, paddingRight: 8 }}>
        {WINDOWS.map(w => (
          <button
            key={w.label}
            onClick={() => setWindow(w.days)}
            style={{
              fontSize: 11, padding: '2px 8px',
              background: window === w.days ? 'var(--surface3)' : 'transparent',
              border: `1px solid ${window === w.days ? 'var(--gold-dim)' : 'var(--border)'}`,
              borderRadius: 4,
              color: window === w.days ? 'var(--gold)' : 'var(--text-3)',
              cursor: 'pointer',
            }}
          >
            {w.label}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="date"
            tick={{ fill: 'var(--text-3)', fontSize: 11 }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatXP}
            tick={{ fill: 'var(--text-3)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={60}
            domain={[yMin, yMax]}
          />
          <Tooltip
            contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, fontSize: 12 }}
            labelStyle={{ color: 'var(--text-2)' }}
            formatter={(value) => [Number(value).toLocaleString() + ' EXP', 'Experience']}
          />
          <Line
            type="monotone"
            dataKey="xp"
            stroke="var(--gold)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: 'var(--gold)' }}
          />
        </LineChart>
      </ResponsiveContainer>
      </div>
    </div>
  )
}

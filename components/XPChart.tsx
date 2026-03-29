'use client'

import { Snapshot } from '@/types'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { formatXP } from '@/lib/wom'

interface Props {
  snapshots: Snapshot[]
  skill: string
}

export default function XPChart({ snapshots, skill }: Props) {
  const data = [...snapshots]
    .reverse()
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

  return (
    <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '16px 8px 8px' }}>
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
  )
}

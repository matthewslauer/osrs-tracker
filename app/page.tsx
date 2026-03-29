'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push('/dashboard')
    } else {
      setError('Incorrect passphrase')
      setPassword('')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
    }}>
      <div style={{ width: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64, margin: '0 auto 16px',
            background: 'var(--surface2)',
            border: '2px solid var(--border)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28,
          }}>⚔️</div>
          <h1 className="font-runescape" style={{ fontSize: 22, color: 'var(--gold)', letterSpacing: '0.05em' }}>
            OSRS Tracker
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 6 }}>
            Enter the passphrase to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            className="osrs-input"
            type="password"
            placeholder="Passphrase"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoFocus
          />
          {error && <p style={{ color: 'var(--error)', fontSize: 12 }}>{error}</p>}
          <button className="btn-gold" type="submit" disabled={loading || !password}>
            {loading ? 'Checking...' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  )
}

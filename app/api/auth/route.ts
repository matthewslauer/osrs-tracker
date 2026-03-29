import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { setAuthCookie, clearAuthCookie, isAuthenticated } from '@/lib/auth'
import { checkRateLimit, clearRateLimit } from '@/lib/rateLimit'

function getIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
}

export async function POST(req: NextRequest) {
  const ip = getIp(req)
  const { allowed } = checkRateLimit(ip)

  if (!allowed) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })
  }

  const { password } = await req.json()
  const expected = process.env.TRACKER_PASSWORD!

  let valid = false
  try {
    valid = timingSafeEqual(Buffer.from(password ?? ''), Buffer.from(expected))
  } catch {
    // Buffers different lengths — wrong password
  }

  if (valid) {
    clearRateLimit(ip)
    await setAuthCookie()
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
}

export async function DELETE(req: NextRequest) {
  // Validate origin to prevent CSRF logout
  const origin = req.headers.get('origin')
  const host = req.headers.get('host')
  if (origin && host && !origin.endsWith(host)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await clearAuthCookie()
  return NextResponse.json({ success: true })
}

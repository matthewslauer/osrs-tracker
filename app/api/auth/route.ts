import { NextRequest, NextResponse } from 'next/server'
import { setAuthCookie, clearAuthCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { password } = await req.json()

  if (password === process.env.TRACKER_PASSWORD) {
    await setAuthCookie()
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ success: false }, { status: 401 })
}

export async function DELETE() {
  await clearAuthCookie()
  return NextResponse.json({ success: true })
}

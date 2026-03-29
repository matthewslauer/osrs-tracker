import { cookies } from 'next/headers'
import { createHash, randomBytes, timingSafeEqual } from 'crypto'

const SESSION_COOKIE = 'osrs_session'

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

function generateToken(): string {
  return randomBytes(32).toString('hex')
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE)
  if (!session?.value) return false

  // Cookie stores "token:hashedPassword" — verify both
  const [token, storedHash] = session.value.split(':')
  if (!token || !storedHash) return false

  const expectedHash = hashToken(process.env.TRACKER_PASSWORD!)
  try {
    return timingSafeEqual(Buffer.from(storedHash, 'hex'), Buffer.from(expectedHash, 'hex'))
  } catch {
    return false
  }
}

export async function setAuthCookie() {
  const cookieStore = await cookies()
  const token = generateToken()
  const hashedPassword = hashToken(process.env.TRACKER_PASSWORD!)
  cookieStore.set(SESSION_COOKIE, `${token}:${hashedPassword}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
}

export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

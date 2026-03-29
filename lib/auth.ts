import { cookies } from 'next/headers'

const SESSION_COOKIE = 'osrs_session'
const PASSWORD = process.env.TRACKER_PASSWORD!

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE)
  return session?.value === PASSWORD
}

export async function setAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, PASSWORD, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
}

export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

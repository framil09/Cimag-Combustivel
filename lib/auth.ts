import { SignJWT, jwtVerify } from 'jose'
import { db } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret-change-me')

export interface SessionUser {
  id: string
  name: string
  email: string
  role: string
}

export interface Session {
  user: SessionUser
}

export async function signJWT(payload: SessionUser): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret)
}

export async function verifyJWT(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return {
      id: payload.id as string,
      name: payload.name as string,
      email: payload.email as string,
      role: payload.role as string,
    }
  } catch {
    return null
  }
}

export async function getSession(request: Request): Promise<Session | null> {
  const cookieHeader = request.headers.get('cookie') || ''
  const match = cookieHeader.match(/session-token=([^;]+)/)
  if (!match) return null

  const user = await verifyJWT(match[1])
  if (!user) return null

  return { user }
}

export async function authenticate(email: string, password: string): Promise<SessionUser | null> {
  try {
    const result = await db.execute({
      sql: 'SELECT id, name, email, password, role FROM User WHERE email = ?',
      args: [email],
    })

    const user = result.rows[0]
    if (!user) return null

    const isValid = await bcrypt.compare(password, String(user.password))
    if (!isValid) return null

    return {
      id: String(user.id),
      name: String(user.name),
      email: String(user.email),
      role: String(user.role),
    }
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}

export function createSessionCookie(token: string): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `session-token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}${secure}`
}

export function deleteSessionCookie(): string {
  return 'session-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
}

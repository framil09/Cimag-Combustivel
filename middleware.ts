import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import type { NextRequest } from 'next/server'

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret-change-me')

async function getSessionFromCookie(req: NextRequest) {
  const token = req.cookies.get('session-token')?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch {
    return null
  }
}

export async function middleware(req: NextRequest) {
  const session = await getSessionFromCookie(req)
  const { pathname } = req.nextUrl

  // Se não autenticado e não está na página de login/api, redireciona para /login
  if (!session && pathname !== '/login' && !pathname.startsWith('/api/auth')) {
    const loginUrl = new URL('/login', req.url)
    return NextResponse.redirect(loginUrl)
  }

  // Se autenticado e está no /login, redireciona para home
  if (session && pathname === '/login') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/admin/:path*',
  ],
}

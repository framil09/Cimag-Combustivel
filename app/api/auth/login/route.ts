export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { authenticate, signJWT, createSessionCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 })
  }

  const user = await authenticate(email, password)
  if (!user) {
    return NextResponse.json({ error: 'Email ou senha incorretos' }, { status: 401 })
  }

  const token = await signJWT(user)
  const response = NextResponse.json({ user })
  response.headers.set('Set-Cookie', createSessionCookie(token))

  return response
}

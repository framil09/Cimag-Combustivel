export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { generatePassword, sendWelcomeEmail } from '@/lib/email'

export async function GET(req: NextRequest) {
  const session = await getSession(req)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const result = await db.execute({
    sql: 'SELECT id, name, email, role, createdAt FROM User ORDER BY createdAt DESC',
    args: [],
  })

  return NextResponse.json(result.rows)
}

export async function POST(req: NextRequest) {
  const session = await getSession(req)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const body = await req.json()
  const { name, email, role } = body

  if (!name || !email) {
    return NextResponse.json({ error: 'Nome e email são obrigatórios' }, { status: 400 })
  }

  const existing = await db.execute({
    sql: 'SELECT id FROM User WHERE email = ?',
    args: [email],
  })
  if (existing.rows.length > 0) {
    return NextResponse.json({ error: 'Email já cadastrado' }, { status: 400 })
  }

  const plainPassword = generatePassword()
  const hashedPassword = await bcrypt.hash(plainPassword, 10)
  const now = new Date().toISOString()

  await db.execute({
    sql: 'INSERT INTO User (name, email, password, role, createdAt) VALUES (?, ?, ?, ?, ?)',
    args: [name, email, hashedPassword, role || 'user', now],
  })

  const inserted = await db.execute({
    sql: 'SELECT id, name, email, role, createdAt FROM User WHERE email = ?',
    args: [email],
  })
  const user = inserted.rows[0]

  let emailSent = false
  try {
    await sendWelcomeEmail(email, name, plainPassword)
    emailSent = true
  } catch (error) {
    console.error('Erro ao enviar email:', error)
  }

  return NextResponse.json({ ...user, emailSent, generatedPassword: emailSent ? undefined : plainPassword }, { status: 201 })
}

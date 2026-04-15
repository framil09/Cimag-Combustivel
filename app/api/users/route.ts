import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { generatePassword, sendWelcomeEmail } from '@/lib/email'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(users)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const body = await req.json()
  const { name, email, role } = body

  if (!name || !email) {
    return NextResponse.json({ error: 'Nome e email são obrigatórios' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'Email já cadastrado' }, { status: 400 })
  }

  const plainPassword = generatePassword()
  const hashedPassword = await bcrypt.hash(plainPassword, 10)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  })

  // Enviar email com credenciais
  let emailSent = false
  try {
    await sendWelcomeEmail(email, name, plainPassword)
    emailSent = true
  } catch (error) {
    console.error('Erro ao enviar email:', error)
  }

  return NextResponse.json({ ...user, emailSent, generatedPassword: emailSent ? undefined : plainPassword }, { status: 201 })
}

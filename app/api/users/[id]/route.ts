import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const userId = parseInt(params.id)

  // Não permite deletar a si mesmo
  if (String(userId) === session.user.id) {
    return NextResponse.json({ error: 'Não é possível remover seu próprio usuário' }, { status: 400 })
  }

  // Não permite deletar o último admin
  const targetUser = await prisma.user.findUnique({ where: { id: userId } })
  if (!targetUser) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
  }
  if (targetUser.role === 'admin') {
    const adminCount = await prisma.user.count({ where: { role: 'admin' } })
    if (adminCount <= 1) {
      return NextResponse.json({ error: 'Não é possível remover o último administrador' }, { status: 400 })
    }
  }

  await prisma.user.delete({ where: { id: userId } })

  return NextResponse.json({ success: true })
}

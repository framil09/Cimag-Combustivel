import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/prisma'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession(req)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const userId = parseInt(params.id)

  // Não permite deletar a si mesmo
  if (String(userId) === session.user.id) {
    return NextResponse.json({ error: 'Não é possível remover seu próprio usuário' }, { status: 400 })
  }

  // Não permite deletar o último admin
  const targetResult = await db.execute({
    sql: 'SELECT id, role FROM User WHERE id = ?',
    args: [userId],
  })
  if (targetResult.rows.length === 0) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
  }
  const targetUser = targetResult.rows[0]
  if (targetUser.role === 'admin') {
    const countResult = await db.execute({
      sql: "SELECT COUNT(*) as count FROM User WHERE role = 'admin'",
      args: [],
    })
    const adminCount = Number(countResult.rows[0].count)
    if (adminCount <= 1) {
      return NextResponse.json({ error: 'Não é possível remover o último administrador' }, { status: 400 })
    }
  }

  await db.execute({ sql: 'DELETE FROM User WHERE id = ?', args: [userId] })

  return NextResponse.json({ success: true })
}

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = 'admin@cimag.com'

  const existing = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (existing) {
    console.log('Admin já existe:', existing.email)
    return
  }

  const hashedPassword = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.create({
    data: {
      name: 'Administrador',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
    },
  })

  console.log('Admin criado com sucesso!')
  console.log('Email:', admin.email)
  console.log('Senha: admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

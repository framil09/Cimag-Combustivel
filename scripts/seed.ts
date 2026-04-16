import { createClient } from '@libsql/client'
import bcrypt from 'bcryptjs'

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

async function main() {
  // Create tables if not exist
  await db.execute(`
    CREATE TABLE IF NOT EXISTS User (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS RegistroKm (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero INTEGER NOT NULL,
      data TEXT NOT NULL,
      placa TEXT NOT NULL,
      veiculo TEXT NOT NULL,
      motorista TEXT NOT NULL,
      departamento TEXT NOT NULL,
      destino TEXT NOT NULL,
      finalidade TEXT NOT NULL,
      kmInicial REAL NOT NULL,
      kmFinal REAL NOT NULL,
      kmPercorrido REAL NOT NULL,
      combustivel TEXT NOT NULL,
      litros REAL NOT NULL DEFAULT 0,
      valorLitro REAL NOT NULL DEFAULT 0,
      valorTotal REAL NOT NULL DEFAULT 0,
      kmLitro REAL NOT NULL DEFAULT 0,
      posto TEXT NOT NULL DEFAULT '',
      observacoes TEXT NOT NULL DEFAULT '',
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)

  await db.execute(`CREATE INDEX IF NOT EXISTS idx_registro_data ON RegistroKm(data)`)
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_registro_placa ON RegistroKm(placa)`)
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_registro_motorista ON RegistroKm(motorista)`)

  const adminEmail = 'admin@cimag.com'

  const existing = await db.execute({
    sql: 'SELECT id FROM User WHERE email = ?',
    args: [adminEmail],
  })

  if (existing.rows.length > 0) {
    console.log('Admin já existe:', adminEmail)
    return
  }

  const hashedPassword = await bcrypt.hash('admin123', 10)
  const now = new Date().toISOString()

  await db.execute({
    sql: 'INSERT INTO User (name, email, password, role, createdAt) VALUES (?, ?, ?, ?, ?)',
    args: ['Administrador', adminEmail, hashedPassword, 'admin', now],
  })

  console.log('Admin criado com sucesso!')
  console.log('Email:', adminEmail)
  console.log('Senha: admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })

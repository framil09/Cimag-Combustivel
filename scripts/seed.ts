import bcrypt from 'bcryptjs'

// Simple Turso HTTP client for seeding
async function execute(url: string, authToken: string, sql: string, args: any[] = []) {
  const fmtArgs = args.map((a) => {
    if (a === null || a === undefined) return { type: 'null', value: null }
    if (typeof a === 'number') return Number.isInteger(a) ? { type: 'integer', value: String(a) } : { type: 'float', value: a }
    return { type: 'text', value: String(a) }
  })
  const res = await fetch(`${url}/v3/pipeline`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ requests: [{ type: 'execute', stmt: { sql, args: fmtArgs } }, { type: 'close' }] }),
  })
  if (!res.ok) throw new Error(`Turso error ${res.status}: ${await res.text()}`)
  const data = await res.json() as any
  const result = data.results?.[0]
  if (result?.type === 'error') throw new Error(`SQL error: ${result.error?.message}`)
  const response = result?.response?.result
  if (!response) return { rows: [] as any[], rowsAffected: 0 }
  const cols = response.cols?.map((c: any) => c.name) || []
  const rows = (response.rows || []).map((row: any[]) => {
    const obj: Record<string, any> = {}
    row.forEach((cell: any, i: number) => { obj[cols[i]] = cell.type === 'null' ? null : cell.value })
    return obj
  })
  return { rows, rowsAffected: response.affected_row_count || 0 }
}

const dbUrl = process.env.TURSO_DATABASE_URL!
const dbToken = process.env.TURSO_AUTH_TOKEN!

async function db(sql: string, args: any[] = []) {
  return execute(dbUrl, dbToken, sql, args)
}

async function main() {
  // Create tables if not exist
  await db(`
    CREATE TABLE IF NOT EXISTS User (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)

  await db(`
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

  await db(`CREATE INDEX IF NOT EXISTS idx_registro_data ON RegistroKm(data)`)
  await db(`CREATE INDEX IF NOT EXISTS idx_registro_placa ON RegistroKm(placa)`)
  await db(`CREATE INDEX IF NOT EXISTS idx_registro_motorista ON RegistroKm(motorista)`)

  const adminEmail = 'admin@cimag.com'

  const existing = await db('SELECT id FROM User WHERE email = ?', [adminEmail])

  if (existing.rows.length > 0) {
    console.log('Admin já existe:', adminEmail)
    return
  }

  const hashedPassword = await bcrypt.hash('admin123', 10)
  const now = new Date().toISOString()

  await db(
    'INSERT INTO User (name, email, password, role, createdAt) VALUES (?, ?, ?, ?, ?)',
    ['Administrador', adminEmail, hashedPassword, 'admin', now],
  )

  console.log('Admin criado com sucesso!')
  console.log('Email:', adminEmail)
  console.log('Senha: admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })

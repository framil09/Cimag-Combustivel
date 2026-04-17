// Turso HTTP API client — zero external dependencies, works on Cloudflare Workers

interface Row {
  [key: string]: string | number | null
}

interface ExecuteResult {
  rows: Row[]
  rowsAffected: number
}

interface TursoClient {
  execute(stmt: { sql: string; args: any[] }): Promise<ExecuteResult>
}

function createClient(config: { url: string; authToken?: string }): TursoClient {
  const baseUrl = config.url.replace(/\/$/, '')
  const authToken = config.authToken

  return {
    async execute(stmt: { sql: string; args: any[] }): Promise<ExecuteResult> {
      // Convert args to Turso API format
      const args = (stmt.args || []).map((a) => {
        if (a === null || a === undefined) return { type: 'null', value: null }
        if (typeof a === 'number') {
          return Number.isInteger(a)
            ? { type: 'integer', value: String(a) }
            : { type: 'float', value: a }
        }
        return { type: 'text', value: String(a) }
      })

      const res = await fetch(`${baseUrl}/v3/pipeline`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            { type: 'execute', stmt: { sql: stmt.sql, args } },
            { type: 'close' },
          ],
        }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(`Turso HTTP error ${res.status}: ${text}`)
      }

      const data = await res.json() as any
      const result = data.results?.[0]

      if (result?.type === 'error') {
        throw new Error(`SQL error: ${result.error?.message || JSON.stringify(result.error)}`)
      }

      const response = result?.response?.result
      if (!response) {
        return { rows: [], rowsAffected: 0 }
      }

      const cols = response.cols?.map((c: any) => c.name) || []
      const rows: Row[] = (response.rows || []).map((row: any[]) => {
        const obj: Row = {}
        row.forEach((cell: any, i: number) => {
          obj[cols[i]] = cell.type === 'null' ? null : cell.value
        })
        return obj
      })

      return {
        rows,
        rowsAffected: response.affected_row_count || 0,
      }
    },
  }
}

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'http://127.0.0.1:8080',
  authToken: process.env.TURSO_AUTH_TOKEN,
})

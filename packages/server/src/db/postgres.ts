import { Pool } from 'pg'

export const pool = new Pool({
  host: process.env.POSTGRES_HOST ?? 'localhost',
  port: parseInt(process.env.POSTGRES_PORT ?? '5432'),
  database: process.env.POSTGRES_DB ?? 'inquire',
  user: process.env.POSTGRES_USER ?? 'inquire',
  password: process.env.POSTGRES_PASSWORD ?? 'inquire',
})

export async function query<T = Record<string, unknown>>(sql: string, values: unknown[] = []): Promise<T[]> {
  const result = await pool.query(sql, values)
  return result.rows as T[]
}

export async function queryOne<T = Record<string, unknown>>(sql: string, values: unknown[] = []): Promise<T | null> {
  const result = await pool.query(sql, values)
  return (result.rows[0] ?? null) as T | null
}

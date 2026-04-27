import { Hono } from 'hono'
import { searchDocuments } from '../search/elasticsearch'
import { query } from '../db/postgres'
import type { Structure } from '@inquire/shared'

export const searchRouter = new Hono()

searchRouter.get('/', async (c) => {
  const q = c.req.query('q')
  if (!q?.trim()) return c.json({ results: [] })

  const ids = await searchDocuments(q)
  if (ids.length === 0) return c.json({ results: [] })

  const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ')
  const rows = await query<Structure>(
    `SELECT * FROM structure WHERE id IN (${placeholders})`,
    ids
  )
  return c.json({ results: rows })
})

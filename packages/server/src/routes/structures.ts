import { Hono } from 'hono'
import type { Structure } from '@inquire/shared'
import { query, queryOne } from '../db/postgres'
import { randomUUID } from 'crypto'
import { indexDocument } from '../search/elasticsearch'

export const structuresRouter = new Hono()

structuresRouter.get('/', async (c) => {
  const type = c.req.query('type')
  const rows = type
    ? await query<Structure>('SELECT * FROM structure WHERE type = $1 ORDER BY created_at DESC', [type])
    : await query<Structure>('SELECT * FROM structure ORDER BY created_at DESC')
  return c.json(rows)
})

structuresRouter.get('/:id', async (c) => {
  const id = c.req.param('id')
  const structure = await getStructureTree(id)
  if (!structure) return c.json({ error: 'Not found' }, 404)
  return c.json(structure)
})

structuresRouter.post('/', async (c) => {
  const body = await c.req.json<Structure>()
  if (!body.id) body.id = randomUUID()
  await upsertStructureTree(body)
  return c.json(body, 201)
})

structuresRouter.put('/:id', async (c) => {
  const body = await c.req.json<Structure>()
  body.id = c.req.param('id')
  await upsertStructureTree(body)
  return c.json(body)
})

structuresRouter.delete('/:id', async (c) => {
  const id = c.req.param('id')
  await query('DELETE FROM structure WHERE id = $1', [id])
  return c.json({ id })
})

async function upsertStructureTree(structure: Structure): Promise<void> {
  const queue: Structure[] = [structure]
  while (queue.length > 0) {
    const s = queue.shift()!
    if (!s.id) s.id = randomUUID()
    if (s.components) queue.push(...s.components)
    await upsertOne(s)
    await indexDocument(s.id, s.type, s.text ?? '')
  }
}

async function upsertOne(s: Structure): Promise<void> {
  const componentIds = s.components?.map((c) => c.id) ?? null
  await query(
    `INSERT INTO structure (id, version, type, text, properties, components, context)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (id) DO UPDATE SET
       version = structure.version + 1,
       type = EXCLUDED.type,
       text = EXCLUDED.text,
       properties = EXCLUDED.properties,
       components = EXCLUDED.components,
       context = EXCLUDED.context,
       updated_at = CURRENT_TIMESTAMP`,
    [s.id, s.version ?? 1, s.type, s.text ?? null, s.properties ?? null, componentIds, s.context ?? null]
  )
}

async function getStructureTree(id: string): Promise<Structure | null> {
  const root = await queryOne<Structure & { components: string[] | null }>(
    'SELECT * FROM structure WHERE id = $1', [id]
  )
  if (!root) return null
  return expandComponents(root)
}

async function expandComponents(record: Structure & { components: string[] | null }): Promise<Structure> {
  const componentIds = record.components as unknown as string[] | null
  if (!componentIds || componentIds.length === 0) {
    return { ...record, components: [] }
  }
  const children = await Promise.all(
    componentIds.map(async (childId) => {
      const child = await queryOne<Structure & { components: string[] | null }>(
        'SELECT * FROM structure WHERE id = $1', [childId]
      )
      return child ? expandComponents(child) : null
    })
  )
  return { ...record, components: children.filter((c): c is Structure => c !== null) }
}

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { structuresRouter } from './routes/structures'
import { searchRouter } from './routes/search'
import { wikipediaRouter } from './routes/wikipedia'
import { initDb } from './db/migrations'
import { initElasticsearch } from './search/elasticsearch'

const app = new Hono()

app.use('*', cors({ origin: '*' }))
app.use('*', logger())

app.route('/api/structures', structuresRouter)
app.route('/api/search', searchRouter)
app.route('/api/wikipedia', wikipediaRouter)

app.get('/health', (c) => c.json({ status: 'ok' }))

async function start() {
  try {
    await initDb()
  } catch (err) {
    console.warn('DB init failed (will retry on requests):', (err as Error).message)
  }
  try {
    await initElasticsearch()
  } catch (err) {
    console.warn('ES init failed (search will be degraded):', (err as Error).message)
  }

  const port = parseInt(process.env.PORT ?? '3001')
  console.log(`\nInquire server running on http://localhost:${port}\n`)

  Bun.serve({ port, fetch: app.fetch })
}

start().catch(console.error)

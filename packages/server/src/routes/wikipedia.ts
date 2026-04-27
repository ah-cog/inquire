import { Hono } from 'hono'
import { searchWikipedia, getWikipediaPage } from '../services/wikipedia'

export const wikipediaRouter = new Hono()

wikipediaRouter.get('/search', async (c) => {
  const q = c.req.query('q')
  if (!q?.trim()) return c.json([])
  const results = await searchWikipedia(q)
  return c.json(results)
})

wikipediaRouter.get('/page/:pageId', async (c) => {
  const pageId = parseInt(c.req.param('pageId'))
  if (isNaN(pageId)) return c.json({ error: 'Invalid page ID' }, 400)
  const page = await getWikipediaPage(pageId)
  return c.json(page)
})

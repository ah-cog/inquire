import type { Structure } from '@inquire/shared'
import type { WikipediaSearchResult } from '@inquire/shared'
import { randomUUID } from 'crypto'

const BASE = 'https://en.wikipedia.org/w/api.php'

export async function searchWikipedia(searchQuery: string): Promise<WikipediaSearchResult[]> {
  const params = new URLSearchParams({
    origin: '*',
    action: 'query',
    list: 'search',
    srsearch: searchQuery,
    format: 'json',
    utf8: '',
    srlimit: '10',
  })
  const res = await fetch(`${BASE}?${params}`)
  const data = await res.json() as { query: { search: Array<{ pageid: number; title: string; snippet: string; wordcount: number; timestamp: string }> } }
  return data.query.search.map((r) => ({
    id: r.pageid,
    title: r.title,
    text: r.snippet.replace(/<[^>]+>/g, ''),
    wordCount: r.wordcount,
    timestamp: r.timestamp,
  }))
}

export async function getWikipediaPage(pageId: number): Promise<Structure> {
  const params = new URLSearchParams({
    origin: '*',
    action: 'query',
    prop: 'extracts|info',
    exlimit: '1',
    format: 'json',
    pageids: String(pageId),
  })
  const res = await fetch(`${BASE}?${params}`)
  const data = await res.json() as { query: { pages: Record<string, { pageid: number; title: string; extract: string; lastrevid: string }> } }
  const page = data.query.pages[String(pageId)]
  return parsePage(page)
}

function parsePage(page: { pageid: number; title: string; extract: string; lastrevid: string }): Structure {
  const context = { source: 'wikipedia', pageId: page.pageid, title: page.title }
  const paragraphs = parseHtmlParagraphs(page.extract ?? '', context)
  return {
    id: randomUUID(),
    version: 1,
    type: 'document',
    text: page.title,
    components: paragraphs,
    context,
  }
}

function parseHtmlParagraphs(html: string, context: Record<string, unknown>): Structure[] {
  const stripped = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/  +/g, ' ')
  const paragraphs = stripped
    .split(/\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 40)
  return paragraphs.map((text) => ({
    id: randomUUID(),
    version: 1,
    type: 'text',
    text,
    context,
  }))
}

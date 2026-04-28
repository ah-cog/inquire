import type { WikipediaSearchResult, Structure } from '@inquire/shared'
import { get } from './client'

export const searchWikipedia = (q: string) =>
  get<WikipediaSearchResult[]>(`/wikipedia/search?q=${encodeURIComponent(q)}`)

export const getWikipediaPage = (pageId: number) =>
  get<Structure>(`/wikipedia/page/${pageId}`)

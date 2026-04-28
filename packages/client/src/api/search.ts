import type { SearchResponse } from '@inquire/shared'
import { get } from './client'

export const fullTextSearch = (q: string) =>
  get<SearchResponse>(`/search?q=${encodeURIComponent(q)}`)

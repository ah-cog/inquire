export type StructureType =
  | 'workspace'
  | 'collection'
  | 'theory'
  | 'argument'
  | 'statement'
  | 'extract'
  | 'text'
  | 'text_selection'
  | 'header'
  | 'document'
  | string

export interface Structure {
  id: string
  version: number
  type: StructureType
  text: string
  properties?: Record<string, unknown>
  components?: Structure[]
  context?: Record<string, unknown>
  created_at?: string
  updated_at?: string
}

export interface WikipediaSearchResult {
  id: number
  title: string
  text: string
  wordCount: number
  timestamp: string
}

export interface SearchResponse {
  results: Structure[]
}

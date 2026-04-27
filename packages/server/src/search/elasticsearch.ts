import { Client } from '@elastic/elasticsearch'

const INDEX = 'structures'

export const esClient = new Client({
  node: process.env.ELASTICSEARCH_URL ?? 'http://localhost:9200',
})

export async function initElasticsearch() {
  const exists = await esClient.indices.exists({ index: INDEX })
  if (!exists) {
    await esClient.indices.create({
      index: INDEX,
      mappings: {
        properties: {
          type: { type: 'keyword' },
          text: { type: 'text', analyzer: 'english' },
        },
      },
    })
  }
  console.log('Elasticsearch ready')
}

export async function indexDocument(id: string, type: string, text: string): Promise<void> {
  try {
    await esClient.index({
      index: INDEX,
      id,
      document: { type, text: text ?? '' },
    })
  } catch (err) {
    console.warn('Index failed for', id, (err as Error).message)
  }
}

export async function searchDocuments(searchQuery: string): Promise<string[]> {
  try {
    const result = await esClient.search({
      index: INDEX,
      query: { match: { text: { query: searchQuery, operator: 'and' as const } } },
      size: 20,
    })
    return result.hits.hits.map((h) => h._id!)
  } catch {
    return []
  }
}

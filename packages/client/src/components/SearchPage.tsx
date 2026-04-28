import React, { useState, useCallback } from 'react'
import type { Structure, WikipediaSearchResult } from '@inquire/shared'
import { searchWikipedia, getWikipediaPage } from '../api/wikipedia'
import { saveStructure } from '../api/structures'
import { fullTextSearch } from '../api/search'
import TextViewer from './TextViewer'
import { randomId } from '../utils/id'

type SearchMode = 'wikipedia' | 'saved'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<SearchMode>('wikipedia')
  const [wikiResults, setWikiResults] = useState<WikipediaSearchResult[]>([])
  const [savedResults, setSavedResults] = useState<Structure[]>([])
  const [selectedPage, setSelectedPage] = useState<Structure | null>(null)
  const [extracts, setExtracts] = useState<Structure[]>([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setStatus('')
    try {
      if (mode === 'wikipedia') {
        const results = await searchWikipedia(query)
        setWikiResults(results)
        setStatus(results.length === 0 ? 'No results.' : '')
      } else {
        const { results } = await fullTextSearch(query)
        setSavedResults(results)
        setStatus(results.length === 0 ? 'No saved content matches.' : '')
      }
    } catch (err) {
      setStatus('Search failed: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectPage = async (result: WikipediaSearchResult) => {
    setLoading(true)
    setStatus('Loading page…')
    try {
      const page = await getWikipediaPage(result.id)
      setSelectedPage(page)
      setExtracts([])
      setStatus('')
    } catch (err) {
      setStatus('Failed to load page: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleExtract = useCallback((text: string) => {
    if (!selectedPage) return
    setExtracts((prev) => [
      ...prev,
      {
        id: randomId(),
        version: 1,
        type: 'extract',
        text,
        context: selectedPage.context,
        components: [],
      },
    ])
  }, [selectedPage])

  const handleSavePage = async () => {
    if (!selectedPage) return
    setLoading(true)
    try {
      await saveStructure(selectedPage)
      setStatus('Page saved.')
    } catch (err) {
      setStatus('Save failed: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveExtracts = async () => {
    if (extracts.length === 0) return
    setLoading(true)
    try {
      for (const extract of extracts) {
        await saveStructure(extract)
      }
      setExtracts([])
      setStatus(`${extracts.length} extract(s) saved.`)
    } catch (err) {
      setStatus('Save failed: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="search-page">
      <div className="search-sidebar">
        <div className="mode-tabs">
          <button className={'tab' + (mode === 'wikipedia' ? ' active' : '')} onClick={() => setMode('wikipedia')}>Wikipedia</button>
          <button className={'tab' + (mode === 'saved' ? ' active' : '')} onClick={() => setMode('saved')}>Saved</button>
        </div>

        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={mode === 'wikipedia' ? 'Search Wikipedia…' : 'Search saved content…'}
          />
          <button type="submit" disabled={loading}>{loading ? '…' : 'Go'}</button>
        </form>

        {status && <div className="status-msg">{status}</div>}

        {mode === 'wikipedia' && (
          <ul className="result-list">
            {wikiResults.map((r) => (
              <li key={r.id} className="result-item" onClick={() => handleSelectPage(r)}>
                <strong>{r.title}</strong>
                <span className="result-snippet" dangerouslySetInnerHTML={{ __html: r.text }} />
              </li>
            ))}
          </ul>
        )}

        {mode === 'saved' && (
          <ul className="result-list">
            {savedResults.map((r) => (
              <li key={r.id} className="result-item">
                <strong>{r.type}</strong>
                <span className="result-snippet">{r.text?.slice(0, 140)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="search-content">
        {selectedPage ? (
          <>
            <div className="page-toolbar">
              <h2 className="page-title">{selectedPage.text}</h2>
              <div className="page-actions">
                {extracts.length > 0 && (
                  <span className="extract-count">{extracts.length} extract{extracts.length !== 1 ? 's' : ''}</span>
                )}
                {extracts.length > 0 && (
                  <button onClick={handleSaveExtracts} disabled={loading}>Save extracts</button>
                )}
                <button onClick={handleSavePage} disabled={loading}>Save page</button>
              </div>
            </div>
            <TextViewer structure={selectedPage} onExtract={handleExtract} />
          </>
        ) : (
          <div className="empty-state">
            <p>Search Wikipedia and click a result to start reading.</p>
            <p className="hint">Highlight any text in a page to extract it as a citation.</p>
          </div>
        )}
      </div>

      {extracts.length > 0 && (
        <div className="extracts-tray">
          <div className="tray-header">
            <span>Extracts</span>
            <div>
              <button onClick={handleSaveExtracts} disabled={loading}>Save all</button>
              <button className="btn-ghost" onClick={() => setExtracts([])}>Clear</button>
            </div>
          </div>
          <div className="tray-items">
            {extracts.map((e) => (
              <div key={e.id} className="tray-item">
                <p>{e.text}</p>
                <button
                  className="btn-remove"
                  onClick={() => setExtracts((prev) => prev.filter((x) => x.id !== e.id))}
                >×</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

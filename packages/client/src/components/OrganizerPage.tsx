import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Structure } from '@inquire/shared'
import { getStructures, deleteStructure } from '../api/structures'
import StructureCard from './StructureCard'

const TYPES = ['all', 'document', 'extract', 'theory', 'argument', 'statement', 'workspace', 'collection', 'text']

export default function OrganizerPage() {
  const [structures, setStructures] = useState<Structure[]>([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getStructures(filter === 'all' ? undefined : filter)
      setStructures(data)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this structure?')) return
    await deleteStructure(id)
    setStructures((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <div className="organizer-page">
      <div className="organizer-header">
        <h2>Organizer</h2>
        <div className="filter-row">
          {TYPES.map((t) => (
            <button key={t} className={'tab' + (filter === t ? ' active' : '')} onClick={() => setFilter(t)}>
              {t}
            </button>
          ))}
          <button className="btn-refresh" onClick={load} title="Refresh">↺</button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading…</div>
      ) : structures.length === 0 ? (
        <div className="empty-state">
          <p>Nothing saved yet.</p>
          <p className="hint">Search Wikipedia and save pages or extracts.</p>
        </div>
      ) : (
        <div className="structures-grid">
          {structures.map((s) => (
            <StructureCard
              key={s.id}
              structure={s}
              onOpen={() => navigate(`/inspector/${s.id}`)}
              onDelete={() => handleDelete(s.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

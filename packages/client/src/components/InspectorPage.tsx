import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { Structure } from '@inquire/shared'
import { getStructure, updateStructure, deleteStructure, saveStructure } from '../api/structures'
import StructureCard from './StructureCard'
import { randomId } from '../utils/id'

const ALL_TYPES = ['workspace', 'collection', 'theory', 'argument', 'statement', 'extract', 'document', 'text', 'header']

export default function InspectorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [structure, setStructure] = useState<Structure | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState('')
  const [editType, setEditType] = useState('')
  const [newText, setNewText] = useState('')
  const [newType, setNewType] = useState('statement')
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getStructure(id)
      .then((s) => {
        setStructure(s)
        setEditText(s.text ?? '')
        setEditType(s.type)
      })
      .catch(() => setStatus('Failed to load structure.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleSaveEdit = async () => {
    if (!structure) return
    const updated = { ...structure, text: editText, type: editType }
    await updateStructure(updated)
    setStructure(updated)
    setEditing(false)
    setStatus('Saved.')
  }

  const handleDelete = async () => {
    if (!structure || !confirm('Delete this structure?')) return
    await deleteStructure(structure.id)
    navigate('/organizer')
  }

  const handleAddComponent = async () => {
    if (!structure || !newText.trim()) return
    const component: Structure = { id: randomId(), version: 1, type: newType, text: newText, components: [] }
    const updated: Structure = { ...structure, components: [...(structure.components ?? []), component] }
    await saveStructure(component)
    await updateStructure(updated)
    setStructure(updated)
    setNewText('')
    setStatus('Component added.')
  }

  const handleRemoveComponent = async (componentId: string) => {
    if (!structure) return
    const updated: Structure = {
      ...structure,
      components: (structure.components ?? []).filter((c) => c.id !== componentId),
    }
    await updateStructure(updated)
    setStructure(updated)
  }

  if (loading) return <div className="loading">Loading…</div>
  if (!structure) return <div className="empty-state">{status || 'Structure not found.'}</div>

  return (
    <div className="inspector-page">
      <div className="inspector-toolbar">
        <button className="btn-back" onClick={() => navigate(-1)}>← Back</button>
        <div className="inspector-actions">
          {editing ? (
            <>
              <button onClick={handleSaveEdit}>Save</button>
              <button onClick={() => setEditing(false)}>Cancel</button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)}>Edit</button>
              <button className="btn-danger" onClick={handleDelete}>Delete</button>
            </>
          )}
        </div>
      </div>

      {status && <div className="status-msg">{status}</div>}

      <div className="inspector-body">
        <div className="inspector-meta">
          {editing ? (
            <select value={editType} onChange={(e) => setEditType(e.target.value)}>
              {ALL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          ) : (
            <span className="type-chip">{structure.type}</span>
          )}
        </div>

        {editing ? (
          <textarea
            className="edit-area"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={6}
          />
        ) : (
          <p className="inspector-text">{structure.text}</p>
        )}

        {structure.context && Object.keys(structure.context).length > 0 && (
          <details className="context-details">
            <summary>Context</summary>
            <pre>{JSON.stringify(structure.context, null, 2)}</pre>
          </details>
        )}

        <section className="components-section">
          <h3>Components <span className="count">({structure.components?.length ?? 0})</span></h3>

          <div className="add-component-row">
            <select value={newType} onChange={(e) => setNewType(e.target.value)} style={{ width: 130 }}>
              {ALL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Component text…"
              onKeyDown={(e) => e.key === 'Enter' && handleAddComponent()}
            />
            <button onClick={handleAddComponent}>Add</button>
          </div>

          <div className="components-list">
            {(structure.components ?? []).map((comp) => (
              <StructureCard
                key={comp.id}
                structure={comp}
                onOpen={() => navigate(`/inspector/${comp.id}`)}
                onDelete={() => handleRemoveComponent(comp.id)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

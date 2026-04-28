import React from 'react'
import type { Structure } from '@inquire/shared'

const TYPE_HUE: Record<string, string> = {
  document:  '#4a90d9',
  extract:   '#7b68ee',
  theory:    '#e67e22',
  argument:  '#27ae60',
  statement: '#16a085',
  workspace: '#8e44ad',
  collection:'#c0392b',
  text:      '#636e72',
  header:    '#b2bec3',
}

interface Props {
  structure: Structure
  onOpen?: () => void
  onDelete?: () => void
}

export default function StructureCard({ structure, onOpen, onDelete }: Props) {
  const color = TYPE_HUE[structure.type] ?? '#95a5a6'
  const preview = structure.text?.slice(0, 200) ?? '(empty)'
  const childCount = structure.components?.length ?? 0
  const sourceTitle = (structure.context as Record<string, unknown> | undefined)?.title as string | undefined

  return (
    <div className="structure-card" onClick={onOpen}>
      {onDelete && (
        <button
          className="card-delete"
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          title="Delete"
        >×</button>
      )}
      <div className="card-badge" style={{ background: color }}>{structure.type}</div>
      <p className="card-text">{preview}</p>
      <div className="card-footer">
        {childCount > 0 && <span>{childCount} component{childCount !== 1 ? 's' : ''}</span>}
        {sourceTitle && <span className="card-source">↗ {sourceTitle}</span>}
      </div>
    </div>
  )
}

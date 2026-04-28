import React from 'react'
import type { Structure } from '@inquire/shared'

interface Props {
  structure: Structure
  onExtract: (text: string) => void
}

export default function TextViewer({ structure, onExtract }: Props) {
  const paragraphs = structure.components?.filter((c) => c.type === 'text') ?? []

  const handleMouseUp = () => {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) return
    const text = selection.toString().trim()
    if (text.length >= 10) {
      onExtract(text)
      selection.removeAllRanges()
    }
  }

  return (
    <div className="text-viewer" onMouseUp={handleMouseUp}>
      {paragraphs.length === 0 ? (
        <p className="text-muted">No text content available.</p>
      ) : (
        paragraphs.map((para) => (
          <p key={para.id} className="text-para">{para.text}</p>
        ))
      )}
      <p className="extract-hint">Select text to create an extract.</p>
    </div>
  )
}

import type { Structure } from '@inquire/shared'
import { get, post, put, del } from './client'

export const getStructures = (type?: string) =>
  get<Structure[]>(`/structures${type ? `?type=${encodeURIComponent(type)}` : ''}`)

export const getStructure = (id: string) =>
  get<Structure>(`/structures/${id}`)

export const saveStructure = (s: Structure) =>
  post<Structure>('/structures', s)

export const updateStructure = (s: Structure) =>
  put<Structure>(`/structures/${s.id}`, s)

export const deleteStructure = (id: string) =>
  del<{ id: string }>(`/structures/${id}`)

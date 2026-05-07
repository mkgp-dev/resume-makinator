import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockTable } = vi.hoisted(() => {
  return {
    mockTable: {
      get: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      clear: vi.fn(),
      orderBy: vi.fn(),
    },
  }
})

vi.mock('@/shared/lib/db/app-db', () => {
  return {
    appDb: {
      resumeDocuments: mockTable,
    },
  }
})

import {
  clearResumeDocuments,
  deleteResumeDocument,
  getResumeDocumentById,
  listResumeDocuments,
  upsertResumeDocument,
} from '@/entities/resume/model'
import type { ResumeDocument } from '@/entities/resume/model'

describe('resume.repository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('upsert then get delegates to Dexie table boundary', async () => {
    const doc = { id: '1' } as ResumeDocument
    mockTable.get.mockResolvedValue(doc)

    await upsertResumeDocument(doc)
    const result = await getResumeDocumentById('1')

    expect(mockTable.put).toHaveBeenCalledWith(doc)
    expect(mockTable.get).toHaveBeenCalledWith('1')
    expect(result).toEqual(doc)
  })

  it('lists by updatedAt descending', async () => {
    const documents = [{ id: 'a' }, { id: 'b' }]
    const toArray = vi.fn().mockResolvedValue(documents)
    const reverse = vi.fn().mockReturnValue({ toArray })
    mockTable.orderBy.mockReturnValue({ reverse })

    const result = await listResumeDocuments()

    expect(mockTable.orderBy).toHaveBeenCalledWith('updatedAt')
    expect(reverse).toHaveBeenCalled()
    expect(result).toEqual(documents)
  })

  it('deletes and clears documents', async () => {
    await deleteResumeDocument('doc-1')
    await clearResumeDocuments()

    expect(mockTable.delete).toHaveBeenCalledWith('doc-1')
    expect(mockTable.clear).toHaveBeenCalled()
  })
})

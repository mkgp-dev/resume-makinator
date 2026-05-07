import { describe, expect, it } from 'vitest'

import { createResumeDocument, migrateResumeDocument } from '@/entities/resume/utils'

describe('migrateResumeDocument', () => {
  it('passes through current version documents', () => {
    const current = createResumeDocument()

    expect(migrateResumeDocument(current)).toEqual(current)
  })

  it('backfills missing fields with safe defaults', () => {
    const legacyLike = {
      id: 'legacy-id',
      title: 'Legacy Resume',
      version: 1,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      content: {
        personalDetails: {
          fullName: 'Jane Doe',
          email: 'jane@example.com',
        },
      },
      settings: {
        template: 'whitepaper',
      },
    }

    const migrated = migrateResumeDocument(legacyLike)

    expect(migrated.content.personalDetails.phone).toBe('')
    expect(migrated.content.workExperiences).toEqual([])
    expect(migrated.settings.fontScale).toBe(1.0)
    expect(migrated.settings.sectionOrder.length).toBeGreaterThan(0)
  })

  it('rejects unknown newer schema versions', () => {
    const futureVersion = {
      ...createResumeDocument(),
      version: 2,
    }

    expect(() => migrateResumeDocument(futureVersion)).toThrow(
      'Unsupported resume schema version: 2',
    )
  })
})

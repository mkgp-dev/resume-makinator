import { describe, expect, it } from 'vitest'

import { createResumeDocument } from '@/entities/resume/utils/create-resume-document'
import { createResumeJsonDownload, parseImportedResumeDocument } from '@/features/settings/lib/resume-data-io'

describe('resume-data-io', () => {
  it('creates downloadable resume.json blob', async () => {
    const document = createResumeDocument()
    const result = createResumeJsonDownload(document)

    expect(result.fileName).toBe('resume.json')
    expect(result.blob.type).toBe('application/json')

    expect(result.blob.size).toBeGreaterThan(0)
  })

  it('rejects invalid resume shapes on import', async () => {
    const file = new File([JSON.stringify({ hello: 'world' })], 'resume.json', { type: 'application/json' })
    await expect(parseImportedResumeDocument(file)).rejects.toBeTruthy()
  })
})

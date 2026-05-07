import { describe, expect, it } from 'vitest'

import { createResumeDocument, validateResumeDocument } from '@/entities/resume/utils'

describe('validateResumeDocument', () => {
  it('accepts valid resume document', () => {
    const valid = createResumeDocument()

    expect(validateResumeDocument(valid)).toEqual(valid)
  })

  it('rejects invalid resume shapes', () => {
    const invalid = {
      ...createResumeDocument(),
      content: {
        ...createResumeDocument().content,
        personalDetails: {
          ...createResumeDocument().content.personalDetails,
          email: 123,
        },
      },
    }

    expect(() => validateResumeDocument(invalid)).toThrow()
  })
})

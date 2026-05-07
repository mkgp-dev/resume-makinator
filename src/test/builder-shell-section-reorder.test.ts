import { describe, expect, it } from 'vitest'

import { applySectionOrderReorder } from '@/entities/resume/utils/apply-section-order-reorder'

describe('BuilderShell section reorder', () => {
  it('updates section order on reorder intent', () => {
    const next = applySectionOrderReorder(
      ['personalDetails', 'workExperiences', 'education'],
      'education',
      'personalDetails',
    )

    expect(next).toEqual(['education', 'personalDetails', 'workExperiences'])
  })
})

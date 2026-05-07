import { describe, expect, it } from 'vitest'

import { reorder } from '@/shared/dnd/reorder'

describe('reorder', () => {
  it('moves first to last', () => {
    expect(reorder([1, 2, 3], 0, 2)).toEqual([2, 3, 1])
  })

  it('moves middle to first', () => {
    expect(reorder([1, 2, 3], 1, 0)).toEqual([2, 1, 3])
  })

  it('moves last to middle', () => {
    expect(reorder([1, 2, 3], 2, 1)).toEqual([1, 3, 2])
  })

  it('returns same array when noop', () => {
    const input = [1, 2, 3]
    expect(reorder(input, 1, 1)).toBe(input)
  })
})

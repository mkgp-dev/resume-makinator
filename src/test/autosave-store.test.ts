import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAutosaveStore } from '@/shared/store/use-autosave-store'

describe('autosave indicator states', () => {
  beforeEach(() => {
    useAutosaveStore.setState({ status: 'idle' })
    vi.useFakeTimers()
  })

  it('transitions Saving... -> Saved ✓ -> idle fade', () => {
    useAutosaveStore.getState().startSaving()
    expect(useAutosaveStore.getState().status).toBe('saving')

    useAutosaveStore.getState().markSaved()
    expect(useAutosaveStore.getState().status).toBe('saved')

    vi.advanceTimersByTime(3000)
    expect(useAutosaveStore.getState().status).toBe('idle')
  })
})

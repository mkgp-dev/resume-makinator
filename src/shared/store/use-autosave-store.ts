import { create } from 'zustand'

type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error'

type AutosaveState = {
  status: AutosaveStatus
  startSaving: () => void
  markSaved: () => void
  markError: () => void
}

let resetTimer: number | undefined

function scheduleReset() {
  if (resetTimer) {
    window.clearTimeout(resetTimer)
  }
  resetTimer = window.setTimeout(() => {
    useAutosaveStore.setState({ status: 'idle' })
  }, 3000)
}

export const useAutosaveStore = create<AutosaveState>((set) => ({
  status: 'idle',
  startSaving: () => {
    if (resetTimer) {
      window.clearTimeout(resetTimer)
    }
    set({ status: 'saving' })
  },
  markSaved: () => {
    set({ status: 'saved' })
    scheduleReset()
  },
  markError: () => {
    set({ status: 'error' })
    scheduleReset()
  },
}))

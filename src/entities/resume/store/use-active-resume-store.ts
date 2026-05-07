import { notifications } from '@mantine/notifications'
import { create } from 'zustand'

import type { ResumeContent, ResumeDocument, ResumeSettings } from '@/entities/resume/model'
import { getResumeDocumentById, upsertResumeDocument } from '@/entities/resume/model'
import { useAutosaveStore } from '@/shared/store/use-autosave-store'

type ActiveResumeState = {
  activeResume: ResumeDocument | null
  setActiveResume: (resume: ResumeDocument | null) => void
  loadActiveResumeById: (id: string) => Promise<void>
  updateActiveResumeContent: (updater: (content: ResumeContent) => ResumeContent) => Promise<void>
  updateActiveResumeSettings: (updater: (settings: ResumeSettings) => ResumeSettings) => Promise<void>
}

async function persistUpdatedResume(resume: ResumeDocument): Promise<void> {
  useAutosaveStore.getState().startSaving()
  const nextResume: ResumeDocument = {
    ...resume,
    updatedAt: new Date().toISOString(),
  }
  try {
    await upsertResumeDocument(nextResume)
    useActiveResumeStore.setState({ activeResume: nextResume })
    useAutosaveStore.getState().markSaved()
  } catch {
    useAutosaveStore.getState().markError()
    notifications.show({
      color: 'red',
      title: 'Save failed',
      message: 'Could not save changes. Please try again.',
    })
    throw new Error('Failed to persist resume update')
  }
}

export const useActiveResumeStore = create<ActiveResumeState>((set, get) => ({
  activeResume: null,
  setActiveResume: (activeResume) => {
    set({ activeResume })
  },
  loadActiveResumeById: async (id) => {
    const activeResume = await getResumeDocumentById(id)
    set({ activeResume: activeResume ?? null })
  },
  updateActiveResumeContent: async (updater) => {
    const activeResume = get().activeResume
    if (!activeResume) {
      return
    }

    await persistUpdatedResume({
      ...activeResume,
      content: updater(activeResume.content),
    })
  },
  updateActiveResumeSettings: async (updater) => {
    const activeResume = get().activeResume
    if (!activeResume) {
      return
    }

    await persistUpdatedResume({
      ...activeResume,
      settings: updater(activeResume.settings),
    })
  },
}))

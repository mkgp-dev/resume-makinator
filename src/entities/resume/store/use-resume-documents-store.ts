import { create } from 'zustand'

import type { ResumeDocument } from '@/entities/resume/model'
import {
  deleteResumeDocument,
  listResumeDocuments,
  upsertResumeDocument,
} from '@/entities/resume/model'
import { createResumeDocument } from '@/entities/resume/utils/create-resume-document'
import { useAppSettingsStore } from '@/entities/resume/store/use-app-settings-store'

type ResumeDocumentsState = {
  documents: ResumeDocument[]
  initialize: () => Promise<void>
  createDocument: () => Promise<ResumeDocument>
  deleteDocument: (id: string) => Promise<void>
}

export const useResumeDocumentsStore = create<ResumeDocumentsState>((set, get) => ({
  documents: [],
  initialize: async () => {
    const documents = await listResumeDocuments()
    set({ documents })
  },
  createDocument: async () => {
    const document = createResumeDocument()
    await upsertResumeDocument(document)

    const nextDocuments = [document, ...get().documents]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

    set({ documents: nextDocuments })
    await useAppSettingsStore.getState().setActiveResumeId(document.id)

    return document
  },
  deleteDocument: async (id) => {
    await deleteResumeDocument(id)

    const nextDocuments = get().documents.filter((document) => document.id !== id)
    set({ documents: nextDocuments })

    const currentActive = useAppSettingsStore.getState().appSettings.activeResumeId
    if (currentActive === id) {
      await useAppSettingsStore.getState().setActiveResumeId(nextDocuments[0]?.id)
    }
  },
}))

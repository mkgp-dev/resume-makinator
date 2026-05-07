import { create } from 'zustand'

import { appDb, type AppSettingsRecord } from '@/shared/lib/db/app-db'

type AppSettingsState = {
  appSettings: AppSettingsRecord
  initialize: () => Promise<void>
  setAiApiKey: (aiApiKey?: string) => Promise<void>
  setColorScheme: (colorScheme: AppSettingsRecord['colorScheme']) => Promise<void>
  setActiveResumeId: (activeResumeId?: string) => Promise<void>
}

const defaultAppSettings: AppSettingsRecord = {
  id: 'singleton',
  colorScheme: 'light',
}

async function persistSettings(settings: AppSettingsRecord): Promise<void> {
  await appDb.appSettings.put(settings)
}

export const useAppSettingsStore = create<AppSettingsState>((set, get) => ({
  appSettings: defaultAppSettings,
  initialize: async () => {
    const existing = await appDb.appSettings.get('singleton')
    const nextSettings = {
      ...defaultAppSettings,
      ...existing,
    }

    set({ appSettings: nextSettings })
    await persistSettings(nextSettings)
  },
  setAiApiKey: async (aiApiKey) => {
    const nextSettings = {
      ...get().appSettings,
      aiApiKey,
    }

    set({ appSettings: nextSettings })
    await persistSettings(nextSettings)
  },
  setColorScheme: async (colorScheme) => {
    const nextSettings = {
      ...get().appSettings,
      colorScheme,
    }

    set({ appSettings: nextSettings })
    await persistSettings(nextSettings)
  },
  setActiveResumeId: async (activeResumeId) => {
    const nextSettings = {
      ...get().appSettings,
      activeResumeId,
    }

    set({ appSettings: nextSettings })
    await persistSettings(nextSettings)
  },
}))

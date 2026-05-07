import { useActiveResumeStore, useAppSettingsStore, useResumeDocumentsStore } from '@/entities/resume/store'

let hasInitializedStores = false

async function initializeAppState(): Promise<void> {
  if (hasInitializedStores) {
    return
  }

  await Promise.all([
    useAppSettingsStore.getState().initialize(),
    useResumeDocumentsStore.getState().initialize(),
  ])

  hasInitializedStores = true
}

export function resetRouterInitializationForTests(): void {
  hasInitializedStores = false
}

export async function shouldRedirectLandingToBuilder(): Promise<boolean> {
  await initializeAppState()
  return useResumeDocumentsStore.getState().documents.length > 0
}

export async function ensureBuilderHasActiveResume(): Promise<string> {
  await initializeAppState()

  const documentsStore = useResumeDocumentsStore.getState()
  const appSettingsStore = useAppSettingsStore.getState()
  const activeResumeStore = useActiveResumeStore.getState()

  let documents = documentsStore.documents

  if (documents.length === 0) {
    const created = await documentsStore.createDocument()
    documents = [created]
  }

  let activeResumeId = appSettingsStore.appSettings.activeResumeId

  if (!activeResumeId) {
    activeResumeId = documents[0].id
    await appSettingsStore.setActiveResumeId(activeResumeId)
  }

  await activeResumeStore.loadActiveResumeById(activeResumeId)

  return activeResumeId
}

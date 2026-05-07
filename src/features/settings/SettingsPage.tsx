import {
  Button,
  Card,
  Container,
  Group,
  LoadingOverlay,
  PasswordInput,
  Select,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { useNavigate } from '@tanstack/react-router'
import { useRef, useState } from 'react'

import { useActiveResumeStore, useAppSettingsStore, useResumeDocumentsStore } from '@/entities/resume/store'
import { clearResumeDocuments, upsertResumeDocument } from '@/entities/resume/model'
import { createResumeJsonDownload, parseImportedResumeDocument } from '@/features/settings/lib/resume-data-io'

export function SettingsPage() {
  const navigate = useNavigate()
  const appSettings = useAppSettingsStore((state) => state.appSettings)
  const setAiApiKey = useAppSettingsStore((state) => state.setAiApiKey)
  const setColorScheme = useAppSettingsStore((state) => state.setColorScheme)
  const setActiveResumeId = useAppSettingsStore((state) => state.setActiveResumeId)
  const activeResume = useActiveResumeStore((state) => state.activeResume)
  const setActiveResume = useActiveResumeStore((state) => state.setActiveResume)
  const initializeDocuments = useResumeDocumentsStore((state) => state.initialize)
  const [apiKeyDraft, setApiKeyDraft] = useState(appSettings.aiApiKey ?? '')
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const downloadBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = fileName
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const saveApiKey = async () => {
    try {
      await setAiApiKey(apiKeyDraft.trim() || undefined)
      notifications.show({
        color: 'green',
        title: 'Saved',
        message: 'AI API key saved.',
      })
    } catch {
      notifications.show({
        color: 'red',
        title: 'Error',
        message: 'Failed to save API key.',
      })
    }
  }

  const clearApiKey = async () => {
    try {
      await setAiApiKey(undefined)
      setApiKeyDraft('')
      notifications.show({
        color: 'green',
        title: 'Cleared',
        message: 'API key removed.',
      })
    } catch {
      notifications.show({
        color: 'red',
        title: 'Error',
        message: 'Failed to clear API key.',
      })
    }
  }

  const exportJson = async () => {
    if (!activeResume) {
      notifications.show({
        color: 'yellow',
        title: 'No Resume',
        message: 'No active resume to export.',
      })
      return
    }

    const { blob, fileName } = createResumeJsonDownload(activeResume)
    downloadBlob(blob, fileName)
    notifications.show({
      color: 'green',
      title: 'Exported',
      message: 'Resume exported as JSON.',
    })
  }

  const importJsonFile = async (file: File) => {
    setIsImporting(true)
    try {
      const document = await parseImportedResumeDocument(file)
      modals.openConfirmModal({
        title: 'Replace current resume?',
        children: <Text size="sm">Importing will replace your current resume selection.</Text>,
        labels: { confirm: 'Import', cancel: 'Cancel' },
        onConfirm: async () => {
          try {
            await upsertResumeDocument(document)
            await setActiveResumeId(document.id)
            setActiveResume(document)
            await initializeDocuments()
            notifications.show({
              color: 'green',
              title: 'Imported',
              message: 'Resume imported successfully.',
            })
          } catch {
            notifications.show({
              color: 'red',
              title: 'Error',
              message: 'Failed to import resume.',
            })
          }
        },
      })
    } catch (error) {
      notifications.show({
        color: 'red',
        title: 'Invalid File',
        message: error instanceof Error ? error.message : 'Invalid resume JSON.',
      })
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const clearAllData = () => {
    modals.openConfirmModal({
      title: 'Clear all resume data?',
      children: <Text size="sm">This action cannot be undone.</Text>,
      labels: { confirm: 'Clear Data', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await clearResumeDocuments()
          await setActiveResumeId(undefined)
          setActiveResume(null)
          await initializeDocuments()
          notifications.show({
            color: 'green',
            title: 'Cleared',
            message: 'All resume data has been cleared.',
          })
          await navigate({ to: '/' })
        } catch {
          notifications.show({
            color: 'red',
            title: 'Error',
            message: 'Failed to clear data.',
          })
        }
      },
    })
  }

  return (
    <Container size="md" py={48}>
      <Stack gap={16} pos="relative">
        <LoadingOverlay visible={isImporting} zIndex={10} overlayProps={{ radius: 0, blur: 1 }} />
        <Title order={2}>Settings</Title>

        <Card withBorder p={20} radius={0}>
          <Stack gap={12}>
            <Title order={4}>AI Settings</Title>
            <PasswordInput
              label="AI Service API Key"
              value={apiKeyDraft}
              onChange={(event) => setApiKeyDraft(event.currentTarget.value)}
            />
            <Text size="sm" c="dimmed">
              Optional: when provided, this key is used for AI requests.
            </Text>
            <Group>
              <Button onClick={() => void saveApiKey()}>Save API Key</Button>
              {appSettings.aiApiKey ? (
                <Button variant="default" onClick={() => void clearApiKey()}>
                  Clear API Key
                </Button>
              ) : null}
            </Group>
          </Stack>
        </Card>

        <Card withBorder p={20} radius={0}>
          <Stack gap={12}>
            <Title order={4}>Appearance</Title>
            <Select
              label="Color Scheme"
              data={[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
                { value: 'auto', label: 'System' },
              ]}
              value={appSettings.colorScheme}
              onChange={(value) => {
                if (value === 'light' || value === 'dark' || value === 'auto') {
                  void setColorScheme(value)
                }
              }}
            />
          </Stack>
        </Card>

        <Card withBorder p={20} radius={0}>
          <Stack gap={12}>
            <Title order={4}>Resume Data</Title>
            <Group>
              <Button onClick={() => void exportJson()}>Export as JSON</Button>
              <Button variant="default" onClick={() => fileInputRef.current?.click()}>
                Import from JSON
              </Button>
              <Button color="red" variant="default" onClick={clearAllData}>
                Clear all data
              </Button>
            </Group>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              style={{ display: 'none' }}
              onChange={(event) => {
                const file = event.currentTarget.files?.[0]
                if (file) {
                  void importJsonFile(file)
                }
              }}
            />
          </Stack>
        </Card>
      </Stack>
    </Container>
  )
}

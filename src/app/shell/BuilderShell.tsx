import { ActionIcon, Box, Button, Flex, Group, Tabs, Text, Tooltip } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { Link } from '@tanstack/react-router'
import {
  IconAlignLeft,
  IconMessageChatbot,
  IconSettings,
} from '@tabler/icons-react'

import type { ResumeSectionKey, ResumeSettings } from '@/entities/resume/model'
import { useActiveResumeStore } from '@/entities/resume/store'
import { ChatAssistantDrawer } from '@/features/chat-assistant/components/ChatAssistantDrawer'
import { useChatAssistantStore } from '@/features/chat-assistant/store/use-chat-assistant-store'
import { ResumeEditor } from '@/features/resume-editor/components/ResumeEditor'
import { ExportMenu } from '@/features/resume-export/components/ExportMenu'
import { ResumePreviewPanel } from '@/features/resume-preview/components/ResumePreviewPanel'
import { SectionNavigation } from '@/app/shell/SectionNavigation'
import { useAutosaveStore } from '@/shared/store/use-autosave-store'

function AutosaveIndicator() {
  const autosaveStatus = useAutosaveStore((state) => state.status)

  if (autosaveStatus === 'saving') {
    return (
      <Text size="xs" c="dimmed" data-testid="autosave-indicator">
        Saving...
      </Text>
    )
  }

  if (autosaveStatus === 'saved') {
    return (
      <Text size="xs" c="teal.6" fw={500} data-testid="autosave-indicator">
        • Saved
      </Text>
    )
  }

  if (autosaveStatus === 'error') {
    return (
      <Text size="xs" c="red.6" fw={500} data-testid="autosave-indicator">
        Save failed
      </Text>
    )
  }

  return null
}

export function BuilderShell() {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const activeResume = useActiveResumeStore((state) => state.activeResume)
  const updateActiveResumeSettings = useActiveResumeStore((state) => state.updateActiveResumeSettings)
  const openChatAssistant = useChatAssistantStore((state) => state.open)

  const sectionOrder = activeResume?.settings.sectionOrder ?? []
  const sectionVisibility = activeResume?.settings.sectionVisibility ?? {}
  const content = activeResume?.content

  const reorderSections = async (nextOrder: ResumeSectionKey[]) => {
    await updateActiveResumeSettings((settings: ResumeSettings) => ({
      ...settings,
      sectionOrder: nextOrder,
    }))
  }

  const navigation = (
    <SectionNavigation
      sectionOrder={sectionOrder}
      sectionVisibility={sectionVisibility}
      content={content}
      onReorder={(nextOrder) => {
        void reorderSections(nextOrder)
      }}
      onToggleSectionVisibility={(sectionKey, nextVisible) => {
        void updateActiveResumeSettings((settings: ResumeSettings) => ({
          ...settings,
          sectionVisibility: {
            ...settings.sectionVisibility,
            [sectionKey]: nextVisible,
          },
        }))
      }}
    />
  )

  const editorPanel = (
    <Box
      p={24}
      data-testid="builder-editor-region"
      style={{ overflowY: 'auto', height: '100%' }}
    >
      <ResumeEditor />
    </Box>
  )

  const previewPanel = <ResumePreviewPanel resume={activeResume} />

  const header = (
    <Box
      style={{
        height: 56,
        borderBottom: '1px solid var(--color-border)',
        background: '#FFFFFF',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 16,
        paddingRight: 16,
      }}
    >
      <Group justify="space-between" align="center" style={{ width: '100%' }}>
        <Group gap={8} align="center">
          <Box
            style={{
              width: 28,
              height: 28,
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <IconAlignLeft size={14} color="#FFFFFF" strokeWidth={2.5} />
          </Box>

          <Text
            component={Link}
            to="/"
            size="sm"
            fw={600}
            c="#1C1917"
            td="none"
            style={{ letterSpacing: '-0.01em' }}
          >
            Resume Makinator
          </Text>

          <Box
            style={{
              width: 1,
              height: 16,
              background: 'var(--color-border)',
              marginLeft: 4,
              marginRight: 4,
            }}
          />

          <Text size="sm" c="dimmed" style={{ maxWidth: 240 }} truncate>
            {activeResume?.title ?? 'Untitled Resume'}
          </Text>
        </Group>

        <Group gap={8} align="center">
          <AutosaveIndicator />

          <Tooltip label="Ask AI Copilot" withArrow position="bottom">
            <Button
              variant="light"
              color="teal"
              size="xs"
              radius="sm"
              h={32}
              px={12}
              leftSection={<IconMessageChatbot size={14} />}
              onClick={openChatAssistant}
              aria-label="Open Chat Assistant"
              style={{ fontWeight: 500 }}
            >
              Ask AI
            </Button>
          </Tooltip>

          <ExportMenu resume={activeResume} />

          <Tooltip label="Settings" withArrow position="bottom">
            <ActionIcon
              component={Link}
              to="/settings"
              variant="subtle"
              color="gray"
              size={32}
              aria-label="Open Settings"
            >
              <IconSettings size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
    </Box>
  )

  return (
    <Box style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <ChatAssistantDrawer />
      {header}

      {isMobile ? (
        <Tabs
          defaultValue="editor"
          data-testid="builder-mobile-tabs"
          style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
        >
          <Tabs.List>
            <Tabs.Tab value="editor">Editor</Tabs.Tab>
            <Tabs.Tab value="sections">Sections</Tabs.Tab>
            <Tabs.Tab value="preview">Preview</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="editor" style={{ flex: 1, overflowY: 'auto' }}>
            {editorPanel}
          </Tabs.Panel>
          <Tabs.Panel
            value="sections"
            data-testid="builder-navigation-region"
            style={{ flex: 1, overflowY: 'auto' }}
          >
            {navigation}
          </Tabs.Panel>
          <Tabs.Panel value="preview" style={{ flex: 1, background: '#1C1917' }}>
            {previewPanel}
          </Tabs.Panel>
        </Tabs>
      ) : (
        <Flex style={{ flex: 1, overflow: 'hidden' }}>
          <Box
            w={260}
            style={{
              borderRight: '1px solid var(--color-border)',
              background: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              flexShrink: 0,
            }}
            data-testid="builder-navigation-region"
          >
            {navigation}
          </Box>

          <Box
            style={{
              flex: 1,
              borderRight: '1px solid var(--color-border)',
              background: '#FFFFFF',
              overflowY: 'auto',
              minWidth: 0,
            }}
          >
            {editorPanel}
          </Box>

          <Box
            w={420}
            style={{
              background: '#1C1917',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <Box
              style={{
                height: 36,
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                paddingLeft: 16,
                paddingRight: 16,
                flexShrink: 0,
              }}
            >
              <Group justify="space-between" align="center" style={{ width: '100%' }}>
                <Text
                  size="xs"
                  fw={500}
                  style={{ color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase' }}
                >
                  Live Preview
                </Text>
                <Text size="xs" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-mono)' }}>
                  A4 · PDF
                </Text>
              </Group>
            </Box>

            <Box style={{ flex: 1, overflow: 'hidden' }}>
              {previewPanel}
            </Box>
          </Box>
        </Flex>
      )}
    </Box>
  )
}

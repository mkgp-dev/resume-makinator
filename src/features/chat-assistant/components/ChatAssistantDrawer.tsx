import {
  Badge,
  Box,
  Button,
  Drawer,
  Group,
  Select,
  Stack,
  Tabs,
  Text,
  Textarea,
} from '@mantine/core'
import { useMemo, useState } from 'react'

import { useActiveResumeStore } from '@/entities/resume/store'
import { useChatAssistantStore } from '@/features/chat-assistant/store/use-chat-assistant-store'

const sectionOptions = [
  { value: 'summary', label: 'Summary' },
  { value: 'languages', label: 'Languages' },
  { value: 'coreSkills', label: 'Core Skills' },
  { value: 'softSkills', label: 'Soft Skills' },
  { value: 'workExperiences', label: 'Work Experience' },
  { value: 'personalProjects', label: 'Projects' },
  { value: 'education', label: 'Education' },
  { value: 'certificates', label: 'Certificates' },
  { value: 'achievements', label: 'Achievements' },
  { value: 'references', label: 'References' },
] as const

const operationOptions = [
  { value: 'create', label: 'Create' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
]

const badgeByAction: Partial<Record<string, string>> = {
  resume_review: '📋 Resume Review',
  section_advice: '💡 Section Advice',
  ask_clarification: '❓ Clarification Needed',
}

const listSections = new Set([
  'coreSkills',
  'workExperiences',
  'personalProjects',
  'education',
  'certificates',
  'achievements',
  'references',
])

function getSectionItems(resume: ReturnType<typeof useActiveResumeStore.getState>['activeResume'], section: string): Array<{ value: string; label: string }> {
  if (!resume) {
    return []
  }

  switch (section) {
    case 'coreSkills':
      return resume.content.coreSkills.map((item) => ({ value: item.id, label: item.devLanguage || 'Skill' }))
    case 'workExperiences':
      return resume.content.workExperiences.map((item) => ({ value: item.id, label: `${item.companyName || 'Company'} - ${item.jobTitle || 'Role'}` }))
    case 'personalProjects':
      return resume.content.personalProjects.map((item) => ({ value: item.id, label: item.projectName || 'Project' }))
    case 'education':
      return resume.content.education.map((item) => ({ value: item.id, label: `${item.schoolName || 'School'} - ${item.degree || 'Degree'}` }))
    case 'certificates':
      return resume.content.certificates.map((item) => ({ value: item.id, label: item.name || 'Certificate' }))
    case 'achievements':
      return resume.content.achievements.map((item) => ({ value: item.id, label: item.title || 'Achievement' }))
    case 'references':
      return resume.content.references.map((item) => ({ value: item.id, label: item.name || 'Reference' }))
    default:
      return []
  }
}

export function ChatAssistantDrawer() {
  const activeResume = useActiveResumeStore((state) => state.activeResume)
  const {
    isOpen,
    close,
    mode,
    setMode,
    model,
    setModel,
    messages,
    pendingDraft,
    isLoading,
    isApplyingDraft,
    sendMessage,
    applyDraft,
    discardDraft,
    clearConversation,
  } = useChatAssistantStore((state) => state)

  const [messageText, setMessageText] = useState('')
  const [targetSection, setTargetSection] = useState<string | null>(null)
  const [targetOperation, setTargetOperation] = useState<string | null>(null)
  const [targetItemId, setTargetItemId] = useState<string | null>(null)

  const itemOptions = useMemo(
    () => getSectionItems(activeResume, targetSection ?? ''),
    [activeResume, targetSection],
  )

  const requiresItem = Boolean(
    targetSection
    && listSections.has(targetSection)
    && (targetOperation === 'update' || targetOperation === 'delete'),
  )

  const canSendPlan = mode === 'chat'
    || Boolean(targetSection && (!requiresItem || targetItemId))
  const showPlanTargetHelper = mode === 'plan'
    && messageText.trim().length > 0
    && !canSendPlan

  const handleSend = async () => {
    if (!messageText.trim()) {
      return
    }
    if (!canSendPlan) {
      return
    }

    const target = mode === 'plan' && targetSection
      ? {
          section: targetSection as
            | 'summary'
            | 'languages'
            | 'coreSkills'
            | 'softSkills'
            | 'workExperiences'
            | 'personalProjects'
            | 'education'
            | 'certificates'
            | 'achievements'
            | 'references',
          operation: (targetOperation ?? undefined) as 'create' | 'update' | 'delete' | undefined,
          itemId: targetItemId ?? undefined,
        }
      : undefined

    const currentText = messageText
    setMessageText('')
    await sendMessage(currentText, target)
  }

  return (
    <Drawer
      opened={isOpen}
      onClose={close}
      title="Chat Assistant"
      position="right"
      size={460}
      overlayProps={{ opacity: 0.2 }}
      data-testid="chat-assistant-drawer"
    >
      <Stack h="100%" gap={12}>
        <Tabs value={mode} onChange={(value) => setMode((value as 'chat' | 'plan') ?? 'chat')}>
          <Tabs.List>
            <Tabs.Tab value="chat">Ask AI</Tabs.Tab>
            <Tabs.Tab value="plan">Edit with AI</Tabs.Tab>
          </Tabs.List>
        </Tabs>

        <Group grow>
          <Select
            label="AI Style"
            description="Different styles affect response speed and detail."
            data={[
              { value: 'gemini', label: 'Balanced' },
              { value: 'nova', label: 'Fast' },
              { value: 'mistral', label: 'Precise' },
              { value: 'openai', label: 'Advanced' },
            ]}
            value={model}
            onChange={(value) => setModel((value as typeof model) ?? 'gemini')}
          />
        </Group>

        {mode === 'plan' ? (
          <Stack gap={8}>
            <Select
              label="Section"
              placeholder="Select target section"
              data={sectionOptions as unknown as { value: string; label: string }[]}
              value={targetSection}
              onChange={(value) => {
                setTargetSection(value)
                setTargetItemId(null)
              }}
            />
            <Select
              label="Operation"
              placeholder="Optional operation"
              clearable
              data={operationOptions}
              value={targetOperation}
              onChange={(value) => {
                setTargetOperation(value)
                setTargetItemId(null)
              }}
            />
            {requiresItem ? (
              <Select
                label="Item"
                placeholder="Select item"
                data={itemOptions}
                value={targetItemId}
                onChange={setTargetItemId}
              />
            ) : null}
          </Stack>
        ) : null}

        {pendingDraft ? (
          <Box p={12} style={{ border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }} data-testid="draft-review-panel">
            <Stack gap={8}>
              <Text fw={600}>📝 {pendingDraft.title}</Text>
              <Text size="sm">{pendingDraft.previewText}</Text>
              {pendingDraft.assumptions?.length ? (
                <Box>
                  <Text size="xs" c="dimmed">AI assumed:</Text>
                  {pendingDraft.assumptions.map((assumption) => (
                    <Text size="sm" key={assumption}>• {assumption}</Text>
                  ))}
                </Box>
              ) : null}
              <Group>
                <Button color="emerald" loading={isApplyingDraft} onClick={() => void applyDraft(pendingDraft)}>Apply</Button>
                <Button variant="default" onClick={discardDraft}>Discard</Button>
              </Group>
            </Stack>
          </Box>
        ) : null}

        <Stack gap={8} style={{ overflow: 'auto', flex: 1 }}>
          {messages.map((message) => (
            <Box
              key={message.id}
              p={10}
              style={{
                border: '1px solid var(--color-border)',
                background: message.role === 'user' ? 'var(--color-bg-secondary)' : 'var(--color-bg)',
              }}
            >
              {message.action && badgeByAction[message.action] ? (
                <Badge radius={0} mb={6}>{badgeByAction[message.action]}</Badge>
              ) : null}
              <Text size="sm">{message.content}</Text>
            </Box>
          ))}
          {isLoading ? (
            <Box p={10} style={{ border: '1px solid var(--color-border)' }}>
              <Text size="sm" c="dimmed">AI is thinking...</Text>
            </Box>
          ) : null}
        </Stack>

        <Stack gap={8}>
          <Textarea
            label="Message"
            minRows={3}
            value={messageText}
            onChange={(event) => setMessageText(event.currentTarget.value)}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                event.preventDefault()
                void handleSend()
              }
            }}
          />
          {showPlanTargetHelper ? (
            <Text size="sm" c="var(--color-text-muted)">
              Select a target section above before sending.
            </Text>
          ) : null}
          <Group justify="space-between">
            <Button variant="default" onClick={clearConversation}>Clear</Button>
            <Button onClick={() => void handleSend()} disabled={!messageText.trim() || !canSendPlan}>
              Send
            </Button>
          </Group>
        </Stack>
      </Stack>
    </Drawer>
  )
}

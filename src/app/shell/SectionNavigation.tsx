import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  ActionIcon,
  Box,
  Group,
  Stack,
  Switch,
  Text,
  Tooltip,
} from '@mantine/core'
import {
  IconBriefcase,
  IconCertificate,
  IconCode,
  IconGripVertical,
  IconHeartHandshake,
  IconLanguage,
  IconSchool,
  IconTerminal2,
  IconTrophy,
  IconUser,
  IconUsers,
} from '@tabler/icons-react'
import type { ComponentType } from 'react'

import type { ResumeContent, ResumeSectionKey } from '@/entities/resume/model'
import { applySectionOrderReorder } from '@/entities/resume/utils/apply-section-order-reorder'

const sectionLabels: Record<ResumeSectionKey, string> = {
  personalDetails: 'Personal Details',
  workExperiences: 'Work Experience',
  personalProjects: 'Projects',
  education: 'Education',
  certificates: 'Certificates',
  achievements: 'Achievements',
  references: 'References',
  coreSkills: 'Core Skills',
  softSkills: 'Soft Skills',
  knownLanguages: 'Known Languages',
}

function getSectionCount(sectionKey: ResumeSectionKey, content: ResumeContent): number {
  if (sectionKey === 'personalDetails') {
    return 0
  }

  if (sectionKey === 'softSkills') {
    return content.softSkills.length
  }

  return content[sectionKey].length
}

const sectionIcons: Record<ResumeSectionKey, ComponentType<{ size?: number; color?: string; strokeWidth?: number }>> = {
  personalDetails: IconUser,
  workExperiences: IconBriefcase,
  personalProjects: IconCode,
  education: IconSchool,
  certificates: IconCertificate,
  achievements: IconTrophy,
  references: IconUsers,
  coreSkills: IconTerminal2,
  softSkills: IconHeartHandshake,
  knownLanguages: IconLanguage,
}

function SortableSectionRow({
  sectionKey,
  isVisible,
  count,
  isActive,
  onToggle,
}: {
  sectionKey: ResumeSectionKey
  isVisible: boolean
  count: number | null
  isActive: boolean
  onToggle: (visible: boolean) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: sectionKey })
  const sectionLabel = sectionLabels[sectionKey]
  const SectionIcon = sectionIcons[sectionKey]

  return (
    <Box
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        borderLeft: isActive ? '2px solid #10B981' : '2px solid transparent',
        cursor: 'default',
      }}
      className="section-nav-row"
    >
      <Group
        px={12}
        py={0}
        style={{
          minHeight: 44,
          gap: 0,
          flexWrap: 'nowrap',
          alignItems: 'center',
          userSelect: 'none',
        }}
      >
        <Tooltip label="Drag to reorder" withArrow position="right" openDelay={600}>
          <ActionIcon
            variant="transparent"
            color="gray"
            size={28}
            style={{ opacity: 0.35, cursor: 'grab', flexShrink: 0 }}
            aria-label={`Drag ${sectionLabel} section`}
            {...attributes}
            {...listeners}
          >
            <IconGripVertical size={14} />
          </ActionIcon>
        </Tooltip>

        <Box
          style={{
            width: 28,
            height: 28,
            borderRadius: 4,
            background: isActive ? 'rgba(16, 185, 129, 0.1)' : 'var(--color-bg-tertiary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginRight: 10,
          }}
        >
          <SectionIcon
            size={14}
            color={isActive ? '#10B981' : 'var(--color-text-muted)'}
            strokeWidth={2}
          />
        </Box>

        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text
            size="sm"
            fw={isActive ? 500 : 400}
            c={isActive ? '#1C1917' : 'var(--color-text-muted)'}
            truncate
            style={{ lineHeight: '20px' }}
          >
            {sectionLabel}
          </Text>
          {count !== null ? (
            <Text
              size="xs"
              style={{ color: 'var(--color-text-placeholder)', lineHeight: '16px' }}
            >
              {count} {count === 1 ? 'entry' : 'entries'}
            </Text>
          ) : null}
        </Box>

        <Switch
          checked={isVisible}
          size="xs"
          color="teal"
          onChange={(event) => {
            onToggle(event.currentTarget.checked)
          }}
          aria-label={`Toggle ${sectionLabel} visibility`}
          style={{ flexShrink: 0 }}
        />
      </Group>
    </Box>
  )
}

export function SectionNavigation({
  sectionOrder,
  sectionVisibility,
  content,
  onReorder,
  onToggleSectionVisibility,
}: {
  sectionOrder: ResumeSectionKey[]
  sectionVisibility: Partial<Record<ResumeSectionKey, boolean>>
  content: ResumeContent | null | undefined
  onReorder: (nextOrder: ResumeSectionKey[]) => void
  onToggleSectionVisibility: (sectionKey: ResumeSectionKey, nextVisible: boolean) => void
}) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const onSectionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const nextOrder = applySectionOrderReorder(
      sectionOrder,
      String(active.id),
      String(over.id),
    )

    onReorder(nextOrder)
  }

  return (
    <Box style={{ paddingTop: 8, paddingBottom: 8 }}>
      <Box px={16} pb={8} pt={4}>
        <Text
          size="xs"
          fw={600}
          style={{
            color: 'var(--color-text-placeholder)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          Document Sections
        </Text>
        <Text size="xs" c="dimmed" mt={2}>
          Drag to reorder · Toggle to hide
        </Text>
      </Box>

      <Box style={{ height: 1, background: 'var(--color-border)', marginBottom: 8 }} />

      {content ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onSectionDragEnd}>
          <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
            <Stack gap={0}>
              {sectionOrder.map((sectionKey, index) => {
                const isVisible = sectionVisibility[sectionKey] !== false
                const rawCount = getSectionCount(sectionKey, content)
                const count = sectionKey === 'personalDetails' || rawCount < 1 ? null : rawCount

                return (
                  <SortableSectionRow
                    key={sectionKey}
                    sectionKey={sectionKey}
                    isVisible={isVisible}
                    count={count}
                    isActive={index === 0}
                    onToggle={(nextVisible) => onToggleSectionVisibility(sectionKey, nextVisible)}
                  />
                )
              })}
            </Stack>
          </SortableContext>
        </DndContext>
      ) : null}
    </Box>
  )
}

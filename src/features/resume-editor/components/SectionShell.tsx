import { Badge, Box, Group, Text } from '@mantine/core'

import type { ResumeSectionKey } from '@/entities/resume/model'
import { sectionLabels } from '@/features/resume-editor/lib/section-labels'

export function SectionShell({
  sectionKey,
  hidden,
  isFlashing,
  children,
}: {
  sectionKey: ResumeSectionKey
  hidden: boolean
  isFlashing: boolean
  children: React.ReactNode
}) {
  return (
    <Box
      data-testid={`editor-section-${sectionKey}`}
      p={16}
      style={{
        borderBottom: '1px solid var(--color-border)',
        backgroundColor: isFlashing ? 'rgba(16, 185, 129, 0.16)' : 'transparent',
        transition: 'background-color 350ms ease',
      }}
    >
      <Group justify="space-between" pb={8}>
        <Text fw={600}>{sectionLabels[sectionKey]}</Text>
        {hidden ? <Badge color="gray" radius={0}>Hidden in preview</Badge> : null}
      </Group>
      {children}
    </Box>
  )
}

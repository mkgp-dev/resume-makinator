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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Group,
  Paper,
  Stack,
  Text,
} from '@mantine/core'
import { modals } from '@mantine/modals'
import { IconGripVertical, IconMinus, IconPlus } from '@tabler/icons-react'
import { useState, type ReactNode } from 'react'

type EntryWithId = { id: string }

type EntryListEditorProps<TItem extends EntryWithId> = {
  title: string
  items: TItem[]
  onChange: (items: TItem[]) => void
  createEmptyItem: () => TItem
  renderSummary: (item: TItem) => string
  renderForm: (item: TItem, onItemChange: (next: TItem) => void) => ReactNode
}

type SortableRowProps<TItem extends EntryWithId> = {
  item: TItem
  isExpanded: boolean
  onToggle: () => void
  onDelete: () => void
  onItemChange: (next: TItem) => void
  renderSummary: (item: TItem) => string
  renderForm: (item: TItem, onItemChange: (next: TItem) => void) => ReactNode
}

function SortableRow<TItem extends EntryWithId>({
  item,
  isExpanded,
  onToggle,
  onDelete,
  onItemChange,
  renderSummary,
  renderForm,
}: SortableRowProps<TItem>) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id })

  return (
    <Paper
      ref={setNodeRef}
      withBorder
      p={12}
      radius={0}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <Group justify="space-between" align="center" wrap="nowrap">
        <Group align="center" wrap="nowrap" style={{ flex: 1 }}>
          <ActionIcon variant="subtle" color="gray" aria-label="Drag entry" size={44} {...attributes} {...listeners}>
            <IconGripVertical size={16} />
          </ActionIcon>
          <Text size="sm">{renderSummary(item)}</Text>
        </Group>

        <Group gap={8}>
          <Button variant="subtle" radius={0} size="md" onClick={onToggle}>
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
          <ActionIcon variant="subtle" color="red" aria-label="Delete entry" size={44} onClick={onDelete}>
            <IconMinus size={16} />
          </ActionIcon>
        </Group>
      </Group>

      {isExpanded ? <Box pt={12}>{renderForm(item, onItemChange)}</Box> : null}
    </Paper>
  )
}

export function EntryListEditor<TItem extends EntryWithId>({
  title,
  items,
  onChange,
  createEmptyItem,
  renderSummary,
  renderForm,
}: EntryListEditorProps<TItem>) {
  const [expandedIds, setExpandedIds] = useState<string[]>([])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleAdd = () => {
    const next = createEmptyItem()
    onChange([...items, next])
    setExpandedIds((prev) => [...prev, next.id])
  }

  const requestDelete = (itemId: string) => {
    modals.openConfirmModal({
      title: 'Delete entry?',
      children: <Text size="sm">This action cannot be undone.</Text>,
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        onChange(items.filter((item) => item.id !== itemId))
      },
    })
  }

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = items.findIndex((item) => item.id === active.id)
    const newIndex = items.findIndex((item) => item.id === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    onChange(arrayMove(items, oldIndex, newIndex))
  }

  return (
    <Stack gap={12}>
      <Group justify="space-between" align="center">
        <Text fw={500}>{title}</Text>
        <Button leftSection={<IconPlus size={14} />} radius={0} size="md" onClick={handleAdd}>
          Add Entry
        </Button>
      </Group>

      {items.length === 0 ? <Badge radius={0}>No entries yet. Add your first entry to get started.</Badge> : null}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          <Stack gap={10}>
            {items.map((item) => {
              const expanded = expandedIds.includes(item.id)

              return (
                <SortableRow
                  key={item.id}
                  item={item}
                  isExpanded={expanded}
                  onToggle={() => {
                    setExpandedIds((prev) =>
                      expanded ? prev.filter((id) => id !== item.id) : [...prev, item.id],
                    )
                  }}
                  onDelete={() => requestDelete(item.id)}
                  onItemChange={(nextItem) => {
                    onChange(items.map((entry) => (entry.id === nextItem.id ? nextItem : entry)))
                  }}
                  renderSummary={renderSummary}
                  renderForm={renderForm}
                />
              )
            })}
          </Stack>
        </SortableContext>
      </DndContext>
    </Stack>
  )
}

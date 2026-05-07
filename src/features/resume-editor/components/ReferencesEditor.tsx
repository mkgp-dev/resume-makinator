import { Stack, TextInput } from '@mantine/core'

import type { ReferenceItem } from '@/entities/resume/model'
import { EntryListEditor } from '@/features/resume-editor/components/EntryListEditor'
import { emptyReference } from '@/features/resume-editor/lib/empty-items'

export function ReferencesEditor({ items, onChange }: { items: ReferenceItem[]; onChange: (items: ReferenceItem[]) => void }) {
  return (
    <EntryListEditor
      title="References"
      items={items}
      onChange={onChange}
      createEmptyItem={emptyReference}
      renderSummary={(item) => `${item.name || 'Name'} · ${item.role || 'Role'}`}
      renderForm={(item, onItemChange) => (
        <Stack>
          <TextInput label="Name" value={item.name} onChange={(e) => onItemChange({ ...item, name: e.currentTarget.value })} />
          <TextInput label="Role" value={item.role} onChange={(e) => onItemChange({ ...item, role: e.currentTarget.value })} />
        </Stack>
      )}
    />
  )
}

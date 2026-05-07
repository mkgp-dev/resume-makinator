import { Select, Stack, TextInput } from '@mantine/core'

import type { KnownLanguageItem } from '@/entities/resume/model'
import { EntryListEditor } from '@/features/resume-editor/components/EntryListEditor'
import { emptyKnownLanguage } from '@/features/resume-editor/lib/empty-items'

export function KnownLanguagesEditor({ items, onChange }: { items: KnownLanguageItem[]; onChange: (items: KnownLanguageItem[]) => void }) {
  return (
    <EntryListEditor
      title="Known Languages"
      items={items}
      onChange={onChange}
      createEmptyItem={emptyKnownLanguage}
      renderSummary={(item) => `${item.name || 'Language'} · ${item.proficiency}`}
      renderForm={(item, onItemChange) => (
        <Stack>
          <TextInput label="Language" value={item.name} onChange={(e) => onItemChange({ ...item, name: e.currentTarget.value })} />
          <Select
            label="Proficiency"
            data={['Native', 'Professional', 'Conversational', 'Basic']}
            value={item.proficiency}
            onChange={(next) => onItemChange({ ...item, proficiency: next ?? 'Conversational' })}
          />
        </Stack>
      )}
    />
  )
}

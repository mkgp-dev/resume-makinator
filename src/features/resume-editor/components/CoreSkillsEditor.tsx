import { Stack, TagsInput, TextInput } from '@mantine/core'

import type { CoreSkillItem } from '@/entities/resume/model'
import { EntryListEditor } from '@/features/resume-editor/components/EntryListEditor'
import { emptyCoreSkill } from '@/features/resume-editor/lib/empty-items'

export function CoreSkillsEditor({ items, onChange }: { items: CoreSkillItem[]; onChange: (items: CoreSkillItem[]) => void }) {
  return (
    <EntryListEditor
      title="Core Skills"
      items={items}
      onChange={onChange}
      createEmptyItem={emptyCoreSkill}
      renderSummary={(item) => item.devLanguage || 'Skill'}
      renderForm={(item, onItemChange) => (
        <Stack>
          <TextInput
            label="Dev Language"
            value={item.devLanguage}
            onChange={(e) => onItemChange({ ...item, devLanguage: e.currentTarget.value })}
          />
          <TagsInput
            label="Frameworks"
            value={item.devFrameworks}
            onChange={(next) => onItemChange({ ...item, devFrameworks: next })}
            placeholder="Type and press Enter"
          />
        </Stack>
      )}
    />
  )
}

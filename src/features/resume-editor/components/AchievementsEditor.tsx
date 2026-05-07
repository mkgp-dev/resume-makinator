import { Stack, TextInput } from '@mantine/core'

import type { AchievementItem } from '@/entities/resume/model'
import { EntryListEditor } from '@/features/resume-editor/components/EntryListEditor'
import { emptyAchievement } from '@/features/resume-editor/lib/empty-items'

export function AchievementsEditor({ items, onChange }: { items: AchievementItem[]; onChange: (items: AchievementItem[]) => void }) {
  return (
    <EntryListEditor
      title="Achievements"
      items={items}
      onChange={onChange}
      createEmptyItem={emptyAchievement}
      renderSummary={(item) => `${item.title || 'Achievement'} · ${item.issuer || 'Issuer'}`}
      renderForm={(item, onItemChange) => (
        <Stack>
          <TextInput label="Title" value={item.title} onChange={(e) => onItemChange({ ...item, title: e.currentTarget.value })} />
          <TextInput label="Issuer" value={item.issuer} onChange={(e) => onItemChange({ ...item, issuer: e.currentTarget.value })} />
        </Stack>
      )}
    />
  )
}

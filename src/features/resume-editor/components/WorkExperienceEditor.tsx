import { Checkbox, Stack, TagsInput, TextInput, Textarea } from '@mantine/core'

import type { WorkExperienceItem } from '@/entities/resume/model'
import { EntryListEditor } from '@/features/resume-editor/components/EntryListEditor'
import { emptyWorkExperience } from '@/features/resume-editor/lib/empty-items'

export function WorkExperienceEditor({ items, onChange }: { items: WorkExperienceItem[]; onChange: (items: WorkExperienceItem[]) => void }) {
  return (
    <EntryListEditor
      title="Work Experience"
      items={items}
      onChange={onChange}
      createEmptyItem={emptyWorkExperience}
      renderSummary={(item) => `${item.companyName || 'Company'} · ${item.jobTitle || 'Job Title'}`}
      renderForm={(item, onItemChange) => (
        <Stack>
          <TextInput label="Company" value={item.companyName} onChange={(e) => onItemChange({ ...item, companyName: e.currentTarget.value })} />
          <TextInput label="Job Title" value={item.jobTitle} onChange={(e) => onItemChange({ ...item, jobTitle: e.currentTarget.value })} />
          <TextInput
            label="Start Date"
            placeholder="e.g. 2022-01"
            value={item.startDate}
            onChange={(e) => onItemChange({ ...item, startDate: e.currentTarget.value })}
          />
          <TextInput
            label="End Date"
            placeholder="e.g. 2024-06 or leave blank if current"
            value={item.endDate}
            onChange={(e) => onItemChange({ ...item, endDate: e.currentTarget.value })}
          />
          <Checkbox
            label="Currently working here"
            checked={item.current}
            onChange={(e) => onItemChange({ ...item, current: e.currentTarget.checked })}
          />
          <TextInput
            label="Location"
            placeholder="e.g. Manila, Philippines"
            value={item.location}
            onChange={(e) => onItemChange({ ...item, location: e.currentTarget.value })}
          />
          <Textarea label="Summary" value={item.summary} onChange={(e) => onItemChange({ ...item, summary: e.currentTarget.value })} minRows={2} />
          <TagsInput
            label="Bullet Points"
            value={item.bulletPoints}
            onChange={(next) => onItemChange({ ...item, bulletPoints: next })}
            placeholder="Type a bullet point and press Enter"
          />
        </Stack>
      )}
    />
  )
}

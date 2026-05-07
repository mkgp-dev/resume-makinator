import { Checkbox, Stack, TextInput, Textarea } from '@mantine/core'

import type { EducationItem } from '@/entities/resume/model'
import { EntryListEditor } from '@/features/resume-editor/components/EntryListEditor'
import { emptyEducation } from '@/features/resume-editor/lib/empty-items'

export function EducationEditor({ items, onChange }: { items: EducationItem[]; onChange: (items: EducationItem[]) => void }) {
  return (
    <EntryListEditor
      title="Education"
      items={items}
      onChange={onChange}
      createEmptyItem={emptyEducation}
      renderSummary={(item) => `${item.schoolName || 'School'} · ${item.degree || 'Degree'}`}
      renderForm={(item, onItemChange) => (
        <Stack>
          <TextInput label="School" value={item.schoolName} onChange={(e) => onItemChange({ ...item, schoolName: e.currentTarget.value })} />
          <TextInput label="Degree" value={item.degree} onChange={(e) => onItemChange({ ...item, degree: e.currentTarget.value })} />
          <TextInput
            label="Field of Study"
            value={item.fieldOfStudy}
            onChange={(e) => onItemChange({ ...item, fieldOfStudy: e.currentTarget.value })}
          />
          <TextInput
            label="Start Date"
            placeholder="e.g. 2018-06"
            value={item.startDate}
            onChange={(e) => onItemChange({ ...item, startDate: e.currentTarget.value })}
          />
          <TextInput
            label="End Date"
            placeholder="e.g. 2022-03 or leave blank if current"
            value={item.endDate}
            onChange={(e) => onItemChange({ ...item, endDate: e.currentTarget.value })}
          />
          <Checkbox
            label="Currently studying here"
            checked={item.current}
            onChange={(e) => onItemChange({ ...item, current: e.currentTarget.checked })}
          />
          <TextInput
            label="Location"
            placeholder="e.g. Cebu City, Philippines"
            value={item.location}
            onChange={(e) => onItemChange({ ...item, location: e.currentTarget.value })}
          />
          <Textarea
            label="Description"
            placeholder="Highlight relevant coursework or achievements."
            minRows={2}
            value={item.description}
            onChange={(e) => onItemChange({ ...item, description: e.currentTarget.value })}
          />
        </Stack>
      )}
    />
  )
}

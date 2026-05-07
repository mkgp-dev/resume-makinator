import { Stack, TagsInput, TextInput, Textarea } from '@mantine/core'

import type { ProjectItem } from '@/entities/resume/model'
import { EntryListEditor } from '@/features/resume-editor/components/EntryListEditor'
import { emptyProject } from '@/features/resume-editor/lib/empty-items'

export function ProjectsEditor({ items, onChange }: { items: ProjectItem[]; onChange: (items: ProjectItem[]) => void }) {
  return (
    <EntryListEditor
      title="Projects"
      items={items}
      onChange={onChange}
      createEmptyItem={emptyProject}
      renderSummary={(item) => `${item.projectName || 'Project'} · ${item.role || 'Role'}`}
      renderForm={(item, onItemChange) => (
        <Stack>
          <TextInput label="Project Name" value={item.projectName} onChange={(e) => onItemChange({ ...item, projectName: e.currentTarget.value })} />
          <TextInput label="Role" value={item.role} onChange={(e) => onItemChange({ ...item, role: e.currentTarget.value })} />
          <TextInput
            label="Project URL"
            placeholder="e.g. https://project.example.com"
            value={item.url}
            onChange={(e) => onItemChange({ ...item, url: e.currentTarget.value })}
          />
          <Textarea
            label="Summary"
            placeholder="Briefly describe the project impact."
            value={item.summary}
            onChange={(e) => onItemChange({ ...item, summary: e.currentTarget.value })}
            minRows={2}
          />
          <TagsInput
            label="Tech Stack"
            value={item.techStack}
            onChange={(next) => onItemChange({ ...item, techStack: next })}
            placeholder="Type and press Enter"
          />
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

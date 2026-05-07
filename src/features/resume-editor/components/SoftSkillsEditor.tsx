import { TagsInput } from '@mantine/core'

export function SoftSkillsEditor({ items, onChange }: { items: string[]; onChange: (items: string[]) => void }) {
  return (
    <TagsInput
      label="Soft Skills"
      placeholder="Type and press Enter"
      value={items}
      onChange={onChange}
    />
  )
}

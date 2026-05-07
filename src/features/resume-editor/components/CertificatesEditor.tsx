import { Stack, TextInput, Textarea } from '@mantine/core'

import type { CertificateItem } from '@/entities/resume/model'
import { EntryListEditor } from '@/features/resume-editor/components/EntryListEditor'
import { emptyCertificate } from '@/features/resume-editor/lib/empty-items'

export function CertificatesEditor({ items, onChange }: { items: CertificateItem[]; onChange: (items: CertificateItem[]) => void }) {
  return (
    <EntryListEditor
      title="Certificates"
      items={items}
      onChange={onChange}
      createEmptyItem={emptyCertificate}
      renderSummary={(item) => `${item.name || 'Certificate'} · ${item.issuer || 'Issuer'}`}
      renderForm={(item, onItemChange) => (
        <Stack>
          <TextInput label="Certificate Name" value={item.name} onChange={(e) => onItemChange({ ...item, name: e.currentTarget.value })} />
          <TextInput label="Issuer" value={item.issuer} onChange={(e) => onItemChange({ ...item, issuer: e.currentTarget.value })} />
          <TextInput
            label="Issue Date"
            placeholder="e.g. 2024-10"
            value={item.issueDate}
            onChange={(e) => onItemChange({ ...item, issueDate: e.currentTarget.value })}
          />
          <TextInput
            label="Credential ID"
            placeholder="e.g. ABC-12345"
            value={item.credentialId}
            onChange={(e) => onItemChange({ ...item, credentialId: e.currentTarget.value })}
          />
          <TextInput
            label="Credential URL"
            placeholder="e.g. https://verify.example.com/credential/abc-12345"
            value={item.credentialUrl}
            onChange={(e) => onItemChange({ ...item, credentialUrl: e.currentTarget.value })}
          />
          <Textarea
            label="Description"
            placeholder="Add context about the certification."
            minRows={2}
            value={item.description}
            onChange={(e) => onItemChange({ ...item, description: e.currentTarget.value })}
          />
        </Stack>
      )}
    />
  )
}

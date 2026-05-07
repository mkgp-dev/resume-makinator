import { Stack, TextInput, Textarea } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useDebouncedValue } from '@mantine/hooks'
import { useEffect, useRef } from 'react'

import type { ResumeContent } from '@/entities/resume/model'

export function PersonalDetailsForm({
  details,
  onChange,
}: {
  details: ResumeContent['personalDetails']
  onChange: (next: ResumeContent['personalDetails']) => void
}) {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: details,
  })
  const isHydratingRef = useRef(true)

  useEffect(() => {
    form.setValues(details)
    isHydratingRef.current = true
  }, [details, form])

  const values = form.getValues()
  const [debouncedValues] = useDebouncedValue(values, 300)

  useEffect(() => {
    if (isHydratingRef.current) {
      isHydratingRef.current = false
      return
    }

    onChange(debouncedValues)
  }, [debouncedValues, onChange])

  return (
    <Stack>
      <TextInput label="Full Name" placeholder="e.g. Jane Doe" {...form.getInputProps('fullName')} />
      <TextInput label="Professional Headline" placeholder="e.g. Senior Frontend Engineer" {...form.getInputProps('headline')} />
      <TextInput label="Email" placeholder="e.g. jane@example.com" {...form.getInputProps('email')} />
      <TextInput label="Phone" placeholder="e.g. +63 912 345 6789" {...form.getInputProps('phone')} />
      <TextInput label="Location" placeholder="e.g. Manila, Philippines" {...form.getInputProps('location')} />
      <TextInput label="Website URL" placeholder="e.g. https://janedoe.dev" {...form.getInputProps('website')} />
      <TextInput label="LinkedIn URL" placeholder="e.g. https://linkedin.com/in/janedoe" {...form.getInputProps('linkedin')} />
      <TextInput label="GitHub URL" placeholder="e.g. https://github.com/janedoe" {...form.getInputProps('github')} />
      <Textarea label="Professional Summary" placeholder="Write a concise professional summary." minRows={3} {...form.getInputProps('summary')} />
    </Stack>
  )
}

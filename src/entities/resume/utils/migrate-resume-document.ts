import type { ResumeDocument } from '@/entities/resume/model'
import { createResumeDocument } from '@/entities/resume/utils/create-resume-document'
import { validateResumeDocument } from '@/entities/resume/utils/validate-resume-document'

function isObjectRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === 'object' && input !== null
}

function deepMerge<T>(base: T, patch: unknown): T {
  if (!isObjectRecord(base) || !isObjectRecord(patch)) {
    return (patch ?? base) as T
  }

  const result: Record<string, unknown> = { ...base }
  for (const key of Object.keys(patch)) {
    const baseValue = result[key]
    const patchValue = patch[key]

    if (isObjectRecord(baseValue) && isObjectRecord(patchValue) && !Array.isArray(baseValue) && !Array.isArray(patchValue)) {
      result[key] = deepMerge(baseValue, patchValue)
      continue
    }

    result[key] = patchValue
  }

  return result as T
}

export function migrateResumeDocument(input: unknown): ResumeDocument {
  if (!isObjectRecord(input)) {
    throw new Error('Resume document must be an object')
  }

  const versionValue = input.version
  if (typeof versionValue === 'number' && versionValue > 1) {
    throw new Error(`Unsupported resume schema version: ${versionValue}`)
  }

  const defaults = createResumeDocument()
  const migrated = deepMerge(defaults, input)

  if (!isObjectRecord(input) || typeof input.version !== 'number') {
    migrated.version = 1
  }

  return validateResumeDocument(migrated)
}

import type { ResumeDocument } from '@/entities/resume/model'
import { validateResumeDocument } from '@/entities/resume/utils'

export function createResumeJsonDownload(document: ResumeDocument): { fileName: string; blob: Blob } {
  return {
    fileName: 'resume.json',
    blob: new Blob([JSON.stringify(document, null, 2)], { type: 'application/json' }),
  }
}

export async function parseImportedResumeDocument(file: File): Promise<ResumeDocument> {
  const raw = await file.text()
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('Invalid JSON file.')
  }

  return validateResumeDocument(parsed)
}

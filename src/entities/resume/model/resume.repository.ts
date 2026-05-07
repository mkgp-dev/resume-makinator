import { appDb } from '@/shared/lib/db/app-db'
import type { ResumeDocument } from '@/entities/resume/model/resume.types'

export async function listResumeDocuments(): Promise<ResumeDocument[]> {
  return appDb.resumeDocuments.orderBy('updatedAt').reverse().toArray()
}

export async function getResumeDocumentById(id: string): Promise<ResumeDocument | undefined> {
  return appDb.resumeDocuments.get(id)
}

export async function upsertResumeDocument(document: ResumeDocument): Promise<void> {
  await appDb.resumeDocuments.put(document)
}

export async function deleteResumeDocument(id: string): Promise<void> {
  await appDb.resumeDocuments.delete(id)
}

export async function clearResumeDocuments(): Promise<void> {
  await appDb.resumeDocuments.clear()
}

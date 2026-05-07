import Dexie, { type Table } from 'dexie'

import type { ResumeDocument } from '@/entities/resume/model'

export type AppSettingsRecord = {
  id: 'singleton'
  activeResumeId?: string
  aiApiKey?: string
  colorScheme: 'light' | 'dark' | 'auto'
}

export class ResumeMakinatorDB extends Dexie {
  resumeDocuments!: Table<ResumeDocument>
  appSettings!: Table<AppSettingsRecord>

  constructor() {
    super('ResumeMakinator')
    this.version(1).stores({
      resumeDocuments: 'id, updatedAt',
      appSettings: 'id',
    })
  }
}

export const appDb = new ResumeMakinatorDB()

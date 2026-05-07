import { Button } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconDownload } from '@tabler/icons-react'
import { useState } from 'react'

import type { ResumeDocument } from '@/entities/resume/model'

function buildFileName(resume: ResumeDocument): string {
  const rawName = resume.content.personalDetails.fullName.trim() || 'Resume'
  const safeName = rawName.replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/\s+/g, ' ').trim() || 'Resume'
  return `${safeName}-Resume.pdf`
}

function triggerDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

export function ExportMenu({ resume }: { resume: ResumeDocument | null }) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    if (!resume || isExporting) {
      return
    }

    try {
      setIsExporting(true)
      const [{ pdf }, { WhitepaperTemplate }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('@/features/resume-preview/templates/whitepaper/WhitepaperTemplate'),
      ])
      const blob = await pdf(<WhitepaperTemplate resume={resume} />).toBlob()
      triggerDownload(blob, buildFileName(resume))
    } catch {
      notifications.show({
        color: 'red',
        title: 'Export failed',
        message: 'Could not generate PDF. Please try again.',
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      size="xs"
      radius="sm"
      h={32}
      px={12}
      loading={isExporting}
      onClick={() => void handleExport()}
      disabled={!resume}
      leftSection={<IconDownload size={14} />}
      style={{ fontWeight: 500 }}
    >
      Compile PDF
    </Button>
  )
}

import { Box } from '@mantine/core'
import { PDFViewer } from '@react-pdf/renderer'

import type { ResumeDocument } from '@/entities/resume/model'
import { WhitepaperTemplate } from '@/features/resume-preview/templates/whitepaper/WhitepaperTemplate'

export function ResumePreviewPdf({ resume }: { resume: ResumeDocument }) {
  return (
    <Box style={{ height: '100%' }}>
      <PDFViewer width="100%" height="100%" showToolbar={false}>
        <WhitepaperTemplate resume={resume} />
      </PDFViewer>
    </Box>
  )
}

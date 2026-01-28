import { Document, Page } from "@react-pdf/renderer"
import { memo } from "react"
import Classic from "@/features/viewer/templates/classic/Classic"
import Whitepaper from "@/features/viewer/templates/whitepaper/Whitepaper"
import type { ResumePreviewData, TemplateId } from "@/entities/resume/types"

type RenderProps = {
    data: ResumePreviewData
}

function Render({ data }: RenderProps) {
    const templateId: TemplateId = data.configuration.template

    const documentTitle = data.personalDetails.fullName
        ? `${data.personalDetails.fullName} - ${data.personalDetails.jobTitle || "Resume"}`
        : "My Resume"

    return (
        <Document
            title={documentTitle}
            author={data.personalDetails.fullName || "mkgp-dev"}
            subject="Resume"
            creator="Resume Makinator"
            producer="mkgp-dev"
            language="en"
        >
            <Page
                size={data.configuration.pageSize}
                style={{ padding: 15 }}
            >
                {templateId === "classic" ? (
                    <Classic data={data} />
                ) : (
                    <Whitepaper data={data} />
                )}
            </Page>
        </Document>
    )
}

export default memo(Render)

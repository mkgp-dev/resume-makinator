import { Document, Page } from "@react-pdf/renderer"
import { getTemplateComponent } from "@/features/viewer/templates"
import type { ResumePreviewData } from "@/entities/resume/types"

type RenderProps = {
    data: ResumePreviewData
}

const renderTemplateContent = (data: ResumePreviewData) => {
    const Template = getTemplateComponent(data.configuration.template)
    return Template({ data })
}

export default function Render({ data }: RenderProps) {
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
                {renderTemplateContent(data)}
            </Page>
        </Document>
    )
}

import Whitepaper from "@/features/viewer/templates/whitepaper/Whitepaper"
import Classic from "@/features/viewer/templates/classic/Classic"
import type { ReactElement } from "react"
import type { ResumeData, TemplateId } from "@/entities/resume/types"

type TemplateComponent = (props: { data: ResumeData }) => ReactElement

type TemplateEntry = {
    id: TemplateId
    label: string
    Component: TemplateComponent
}

export const TEMPLATE_REGISTRY: Record<TemplateId, TemplateEntry> = {
    whitepaper: {
        id: "whitepaper",
        label: "Simple Whitepaper",
        Component: Whitepaper,
    },
    classic: {
        id: "classic",
        label: "Classic",
        Component: Classic,
    },
}

export const templateOptions = Object.values(TEMPLATE_REGISTRY).map(template => ({
    name: template.label,
    value: template.id,
}))

export const getTemplateComponent = (templateId: TemplateId): TemplateComponent =>
    TEMPLATE_REGISTRY[templateId]?.Component || TEMPLATE_REGISTRY.whitepaper.Component

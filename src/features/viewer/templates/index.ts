import Whitepaper from "@/features/viewer/templates/whitepaper/Whitepaper"
import Classic from "@/features/viewer/templates/classic/Classic"
import Modern from "@/features/viewer/templates/modern/Modern"
import ModernAlt from "@/features/viewer/templates/modern-alt/ModernAlt"
import type { ReactElement } from "react"
import type { ResumePreviewData, TemplateId } from "@/entities/resume/types"

type TemplateComponent = (props: { data: ResumePreviewData }) => ReactElement

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
    modern: {
        id: "modern",
        label: "Modern",
        Component: Modern,
    },
    "modern-alt": {
        id: "modern-alt",
        label: "Modern Alt",
        Component: ModernAlt,
    },
}

export const templateOptions = Object.values(TEMPLATE_REGISTRY).map(template => ({
    name: template.label,
    value: template.id,
}))

export const getTemplateComponent = (templateId: TemplateId): TemplateComponent =>
    TEMPLATE_REGISTRY[templateId]?.Component || TEMPLATE_REGISTRY.whitepaper.Component

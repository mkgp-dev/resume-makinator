import type { TemplateId } from "@/entities/resume/types"

type TemplateOption = {
    name: string
    value: TemplateId
}

export const TEMPLATE_OPTIONS: TemplateOption[] = [
    { name: "Simple Whitepaper", value: "whitepaper" },
    { name: "Classic", value: "classic" },
]

export const DEFAULT_TEMPLATE_ID: TemplateId = TEMPLATE_OPTIONS[0].value

export const isTemplateId = (value: string): value is TemplateId =>
    TEMPLATE_OPTIONS.some((option) => option.value === value)
export const normalizeTemplateId = (value: string): TemplateId =>
    isTemplateId(value) ? value : DEFAULT_TEMPLATE_ID

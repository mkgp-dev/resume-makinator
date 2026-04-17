import { useConfigurationHook } from "@/features/editor/hooks/useConfiguration"
import Checkbox from "@/shared/ui/Checkbox"
import Input from "@/shared/ui/Input"
import Select from "@/shared/ui/Select"
import { templateOptions } from "@/features/viewer/templates"
import { normalizeTemplateId } from "@/entities/resume/validation/template"
import { useEffect } from "react"
import type { Configuration } from "@/entities/resume/types"

const TEMPLATE_CAPABILITIES = {
    whitepaper: {
        picture: true,
        bullets: true,
        inlineInformation: true,
        accentColor: false,
    },
    classic: {
        picture: true,
        bullets: true,
        inlineInformation: true,
        accentColor: false,
    },
    modern: {
        picture: true,
        bullets: true,
        inlineInformation: false,
        accentColor: true,
    },
    "modern-alt": {
        picture: true,
        bullets: true,
        inlineInformation: false,
        accentColor: true,
    },
} as const

export default function TemplatePanel() {
    const { config, template, updateConfig, amendTemplate, updateTemplateNumber } = useConfigurationHook()
    const templates = templateOptions
    const activeTemplateId = normalizeTemplateId(config.template)
    const activeTemplate = template[activeTemplateId] || template.whitepaper
    const capabilities = TEMPLATE_CAPABILITIES[activeTemplateId]
    const supportsInlineInformation = activeTemplateId === "whitepaper" || activeTemplateId === "classic"
    const inlineTemplate = supportsInlineInformation ? template[activeTemplateId] : null
    const colorField = activeTemplateId === "modern"
        ? {
            label: "Accent color",
            value: template.modern.accentColor,
            onChange: (value: string) => amendTemplate("modern", "accentColor", value),
        }
        : activeTemplateId === "modern-alt"
            ? {
                label: "Banner color",
                value: template["modern-alt"].bannerColor,
                onChange: (value: string) => amendTemplate("modern-alt", "bannerColor", value),
            }
            : null

    useEffect(() => {
        if (activeTemplateId !== config.template) {
            updateConfig("template", activeTemplateId)
        }
    }, [activeTemplateId, config.template, updateConfig])

    return (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 xl:gap-5">
            <div className="flex flex-col gap-3">
                <Select
                    label="Select your theme"
                    value={activeTemplateId}
                    options={templates}
                    onChange={value => updateConfig("template", value as Configuration["template"])}
                />

                <div className="space-y-2">
                    {activeTemplate && (
                        <>
                            {capabilities.picture ? (
                                <Checkbox
                                    label="Enable profile picture"
                                    isChecked={activeTemplate.enablePicture}
                                    variant="framed"
                                    onChange={event => amendTemplate(activeTemplateId, "enablePicture", event.target.checked)}
                                />
                            ) : null}

                            {capabilities.bullets ? (
                                <Checkbox
                                    label="Enable bullets"
                                    isChecked={activeTemplate.bulletText}
                                    variant="framed"
                                    onChange={event => amendTemplate(activeTemplateId, "bulletText", event.target.checked)}
                                />
                            ) : null}

                            {capabilities.inlineInformation ? (
                                <Checkbox
                                    label="Inline information"
                                    isChecked={inlineTemplate?.inlineInformation}
                                    variant="framed"
                                    onChange={event => {
                                        if (!supportsInlineInformation) return
                                        amendTemplate(activeTemplateId, "inlineInformation", event.target.checked)
                                    }}
                                />
                            ) : null}
                        </>
                    )}
                </div>
            </div>

            <div className="flex flex-col">
                {activeTemplate && (
                    <div className="space-y-3">
                        <Input
                            label="Component spacing"
                            value={activeTemplate.blockSpace}
                            placeholder="12 is recommended"
                            onChange={event => updateTemplateNumber(activeTemplateId, "blockSpace", event.target.value)}
                            isStretch={true}
                        />

                        {capabilities.picture ? (
                            <Input
                                label="Profile picture size"
                                value={activeTemplate.pictureSize}
                                placeholder="100 is 1x1"
                                onChange={event => updateTemplateNumber(activeTemplateId, "pictureSize", event.target.value)}
                                isStretch={true}
                                isDisabled={!activeTemplate.enablePicture}
                            />
                        ) : null}

                        {capabilities.accentColor && colorField ? (
                            <fieldset className="fieldset">
                                <label className="fieldset-legend text-xs font-medium uppercase tracking-[0.18em] text-slate-400" htmlFor="template-color">
                                    {colorField.label}
                                </label>
                                <div className="flex flex-wrap items-center gap-3 rounded-[0.35rem] border border-base-300 bg-base-200/65 px-3 py-3">
                                    <input
                                        id="template-color"
                                        type="color"
                                        aria-label={colorField.label}
                                        value={colorField.value}
                                        onChange={event => colorField.onChange(event.target.value)}
                                        className="h-10 w-14 shrink-0 cursor-pointer rounded-[0.25rem] border border-base-300 bg-transparent p-1"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Selected</div>
                                        <div className="font-mono text-sm text-slate-100">{colorField.value}</div>
                                    </div>
                                    <div
                                        aria-hidden="true"
                                        className="size-6 shrink-0 rounded-full border border-slate-400"
                                        style={{ backgroundColor: colorField.value }}
                                    />
                                </div>
                            </fieldset>
                        ) : null}
                    </div>
                )}
            </div>

        </div>
    )
}

import { useConfigurationHook } from "@/features/editor/hooks/useConfiguration"
import Checkbox from "@/shared/ui/Checkbox"
import Input from "@/shared/ui/Input"
import Select from "@/shared/ui/Select"
import { templateOptions } from "@/features/viewer/templates"
import { normalizeTemplateId } from "@/entities/resume/validation/template"
import { useEffect } from "react"
import type { Configuration } from "@/entities/resume/types"

export default function TemplatePanel() {
    const { config, template, updateConfig, amendTemplate, updateTemplateNumber } = useConfigurationHook()
    const templates = templateOptions
    const activeTemplateId = normalizeTemplateId(config.template)
    const activeTemplate = template[activeTemplateId] || template.whitepaper
    const supportsPicture = activeTemplateId === "whitepaper"
    const supportsInlineInformation = activeTemplateId === "whitepaper"

    useEffect(() => {
        if (activeTemplateId !== config.template) {
            updateConfig("template", activeTemplateId)
        }
    }, [activeTemplateId, config.template, updateConfig])

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4">
            <div className="flex flex-col">
                <Select
                    label="Select your theme"
                    value={activeTemplateId}
                    options={templates}
                    onChange={value => updateConfig("template", value as Configuration["template"])}
                />

                <div className="mt-1">
                    {activeTemplate && (
                        <>
                            {supportsPicture && (
                                <Checkbox
                                    label="Enable profile picture"
                                    isChecked={activeTemplate.enablePicture}
                                    onChange={event => amendTemplate(activeTemplateId, "enablePicture", event.target.checked)}
                                />
                            )}

                            <Checkbox
                                label="Enable bullets"
                                isChecked={activeTemplate.bulletText}
                                onChange={event => amendTemplate(activeTemplateId, "bulletText", event.target.checked)}
                            />

                            {supportsInlineInformation && (
                                <Checkbox
                                    label="Inline information"
                                    isChecked={activeTemplate.inlineInformation}
                                    onChange={event => amendTemplate(activeTemplateId, "inlineInformation", event.target.checked)}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>

            <div className="flex flex-col">
                {activeTemplate && (
                    <>
                        <Input
                            label="Component spacing"
                            value={activeTemplate.blockSpace}
                            placeholder="12 is recommended"
                            onChange={event => updateTemplateNumber(activeTemplateId, "blockSpace", event.target.value)}
                            isStretch={true}
                        />

                        {supportsPicture && (
                            <Input
                                label="Profile picture size"
                                value={activeTemplate.pictureSize}
                                placeholder="100 is 1x1"
                                onChange={event => updateTemplateNumber(activeTemplateId, "pictureSize", event.target.value)}
                                isStretch={true}
                                isDisabled={!activeTemplate.enablePicture}
                            />
                        )}
                    </>
                )}
            </div>

        </div>
    )
}

import { useConfigurationHook } from "@/features/editor/hooks/useConfiguration"
import Input from "@/shared/ui/Input"
import Select from "@/shared/ui/Select"
import WhitepaperSectionOrder from "@/features/editor/panels/WhitepaperSectionOrder"
import { normalizeTemplateId } from "@/entities/resume/validation/template"
import type { Configuration } from "@/entities/resume/types"

export default function PagePanel() {
    const { config, modify, updateNumberConfig } = useConfigurationHook()
    const activeTemplateId = normalizeTemplateId(config.template)

    const pageSize = [
        { name: "A4", value: "A4" },
        { name: "Letter", value: "LETTER" },
    ]

    const fontStyle = [
        { name: "Lora", value: "Lora" },
        { name: "Playfair Display", value: "Playfair-Display" },
        { name: "Helvetica", value: "Helvetica" },
        { name: "Montserrat", value: "Montserrat" },
    ]

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col">
                <Select
                    label="Paper size"
                    value={config.pageSize}
                    options={pageSize}
                    onChange={value => modify("pageSize", value as Configuration["pageSize"])}
                />

                <Select
                    label="Font style"
                    value={config.fontStyle}
                    options={fontStyle}
                    onChange={value => modify("fontStyle", value as Configuration["fontStyle"])}
                />

                <Input
                    type="number"
                    label="Font size"
                    value={config.fontSize}
                    placeholder="11 is recommended"
                    onChange={event => updateNumberConfig("fontSize", event.target.value)}
                    isStretch={true}
                />
            </div>

            <div className="flex flex-col">
                {activeTemplateId === "whitepaper" ? <WhitepaperSectionOrder /> : null}
            </div>
        </div>
    )
}

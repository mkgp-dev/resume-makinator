import type { ChangeEvent } from "react"
import type { Configuration, TemplateConfig } from "@/entities/resume/types"
import { useInterfaceStore } from "@/shared/store/useInterfaceStore"
import { useResumeStore } from "@/entities/resume/store/useResumeStore"
import { MAX_IMPORT_SIZE_BYTES, isJsonFile, validateImportData } from "@/entities/resume/validation/import"

type NumberConfigKey = {
    [K in keyof Configuration]: Configuration[K] extends number ? K : never
}[keyof Configuration]

type TemplateNumberKey<K extends keyof TemplateConfig> = {
    [Key in keyof TemplateConfig[K]]: TemplateConfig[K][Key] extends number ? Key : never
}[keyof TemplateConfig[K]]

export function useConfigurationHook() {
    const toNumber = (value: unknown) => {
        if (typeof value === "number") return value
        if (typeof value === "string" && value.trim()) return Number(value)
        return NaN
    }

    const toPositiveNumber = (value: unknown, fallback: number) => {
        const parsed = toNumber(value)
        return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
    }

    const set = useResumeStore(state => state.setData)
    const status = useInterfaceStore(state => state.dataStatus)
    const update = useInterfaceStore(state => state.updateStatus)
    const config = useResumeStore(state => state.configuration)
    const modify = useResumeStore(state => state.updateConfig)
    const render = useResumeStore(state => state.enableInRender)
    const toggle = useResumeStore(state => state.toggleRender)
    const template = useResumeStore(state => state.template)
    const ammend = useResumeStore(state => state.updateTemplate)
    const reset = useResumeStore(state => state.resetData)

    const updateNumberConfig = (key: NumberConfigKey, value: unknown) =>
        modify(key, toPositiveNumber(value, config[key]))
    const updateTemplateNumber = <K extends keyof TemplateConfig>(
        section: K,
        key: TemplateNumberKey<K>,
        value: unknown
    ) => {
        const fallback = template[section][key] as number
        const next = toPositiveNumber(value, fallback)
        ammend(section, key, next as TemplateConfig[K][TemplateNumberKey<K>])
    }

    const getData = () => {
        const {
            activePage,
            personalDetails,
            education,
            references,
            softSkills,
            coreSkills,
            workExperiences,
            personalProjects,
            certificates,
            achievements,
            configuration,
            enableInRender,
        } = useResumeStore.getState()

        return {
            activePage,
            personalDetails,
            education,
            references,
            softSkills,
            coreSkills,
            workExperiences,
            personalProjects,
            certificates,
            achievements,
            configuration,
            enableInRender,
        }
    }

    const exportData = () => {
        const data = getData()
        const timestamp = Math.floor(Date.now() / 1000)
        const fileName = `resume-data-${timestamp}.json`

        const file = new Blob([JSON.stringify(data, null, 2)], {
            type: "application/json",
        })
        const url = URL.createObjectURL(file)

        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        a.click()

        URL.revokeObjectURL(url)
    }

    const importData = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return
        if (!isJsonFile(file) || file.size > MAX_IMPORT_SIZE_BYTES) return update(false)

        const reader = new FileReader()
        reader.onload = (e: ProgressEvent<FileReader>) => {
            try {
                const json = JSON.parse(e.target?.result as string)
                const sanitized = validateImportData(json)

                if (!sanitized) return update(false)

                set(sanitized)
                update(true)
            } catch {
                update(false)
            }
        }
        reader.readAsText(file)
    }

    return {
        status,
        config,
        render,
        template,
        update,
        modify,
        ammend,
        toggle,
        reset,
        importData,
        exportData,
        updateNumberConfig,
        updateTemplateNumber,
    }
}

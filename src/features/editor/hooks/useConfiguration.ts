import { useState, type ChangeEvent } from "react"
import type { Configuration, TemplateConfig } from "@/entities/resume/types"
import { useInterfaceStore } from "@/shared/store/useInterfaceStore"
import { useResumeStore } from "@/entities/resume/store/useResumeStore"
import { createResumeImportData } from "@/entities/resume/lib/importExport"
import { MAX_IMPORT_SIZE_BYTES, isJsonFile, validateImportData } from "@/entities/resume/validation/import"
import { useShallow } from "zustand/react/shallow"

type NumberConfigKey = {
    [K in keyof Configuration]: Configuration[K] extends number ? K : never
}[keyof Configuration]

type TemplateNumberKey<K extends keyof TemplateConfig> = {
    [Key in keyof TemplateConfig[K]]: TemplateConfig[K][Key] extends number ? Key : never
}[keyof TemplateConfig[K]]

const hasText = (value: unknown) => typeof value === "string" && value.trim().length > 0

const hasExistingResumeContent = () => {
    const state = useResumeStore.getState()
    const details = state.personalDetails

    return (
        hasText(details.fullName) ||
        hasText(details.jobTitle) ||
        hasText(details.defaultAddress) ||
        hasText(details.defaultEmail) ||
        hasText(details.defaultPhoneNumber) ||
        hasText(details.socialGithub) ||
        hasText(details.socialLinkedin) ||
        hasText(details.summary) ||
        hasText(details.profilePicture) ||
        details.knownLanguages.length > 0 ||
        state.education.length > 0 ||
        state.references.length > 0 ||
        state.softSkills.length > 0 ||
        state.coreSkills.length > 0 ||
        state.workExperiences.length > 0 ||
        state.personalProjects.length > 0 ||
        state.certificates.length > 0 ||
        state.achievements.length > 0
    )
}

export function useConfigurationHook() {
    const [isImporting, setIsImporting] = useState(false)
    const [pendingImportFile, setPendingImportFile] = useState<File | null>(null)
    const toNumber = (value: unknown) => {
        if (typeof value === "number") return value
        if (typeof value === "string" && value.trim()) return Number(value)
        return NaN
    }

    const toPositiveNumber = (value: unknown, fallback: number) => {
        const parsed = toNumber(value)
        return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
    }

    const {
        setData,
        config,
        updateConfig,
        render,
        toggle,
        template,
        amendTemplate,
        reset,
    } = useResumeStore(useShallow((state) => ({
        setData: state.setData,
        config: state.configuration,
        updateConfig: state.updateConfig,
        render: state.enableInRender,
        toggle: state.toggleRender,
        template: state.template,
        amendTemplate: state.updateTemplate,
        reset: state.resetData,
    })))

    const { dataStatus, setDataStatus } = useInterfaceStore(useShallow((state) => ({
        dataStatus: state.dataStatus,
        setDataStatus: state.updateStatus,
    })))

    const updateNumberConfig = (key: NumberConfigKey, value: unknown) =>
        updateConfig(key, toPositiveNumber(value, config[key]))
    const updateTemplateNumber = <K extends keyof TemplateConfig>(
        section: K,
        key: TemplateNumberKey<K>,
        value: unknown
    ) => {
        const fallback = template[section][key] as number
        const next = toPositiveNumber(value, fallback)
        amendTemplate(section, key, next as TemplateConfig[K][TemplateNumberKey<K>])
    }

    const exportData = () => {
        const data = createResumeImportData(useResumeStore.getState())
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

    const readImportFile = (file: File) => {
        setIsImporting(true)
        if (!isJsonFile(file) || file.size > MAX_IMPORT_SIZE_BYTES) {
            setDataStatus(false)
            setIsImporting(false)
            setPendingImportFile(null)
            return
        }

        const reader = new FileReader()
        reader.onload = (e: ProgressEvent<FileReader>) => {
            try {
                const json = JSON.parse(e.target?.result as string)
                const sanitized = validateImportData(json)

                if (!sanitized) {
                    setDataStatus(false)
                    return
                }

                setData(sanitized)
                setDataStatus(true)
            } catch {
                setDataStatus(false)
            } finally {
                setIsImporting(false)
                setPendingImportFile(null)
            }
        }
        reader.onerror = () => {
            setDataStatus(false)
            setIsImporting(false)
            setPendingImportFile(null)
        }
        reader.readAsText(file)
    }

    const importData = (event: ChangeEvent<HTMLInputElement>) => {
        const input = event.target
        const file = event.target.files?.[0]
        if (!file) return
        input.value = ""

        if (hasExistingResumeContent()) {
            setPendingImportFile(file)
            return
        }

        readImportFile(file)
    }

    const confirmImportData = () => {
        if (!pendingImportFile) return
        readImportFile(pendingImportFile)
    }

    const cancelImportData = () => {
        setPendingImportFile(null)
    }

    return {
        dataStatus,
        config,
        render,
        template,
        setDataStatus,
        updateConfig,
        amendTemplate,
        toggle,
        reset,
        importData,
        exportData,
        isImporting,
        hasPendingImport: pendingImportFile !== null,
        confirmImportData,
        cancelImportData,
        updateNumberConfig,
        updateTemplateNumber,
    }
}

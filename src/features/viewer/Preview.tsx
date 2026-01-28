import { useResumeStore } from "@/entities/resume/store/useResumeStore"
import { useState, useEffect } from "react"
import { useDebounce } from "use-debounce"
import { InformationCircleIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline"
import Button from "@/shared/ui/Button"
import { useShallow } from "zustand/shallow"
import type { ResumeStore } from "@/entities/resume/store/useResumeStore"
import type { ResumePreviewData } from "@/entities/resume/types"

const DEBOUNCE_MS = 300

const previewDataSelector = (state: ResumeStore): ResumePreviewData => ({
    personalDetails: state.personalDetails,
    education: state.education,
    references: state.references,
    softSkills: state.softSkills,
    coreSkills: state.coreSkills,
    workExperiences: state.workExperiences,
    personalProjects: state.personalProjects,
    certificates: state.certificates,
    achievements: state.achievements,
    configuration: state.configuration,
    enableInRender: state.enableInRender,
    template: state.template,
})

export default function Preview() {
    const previewData = useResumeStore(useShallow(previewDataSelector))
    const [debouncedData] = useDebounce(previewData, DEBOUNCE_MS)
    const [pdfUrl, setPdfUrl] = useState<string | null>(null)

    useEffect(() => {
        if (!debouncedData) return

        let cancelled = false
        let objectUrl: string | undefined

        const generateDocument = async () => {
            try {
                await import("@/features/viewer/components/fonts/FontRegister")
                const [{ pdf }, { default: Render }] = await Promise.all([
                    import("@react-pdf/renderer"),
                    import("@/features/viewer/Render"),
                ])
                if (cancelled) return

                const blob = await pdf(<Render data={debouncedData} />).toBlob()
                if (cancelled) return

                objectUrl = URL.createObjectURL(blob)
                setPdfUrl(objectUrl)
            } catch (error) {
                console.error("An error has occurred", error)
            }
        }

        generateDocument()

        return () => {
            cancelled = true
            if (objectUrl) URL.revokeObjectURL(objectUrl)
        }
    }, [debouncedData])

    const src = pdfUrl ? `${pdfUrl}#view=Fit` : undefined

    return (
        <>
            <div className="hidden h-full md:block">
                <iframe
                    src={src}
                    title="Resume Preview"
                    className="h-full w-full border-0"
                />
            </div>

            <div className="space-y-2 p-4 md:hidden">
                <div className="flex items-start gap-2 text-slate-500">
                    <InformationCircleIcon className="size-6 shrink-0" />
                    <p className="text-sm">PDF preview is limited on mobile devices. Tap the button below to open your resume in a new tab.</p>
                </div>
                <Button
                    text="Preview"
                    icon={<ArrowTopRightOnSquareIcon className="size-5" />}
                    onClick={() => {
                        if (!pdfUrl) return
                        window.open(pdfUrl, "_blank", "noopener,noreferrer")
                    }}
                    alignCenter={true}
                    isStretch={true}
                />
            </div>
        </>
    )
}

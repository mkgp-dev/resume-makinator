import { useResumeStore } from "@/entities/resume/store/useResumeStore"
import { useState, useEffect, useRef } from "react"
import { useDebounce } from "use-debounce"
import { InformationCircleIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline"
import Button from "@/shared/ui/Button"
import { useShallow } from "zustand/react/shallow"
import type { ResumeStore } from "@/entities/resume/store/useResumeStore"
import type { ResumePreviewData } from "@/entities/resume/types"

const DEBOUNCE_MS = 300
const DESKTOP_MEDIA_QUERY = "(min-width: 768px)"

const loadPdfModules = async () => {
    await import("@/features/viewer/components/fonts/FontRegister")

    const [{ pdf }, { default: Render }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/features/viewer/Render"),
    ])

    return { pdf, Render }
}

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
    const [isDesktopPreview, setIsDesktopPreview] = useState<boolean>(() =>
        typeof window !== "undefined" ? window.matchMedia(DESKTOP_MEDIA_QUERY).matches : true
    )
    const [isGenerating, setIsGenerating] = useState(false)
    const [hasFailed, setHasFailed] = useState(false)
    const requestIdRef = useRef(0)
    const pdfUrlRef = useRef<string | null>(null)

    useEffect(() => {
        const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY)
        const syncViewport = () => setIsDesktopPreview(mediaQuery.matches)

        syncViewport()
        mediaQuery.addEventListener("change", syncViewport)

        return () => {
            mediaQuery.removeEventListener("change", syncViewport)
        }
    }, [])

    useEffect(() => {
        pdfUrlRef.current = pdfUrl
    }, [pdfUrl])

    useEffect(() => {
        return () => {
            requestIdRef.current += 1
            if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current)
        }
    }, [])

    const generateDocument = async (data: ResumePreviewData) => {
        const requestId = ++requestIdRef.current
        setIsGenerating(true)
        setHasFailed(false)

        try {
            const { pdf, Render } = await loadPdfModules()
            const blob = await pdf(<Render data={data} />).toBlob()
            const nextObjectUrl = URL.createObjectURL(blob)

            if (requestId !== requestIdRef.current) {
                URL.revokeObjectURL(nextObjectUrl)
                return null
            }

            setPdfUrl((currentUrl) => {
                if (currentUrl) URL.revokeObjectURL(currentUrl)
                return nextObjectUrl
            })

            return nextObjectUrl
        } catch (error) {
            if (requestId === requestIdRef.current) setHasFailed(true)
            console.error("An error has occurred", error)
            return null
        } finally {
            if (requestId === requestIdRef.current) setIsGenerating(false)
        }
    }

    useEffect(() => {
        if (!isDesktopPreview) return
        void generateDocument(debouncedData)
    }, [debouncedData, isDesktopPreview])

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
                    <p className="text-sm">
                        PDF preview is limited on mobile devices. Generate once, then open in a new tab.
                    </p>
                </div>
                {hasFailed ? (
                    <p className="text-sm text-error">Preview generation failed. Please try again.</p>
                ) : null}
                <Button
                    text={
                        isGenerating
                            ? "Generating preview..."
                            : pdfUrl
                                ? "Open preview"
                                : "Generate preview"
                    }
                    icon={<ArrowTopRightOnSquareIcon className="size-5" />}
                    onClick={() => {
                        if (isGenerating) return
                        if (!pdfUrl) {
                            void generateDocument(previewData)
                            return
                        }
                        window.open(pdfUrl, "_blank", "noopener,noreferrer")
                    }}
                    alignCenter={true}
                    isStretch={true}
                    isDisabled={isGenerating}
                />
            </div>
        </>
    )
}

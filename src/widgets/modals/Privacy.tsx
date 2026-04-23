import { useEffect, useRef } from "react"
import type { FormEvent } from "react"
import { useResumeStore } from "@/entities/resume/store/useResumeStore"
import Modal from "@/shared/ui/Modal"
import Button from "@/shared/ui/Button"

export default function PrivacyModal() {
    const dialogRef = useRef<HTMLDialogElement | null>(null)

    const hydrate = useResumeStore(state => state.hasHydrated)
    const page = useResumeStore(state => state.activePage)
    const privacy = useResumeStore(state => state.hasAcknowledgedPrivacy)
    const set = useResumeStore(state => state.setPrivacy)

    useEffect(() => {
        if (!privacy && dialogRef.current && (hydrate || page)) dialogRef.current.showModal()
    }, [hydrate, privacy, page])

    const handleCancel = (event: FormEvent<HTMLDialogElement>) => event.preventDefault()

    const handleAcknowledge = () => {
        set()
        dialogRef.current?.close()
    }

    return (
        <Modal
            ref={dialogRef}
            size="md"
            content={(
                <>
                    <h3 className="text-lg font-manrope font-bold">Privacy & Security Notice</h3>
                    <div className="space-y-3 py-4">
                        <p className="text-sm leading-relaxed">
                            I do not <span className="font-medium text-primary">store</span> your resume information on my server. Your resume data is kept locally in your browser’s storage, so your information stays on your device and under your control. This design greatly reduces the risk of data exposure from my side, because there is no central database for anyone to hack or leak.
                        </p>

                        <p className="text-sm leading-relaxed">
                            If you use the <span className="font-medium text-primary">Chat Assistant</span>, only the needed resume context is sent to the AI service so it can generate a better response. This app does not store that AI request data on my server.
                        </p>

                        <p className="text-sm leading-relaxed">
                            However, <span className="font-medium text-primary">local storage is still part of your browser</span>, which means your data can be at risk if:
                        </p>

                        <ul className="text-sm leading-relaxed list-disc space-y-1 pl-5">
                            <li>Your device is infected with malware (especially <span className="font-medium text-primary">browser-stealer</span> tools that can grab saved data, cookies, autofill info, or local storage).</li>
                            <li>You use this tool on a shared or public computer.</li>
                            <li>You install untrusted browser extensions that can read or modify page data.</li>
                        </ul>

                        <p className="text-sm leading-relaxed">
                            Please keep your device and browser secure.
                        </p>

                        <ul className="text-sm leading-relaxed list-disc space-y-1 pl-5">
                            <li>Use a trusted, up-to-date browser.</li>
                            <li>Avoid untrusted extensions or software.</li>
                            <li>Don’t use this tool on public or shared machines if your data is sensitive.</li>
                        </ul>
                    </div>
                </>
            )}
            actions={(
                <Button text="I understand" onClick={handleAcknowledge} />
            )}
            onCancel={handleCancel}
        />
    )
}

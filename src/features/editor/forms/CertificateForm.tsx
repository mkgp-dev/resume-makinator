import { useCertificateHook } from "@/features/editor/hooks/useCertificate"
import Input from "@/shared/ui/Input"
import Textarea from "@/shared/ui/Textarea"
import type { CertificateItem } from "@/entities/resume/types"

type CertificateFormProps = {
    item: CertificateItem
}

export default function CertificateForm({ item }: CertificateFormProps) {
    const { modify } = useCertificateHook()

    return (
        <div className="flex flex-col">
            <Input
                label="Name"
                value={item.certificateName}
                placeholder="CS50x: Introduction to Computer Science"
                onChange={event => modify("certificates", item.id, { certificateName: event.target.value })}
                isStretch={true}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4">
                <Input
                    label="Institution"
                    value={item.certificateIssuer}
                    placeholder="Harvard University"
                    onChange={event => modify("certificates", item.id, { certificateIssuer: event.target.value })}
                    isStretch={true}
                />

                <Input
                    label="Year issued"
                    value={item.yearIssued}
                    placeholder="January 2025"
                    onChange={event => modify("certificates", item.id, { yearIssued: event.target.value })}
                    isStretch={true}
                />
            </div>

            <div className="mb-1">
                <Textarea
                    label="Description"
                    rows={4}
                    value={item.certificateDescription}
                    placeholder="Completed coursework in algorithms, data structures, and programming in C, Python, and SQL."
                    onChange={event => modify("certificates", item.id, { certificateDescription: event.target.value })}
                    isStretch={true}
                />
            </div>
        </div>
    )
}

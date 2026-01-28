import { useBackgroundHook } from "@/features/editor/hooks/useBackground"
import Input from "@/shared/ui/Input"
import type { ReferenceItem } from "@/entities/resume/types"

type ReferenceFormProps = {
    item: ReferenceItem
}

export default function ReferenceForm({ item }: ReferenceFormProps) {
    const { modify } = useBackgroundHook()

    return (
        <div className="flex flex-col">
            <Input
                label="Name"
                value={item.fullName}
                placeholder="John Doe"
                onChange={event => modify("references", item.id, { fullName: event.target.value })}
                isStretch={true}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4">
                <Input
                    label="Position"
                    value={item.jobTitle}
                    placeholder="Senior Software Engineer"
                    onChange={event => modify("references", item.id, { jobTitle: event.target.value })}
                    isStretch={true}
                />

                <Input
                    label="Company"
                    value={item.companyName}
                    placeholder="Google"
                    onChange={event => modify("references", item.id, { companyName: event.target.value })}
                    isStretch={true}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4 mb-1">
                <Input
                    label="Email"
                    value={item.defaultEmail}
                    placeholder="john.doe@example.com"
                    onChange={event => modify("references", item.id, { defaultEmail: event.target.value })}
                    isStretch={true}
                />

                <Input
                    type="number"
                    label="Phone number"
                    value={item.defaultPhoneNumber}
                    placeholder="639123456789"
                    onChange={event => modify("references", item.id, { defaultPhoneNumber: event.target.value })}
                    isStretch={true}
                />
            </div>
        </div>
    )
}

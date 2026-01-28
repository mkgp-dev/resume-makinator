import { useBackgroundHook } from "@/features/editor/hooks/useBackground"
import Checkbox from "@/shared/ui/Checkbox"
import Input from "@/shared/ui/Input"
import type { EducationItem } from "@/entities/resume/types"

type EducationFormProps = {
    item: EducationItem
}

export default function EducationForm({ item }: EducationFormProps) {
    const { modify } = useBackgroundHook()

    return (
        <div className="flex flex-col">
            <Input
                label="Degree"
                value={item.courseDegree}
                placeholder="Bachelor of Science in Computer Science"
                onChange={event => modify("education", item.id, { courseDegree: event.target.value })}
                isStretch={true}
            />

            <Input
                label="School name"
                value={item.schoolName}
                placeholder="Harvard University"
                onChange={event => modify("education", item.id, { schoolName: event.target.value })}
                isStretch={true}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4">
                <Input
                    label="Year started"
                    value={item.startYear}
                    placeholder="June 2018"
                    onChange={event => modify("education", item.id, { startYear: event.target.value })}
                    isStretch={true}
                />
                <div className="flex flex-col">
                    <Input
                        label="Year ended"
                        value={item.endYear}
                        placeholder="October 2021"
                        onChange={event => modify("education", item.id, { endYear: event.target.value })}
                        isStretch={true}
                        isDisabled={item.currentEnrolled}
                    />

                    <Checkbox
                        label="Present"
                        isChecked={item.currentEnrolled}
                        onChange={event => modify("education", item.id, { currentEnrolled: event.target.checked, endYear: event.target.checked ? "Present" : "" })}
                    />
                </div>
            </div>
        </div>
    )
}

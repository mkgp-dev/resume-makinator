import { useExperienceHook } from "@/features/editor/hooks/useExperience"
import Input from "@/shared/ui/Input"
import MultiSelect from "@/features/multiselect/MultiSelect"
import Textarea from "@/shared/ui/Textarea"
import type { ProjectItem } from "@/entities/resume/types"

type ProjectFormProps = {
    item: ProjectItem
}

export default function ProjectForm({ item }: ProjectFormProps) {
    const { modify } = useExperienceHook()

    return (
        <div className="flex flex-col">
            <Input
                label="Project name"
                value={item.projectName}
                placeholder="Resume Makinator"
                onChange={event => modify("personalProjects", item.id, { projectName: event.target.value })}
                isStretch={true}
            />

            <MultiSelect
                label="Framework"
                mode="framework"
                value={item.projectFrameworks}
                placeholder="React"
                onChange={value => modify("personalProjects", item.id, { projectFrameworks: value })}
                allowMultiple={false}
            />

            <div className="mb-1">
                <Textarea
                    label="Description"
                    rows={4}
                    value={item.projectDescription}
                    placeholder="A brief description of your project"
                    onChange={event => modify("personalProjects", item.id, { projectDescription: event.target.value })}
                    isStretch={true}
                />
            </div>
        </div>
    )
}

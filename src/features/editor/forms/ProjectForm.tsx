import { useExperienceHook } from "@/features/editor/hooks/useExperience"
import Input from "@/shared/ui/Input"
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

            <Input
                label="Source code (optional)"
                value={item.sourceCode}
                placeholder="https://github.com/username/project"
                onChange={event => modify("personalProjects", item.id, { sourceCode: event.target.value })}
                isStretch={true}
            />

            <Input
                label="Preview (optional)"
                value={item.preview}
                placeholder="https://project-demo.com"
                onChange={event => modify("personalProjects", item.id, { preview: event.target.value })}
                isStretch={true}
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

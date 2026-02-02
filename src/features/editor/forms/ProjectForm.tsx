import { useExperienceHook } from "@/features/editor/hooks/useExperience"
import BulletList from "@/shared/ui/Bullet"
import Checkbox from "@/shared/ui/Checkbox"
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
            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4 items-start">
                <Input
                    label="Project name"
                    value={item.projectName}
                    placeholder="Resume Makinator"
                    onChange={event => modify("personalProjects", item.id, { projectName: event.target.value })}
                    isStretch={true}
                />
                <Input
                    label="Project subtitle"
                    value={item.projectSubtitle}
                    placeholder="Modern resume builder"
                    onChange={event => modify("personalProjects", item.id, { projectSubtitle: event.target.value })}
                    isStretch={true}
                />
            </div>

            <Input
                label="Preview link (optional)"
                value={item.preview}
                placeholder="https://project-demo.com"
                onChange={event => modify("personalProjects", item.id, { preview: event.target.value })}
                isStretch={true}
            />

            <div className="mt-1">
                <Checkbox
                    label="Use bullet points"
                    isChecked={item.bulletType}
                    onChange={event => modify("personalProjects", item.id, { bulletType: event.target.checked })}
                />
            </div>
            {!item.bulletType ? (
                <Textarea
                    label="Brief summary"
                    rows={4}
                    value={item.briefSummary}
                    placeholder="A brief description of your project"
                    onChange={event => modify("personalProjects", item.id, { briefSummary: event.target.value })}
                    isStretch={true}
                />
            ) : (
                <BulletList
                    items={item.bulletSummary}
                    onChange={bulletSummary => modify("personalProjects", item.id, { bulletSummary })}
                    placeholder="List of your project's highlights"
                />
            )}
        </div>
    )
}

import { useExperienceHook } from "@/features/editor/hooks/useExperience"
import ProjectForm from "@/features/editor/forms/ProjectForm"
import SortableList from "@/features/sortable/List"

export default function Project() {
    const { newProject } = useExperienceHook()

    return (
        <SortableList
            header="Personal Project"
            section="personalProjects"
            renderItem={item => <ProjectForm item={item} />}
            onClick={newProject}
        />
    )
}
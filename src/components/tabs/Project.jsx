import { useExperienceStore } from "../../hooks/useExperienceStore";
import ProjectForm from "../forms/ProjectForm";
import SortableList from "../../features/sortable/List";

export default function Project() {
    const { newProject } = useExperienceStore();

    return (
        <SortableList
            header="Personal Project"
            section="personalProjects"
            renderItem={item => <ProjectForm item={item} />}
            onClick={newProject}
        />
    );
}
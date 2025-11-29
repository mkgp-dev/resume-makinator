import { useExperienceStore } from "../../hooks/useExperienceStore";
import SortableList from "../../features/sortable/List";
import WorkForm from "../forms/WorkForm";

export default function Work() {
    const { newWork } = useExperienceStore();

    return (
        <SortableList
            header="Work Experience"
            section="workExperiences"
            renderItem={item => <WorkForm item={item} />}
            onClick={newWork}
        />
    );
}
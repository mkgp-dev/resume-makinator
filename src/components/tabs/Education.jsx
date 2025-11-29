import { useBackgroundStore } from "../../hooks/useBackgroundStore";
import EducationForm from "../forms/EducationForm";
import SortableList from "../../features/sortable/List";

export default function Education() {
    const { newEducation } = useBackgroundStore();

    return (
        <>
            <SortableList
                header="Education"
                section="education"
                renderItem={item => <EducationForm item={item} />}
                onClick={newEducation}
            />
        </>
    );
}
import { useBackgroundHook } from "@/features/editor/hooks/useBackground"
import EducationForm from "@/features/editor/forms/EducationForm"
import SortableList from "@/features/sortable/List"

export default function Education() {
    const { newEducation } = useBackgroundHook()

    return (
        <SortableList
            header="Education"
            section="education"
            renderItem={item => <EducationForm item={item} />}
            getItemSummary={(item) => ({
                title: item.courseDegree || "Untitled education",
                subtitle: item.schoolName || undefined,
            })}
            onClick={newEducation}
        />
    )
}

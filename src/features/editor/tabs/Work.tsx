import { useExperienceHook } from "@/features/editor/hooks/useExperience"
import SortableList from "@/features/sortable/List"
import WorkForm from "@/features/editor/forms/WorkForm"

export default function Work() {
    const { newWork } = useExperienceHook()

    return (
        <SortableList
            header="Work Experience"
            section="workExperiences"
            renderItem={item => <WorkForm item={item} />}
            getItemSummary={(item) => ({
                title: item.jobTitle || "Untitled work experience",
                subtitle: item.companyName || undefined,
            })}
            onClick={newWork}
        />
    )
}

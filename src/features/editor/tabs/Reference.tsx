import { useBackgroundHook } from "@/features/editor/hooks/useBackground"
import ReferenceForm from "@/features/editor/forms/ReferenceForm"
import SortableList from "@/features/sortable/List"

export default function Reference() {
    const { newReference } = useBackgroundHook()

    return (
        <SortableList
            header="Reference"
            section="references"
            renderItem={item => <ReferenceForm item={item} />}
            getItemSummary={(item) => ({
                title: item.fullName || "Untitled reference",
                subtitle: item.companyName || item.jobTitle || undefined,
            })}
            onClick={newReference}
        />
    )
}

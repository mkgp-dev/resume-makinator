import { useBackgroundHook } from "@/hooks/useBackground";
import ReferenceForm from "@/features/editor/forms/ReferenceForm";
import SortableList from "@/features/sortable/List";

export default function Reference() {
    const { newReference } = useBackgroundHook();

    return (
        <SortableList
            header="Reference"
            section="references"
            renderItem={item => <ReferenceForm item={item} />}
            onClick={newReference}
        />
    );
}
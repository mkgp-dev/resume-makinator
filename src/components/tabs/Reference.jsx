import { useBackgroundStore } from "../../hooks/useBackgroundStore";
import ReferenceForm from "../forms/ReferenceForm";
import SortableList from "../../features/sortable/List";

export default function Reference() {
    const { newReference } = useBackgroundStore();

    return (
        <SortableList
            header="Reference"
            section="references"
            renderItem={item => <ReferenceForm item={item} />}
            onClick={newReference}
        />
    );
}
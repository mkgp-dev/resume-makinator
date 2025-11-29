import { arrayMove } from "@dnd-kit/sortable";
import { useResumeStore } from "./useResumeStore";
import { useInterfaceStore } from "./useInterfaceStore";

export function useSortStore({ section }) {
    const items = useResumeStore(state => state[section]);
    const sort = useResumeStore(state => state.updateItemOrder);
    const remove = useResumeStore(state => state.removeItem);
    const id = useInterfaceStore(state => state.newItem);

    const handleDrag = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);

        const newOrder = arrayMove(items, oldIndex, newIndex);
        sort(section, newOrder);
    };

    return { id, items, remove, handleDrag };
}
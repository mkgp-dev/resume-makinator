import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortHook } from "@/hooks/useSort";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import Button from "@/components/ui/Button";
import SortableItem from "@/features/sortable/Item";


export default function SortableList({
    header,
    section,
    renderItem,
    onClick
}) {
    const { id, items, remove, handleDrag } = useSortHook({ section });
    const sensors = useSensors(useSensor(PointerSensor));

    return (
        <div className="space-y-3">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDrag}>
                <SortableContext items={items} strategy={verticalListSortingStrategy}>
                    <div className="flex items-center justify-between">
                        <h2 className="font-manrope text-2xl font-semibold">{header}</h2>
                        <Button variant="transparent" icon={<PlusCircleIcon className="size-8" />} iconOnly={true} onClick={onClick} />
                    </div>

                    {items.length === 0 ? (
                        <div className="skeleton rounded-md h-45 w-full animate-fade-in">
                            <div className="flex items-center justify-center h-full">
                                <span className="text-slate-500">Click the add button to make a list</span>
                            </div>
                        </div>
                    ) : (
                        items.map(item => (
                            <SortableItem key={item.id} id={item.id} onDelete={() => remove(section, item.id)} isFadeIn={item.id === id}>
                                {renderItem(item)}
                            </SortableItem>
                        ))
                    )}

                </SortableContext>
            </DndContext>
        </div>
    );
}
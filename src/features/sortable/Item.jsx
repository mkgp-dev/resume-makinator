import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Bars3Icon, TrashIcon } from "@heroicons/react/24/outline";
import Button from "../../components/ui/Button";
import clsx from "clsx";

export default function SortableItem({
    children,
    id,
    onDelete,
    isFadeIn,
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const styles = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={styles}
            className={clsx(
                "card flex flex-row px-2 py-1 gap-2 rounded-md bg-slate-700/90 border border-slate-600/70",
                isFadeIn && "animate-fade-in",
            )}
        >

            <div className="flex flex-col items-center gap-2 mt-2">
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab hover:text-sky-500 active:cursor-grabbing active:text-sky-500"
                >
                    <Bars3Icon className="size-5" />
                </div>

                <Button variant="dangerTransparent" icon={<TrashIcon className="size-5" />} iconOnly={true} onClick={onDelete} />
            </div>
            <div className="flex-1">
                {children}
            </div>

        </div>
    );
}
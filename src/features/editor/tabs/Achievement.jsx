import { useCertificateHook } from "@/hooks/useCertificate";
import AchievementForm from "@/features/editor/forms/AchievementForm";
import SortableList from "@/features/sortable/List";

export default function Achievement() {
    const { newAchievement } = useCertificateHook();

    return (
        <SortableList
            header="Achievement"
            section="achievements"
            renderItem={item => <AchievementForm item={item} />}
            onClick={newAchievement}
        />
    );
}
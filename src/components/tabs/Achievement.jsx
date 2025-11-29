import { useCertificateStore } from "../../hooks/useCertificateStore";
import AchievementForm from "../forms/AchievementForm";
import SortableList from "../../features/sortable/List";

export default function Achievement() {
    const { newAchievement } = useCertificateStore();

    return (
        <SortableList
            header="Achievement"
            section="achievements"
            renderItem={item => <AchievementForm item={item} />}
            onClick={newAchievement}
        />
    );
}
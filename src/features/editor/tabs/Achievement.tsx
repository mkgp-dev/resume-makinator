import { useCertificateHook } from "@/features/editor/hooks/useCertificate"
import AchievementForm from "@/features/editor/forms/AchievementForm"
import SortableList from "@/features/sortable/List"

export default function Achievement() {
    const { newAchievement } = useCertificateHook()

    return (
        <SortableList
            header="Achievement"
            section="achievements"
            renderItem={item => <AchievementForm item={item} />}
            getItemSummary={(item) => ({
                title: item.achievementName || "Untitled achievement",
                subtitle: item.achievementIssuer || undefined,
            })}
            onClick={newAchievement}
        />
    )
}

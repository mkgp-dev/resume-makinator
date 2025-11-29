import { nanoid } from "nanoid";
import { useResumeStore } from "./useResumeStore";
import { useInterfaceStore } from "./useInterfaceStore";
import { useCommonStore } from "./useCommonStore";

export function useSkillStore() {
    const { add, modify } = useCommonStore();
    const common = useResumeStore(state => state.softSkills);
    const update = useResumeStore(state => state.updateSkills);
    const refresh = useInterfaceStore(state => state.updateItem);

    const newCore = () => {
        const id = nanoid();
        add("coreSkills", {
            devLanguage: "",
            devFramework: [],
        });

        refresh(id);
    }

    return { common, update, modify, newCore };
}
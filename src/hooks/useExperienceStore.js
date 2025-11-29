import { nanoid } from "nanoid";
import { useInterfaceStore } from "./useInterfaceStore";
import { useCommonStore } from "./useCommonStore";

export function useExperienceStore() {
    const { add, modify } = useCommonStore();
    const refresh = useInterfaceStore(state => state.updateItem);

    const newWork = () => {
        const id = nanoid();
        add("workExperiences", {
            companyName: "",
            jobTitle: "",
            briefSummary: "",
            startYear: "",
            endYear: "",
            currentlyHired: false,
            bulletType: false,
            bulletSummary: [],
        });

        refresh(id);
    };

    const newProject = () => {
        const id = nanoid();
        add("personalProjects", {
            projectName: "",
            projectFrameworks: "",
            projectDescription: "",
        });

        refresh(id);
    };

    return { modify, newWork, newProject };
}
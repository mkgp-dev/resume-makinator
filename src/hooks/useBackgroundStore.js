import { nanoid } from "nanoid";
import { useInterfaceStore } from "./useInterfaceStore";
import { useResumeStore } from "./useResumeStore";
import { useCommonStore } from "./useCommonStore";

export function useBackgroundStore() {
    const { add, modify } = useCommonStore();
    const details = useResumeStore(state => state.personalDetails);
    const update = useResumeStore(state => state.updateDetails);
    const refresh = useInterfaceStore(state => state.updateItem);
    const config = useResumeStore(state => state.configuration);
    const template = useResumeStore(state => state.updateTemplate);

    const handleImage = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => update("profilePicture", reader.result);
        reader.readAsDataURL(file);

        template(config.template, "enablePicture", true);
    };

    const newEducation = () => {
        const id = nanoid();
        add("education", {
            id,
            schoolName: "",
            courseDegree: "",
            startYear: "",
            endYear: "",
            currentEnrolled: false,
        });

        refresh(id);
    };

    const newReference = () => {
        const id = nanoid();
        add("references", {
            id,
            fullName: "",
            jobTitle: "",
            companyName: "",
            defaultPhoneNumber: "",
            defaultEmail: "",
        });

        refresh(id);
    };

    return { details, update, modify, handleImage, newEducation, newReference };
}
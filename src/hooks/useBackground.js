import { nanoid } from "nanoid";
import { useInterfaceStore } from "@/stores/useInterfaceStore";
import { useResumeStore } from "@/stores/useResumeStore";
import { useCommonHook } from "@/hooks/useCommon";
import { validateProfileImage } from "@/utils/validation/image";
import { normalizeTemplateId } from "@/utils/validation/template";

export function useBackgroundHook() {
    const { add, modify } = useCommonHook();
    const details = useResumeStore(state => state.personalDetails);
    const update = useResumeStore(state => state.updateDetails);
    const refresh = useInterfaceStore(state => state.updateItem);
    const config = useResumeStore(state => state.configuration);
    const template = useResumeStore(state => state.updateTemplate);

    const handleImage = (event) => {
        const file = event.target.files?.[0];
        if (!validateProfileImage(file)) return;

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result !== "string") return;
            update("profilePicture", reader.result);
            template(normalizeTemplateId(config.template), "enablePicture", true);
        };
        reader.readAsDataURL(file);
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
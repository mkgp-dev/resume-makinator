import { useInterfaceStore } from "./useInterfaceStore";
import { useResumeStore } from "./useResumeStore";

export function useConfigurationStore() {
    const set = useResumeStore(state => state.setData);
    const status = useInterfaceStore(state => state.dataStatus);
    const update = useInterfaceStore(state => state.updateStatus);
    const config = useResumeStore(state => state.configuration);
    const modify = useResumeStore(state => state.updateConfig);
    const render = useResumeStore(state => state.enableInRender);
    const toggle = useResumeStore(state => state.toggleRender);
    const template = useResumeStore(state => state.template);
    const ammend = useResumeStore(state => state.updateTemplate);
    const reset = useResumeStore(state => state.resetData);

    const getData = () => {
        const {
            activePanel,
            personalDetails,
            education,
            references,
            softSkills,
            coreSkills,
            workExperiences,
            personalProjects,
            certificates,
            achievements,
            configuration,
            enableInRender,
        } = useResumeStore.getState();

        return {
            activePanel,
            personalDetails,
            education,
            references,
            softSkills,
            coreSkills,
            workExperiences,
            personalProjects,
            certificates,
            achievements,
            configuration,
            enableInRender,
        };
    }

    const exportData = () => {
        const data = getData();
        const timestamp = Math.floor(Date.now() / 1000);
        const fileName = `resume-data-${timestamp}.json`;

        const file = new Blob([JSON.stringify(data, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(file);

        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();

        URL.revokeObjectURL(url);
    };

    const isValidData = (data) => {
        const requiredKeys = [
            "personalDetails",
            "education",
            "references",
            "softSkills",
            "coreSkills",
            "workExperiences",
            "personalProjects",
            "certificates",
            "achievements",
            "configuration",
            "enableInRender",
        ];

        for (const key of requiredKeys) {
            if (!(key in data)) return false;
        }

        return true;
    };

    const importData = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target.result);

                if (!isValidData(json)) {
                    update(false);
                    return;
                }

                set(json);
                update(true);
            } catch {
                update(false);
            }
        };
        reader.readAsText(file);
    };

    return { status, config, render, template, update, modify, ammend, toggle, reset, importData, exportData };
}
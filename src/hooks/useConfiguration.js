import { useInterfaceStore } from "@/stores/useInterfaceStore";
import { useResumeStore } from "@/stores/useResumeStore";
import { MAX_IMPORT_SIZE_BYTES, isJsonFile, validateImportData } from "@/utils/validation/import";

export function useConfigurationHook() {
    const toNumber = (value) => {
        if (typeof value === "number") return value;
        if (typeof value === "string" && value.trim()) return Number(value);
        return NaN;
    };

    const toPositiveNumber = (value, fallback) => {
        const parsed = toNumber(value);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
    };

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

    const updateNumberConfig = (key, value) => modify(key, toPositiveNumber(value, config[key]));
    const updateTemplateNumber = (section, key, value) => ammend(section, key, toPositiveNumber(value, template[section]?.[key]));

    const getData = () => {
        const {
            activePage,
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
            activePage,
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

    const importData = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!isJsonFile(file) || file.size > MAX_IMPORT_SIZE_BYTES) return update(false);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target.result);
                const sanitized = validateImportData(json);

                if (!sanitized) return update(false);

                set(sanitized);
                update(true);
            } catch {
                update(false);
            }
        };
        reader.readAsText(file);
    };

    return {
        status,
        config,
        render,
        template,
        update,
        modify,
        ammend,
        toggle,
        reset,
        importData,
        exportData,
        updateNumberConfig,
        updateTemplateNumber,
    };
}
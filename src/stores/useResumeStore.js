import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import localforage from "@/database/LocalForage";
import { nanoid } from "nanoid";

const INITIAL_STATE = {
    hasHydrated: false,
    hasAcknowledgedPrivacy: false,
    activePage: "",
    personalDetails: {
        fullName: "",
        jobTitle: "",
        defaultAddress: "",
        defaultEmail: "",
        defaultPhoneNumber: "",
        socialGithub: "",
        socialLinkedin: "",
        summary: "",
        profilePicture: "",
        knownLanguages: [],
    },
    education: [],
    references: [],
    softSkills: [],
    coreSkills: [],
    workExperiences: [],
    personalProjects: [],
    certificates: [],
    achievements: [],
    configuration: {
        template: "whitepaper",
        fontStyle: "Lora",
        fontSize: 12,
        pageSize: "A4",
    },
    enableInRender: {
        workExperiences: false,
        personalProjects: false,
        certificates: false,
        education: false,
        coreSkills: false,
        references: false,
        softSkills: false,
        achievements: false,
        language: false,
    },
    template: {
        whitepaper: {
            blockSpace: 12,
            enablePicture: false,
            pictureSize: 100,
            bulletText: false,
            inlineInformation: true,
        },
        classic: {
            blockSpace: 12,
            bulletText: true,
        },
    },
};

export const useResumeStore = create(
    persist(
        (set) => ({
            ...INITIAL_STATE,
            setHasHydrated: () => set({ hasHydrated: true }),
            setPrivacy: () => set({ hasAcknowledgedPrivacy: true }),
            updatePage: (value) => set({ activePage: value }),
            updateDetails: (field, value) => set(state => ({ personalDetails: { ...state.personalDetails, [field]: value, }, })),
            updateSkills: (value) => set({ softSkills: value }),
            updateConfig: (key, value) => set(state => ({ configuration: { ...state.configuration, [key]: value }, })),
            updateTemplate: (section, key, value) => set(state => ({ template: { ...state.template, [section]: { ...state.template[section], [key]: value, } } })),
            updateItemOrder: (section, items) => set(() => ({ [section]: items, })),
            updateItem: (section, id, data) => set(state => ({ [section]: state[section].map(item => item.id === id ? { ...item, ...data } : item) })),
            removeItem: (section, id) => set(state => ({ [section]: state[section].filter(item => item.id !== id), })),
            addItem: (section, data) => set(state => ({ [section]: [...state[section], { id: nanoid(), ...data }] })),
            toggleRender: (key) => set(state => ({ enableInRender: { ...state.enableInRender, [key]: !state.enableInRender[key] }, })),
            setData: (data) => set(() => data),
            resetData: () => set(() => ({ ...INITIAL_STATE, activePage: "data", hasHydrated: true, hasAcknowledgedPrivacy: true, })),
        }),
        {
            name: "resumeData",
            storage: createJSONStorage(() => localforage),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated?.();
            },
        }
    )
);
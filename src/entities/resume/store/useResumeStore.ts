import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import localforage from "@/shared/lib/localForage"
import { nanoid } from "nanoid"
import type {
    ResumeData,
    ResumeImportData,
    PersonalDetails,
    Configuration,
    TemplateConfig,
    RenderConfig,
    ItemSectionKey,
    SectionItemMap,
} from "@/entities/resume/types"
import type { ActivePage } from "@/app/navigation"

export type ResumeStore = ResumeData & {
    hasHydrated: boolean
    hasAcknowledgedPrivacy: boolean
    setHasHydrated: () => void
    setPrivacy: () => void
    updatePage: (value: ActivePage) => void
    updateDetails: <K extends keyof PersonalDetails>(field: K, value: PersonalDetails[K]) => void
    updateSkills: (value: string[]) => void
    updateConfig: <K extends keyof Configuration>(key: K, value: Configuration[K]) => void
    updateTemplate: <K extends keyof TemplateConfig, T extends keyof TemplateConfig[K]>(
        section: K,
        key: T,
        value: TemplateConfig[K][T]
    ) => void
    updateItemOrder: <K extends ItemSectionKey>(section: K, items: Array<SectionItemMap[K]>) => void
    updateItem: <K extends ItemSectionKey>(section: K, id: string, data: Partial<SectionItemMap[K]>) => void
    removeItem: <K extends ItemSectionKey>(section: K, id: string) => void
    addItem: <K extends ItemSectionKey>(
        section: K,
        data: Omit<SectionItemMap[K], "id"> & { id?: string }
    ) => void
    toggleRender: <K extends keyof RenderConfig>(key: K) => void
    setData: (data: ResumeImportData) => void
    resetData: () => void
}

const INITIAL_STATE: ResumeData & {
    hasHydrated: boolean
    hasAcknowledgedPrivacy: boolean
} = {
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
}

export const useResumeStore = create<ResumeStore>()(
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
            updateItemOrder: (section, items) =>
                set(() => ({ [section]: items }) as Partial<ResumeStore>),
            updateItem: (section, id, data) => set(state => {
                const items = state[section] as Array<SectionItemMap[typeof section]>
                return { [section]: items.map(item => item.id === id ? { ...item, ...data } : item) } as Partial<ResumeStore>
            }),
            removeItem: (section, id) => set(state => {
                const items = state[section] as Array<SectionItemMap[typeof section]>
                return { [section]: items.filter(item => item.id !== id) } as Partial<ResumeStore>
            }),
            addItem: (section, data) => set(state => {
                const items = state[section] as Array<SectionItemMap[typeof section]>
                return { [section]: [...items, { id: nanoid(), ...data }] } as Partial<ResumeStore>
            }),
            toggleRender: (key) => set(state => ({ enableInRender: { ...state.enableInRender, [key]: !state.enableInRender[key] }, })),
            setData: (data) => set(() => data as Partial<ResumeStore>),
            resetData: () => set(() => ({ ...INITIAL_STATE, activePage: "data", hasHydrated: true, hasAcknowledgedPrivacy: true, })),
        }),
        {
            name: "resumeData",
            storage: createJSONStorage(() => localforage),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated?.()
            },
        }
    )
)

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
    ProjectItem,
} from "@/entities/resume/types"
import type { ActivePage } from "@/app/navigation"
import { WHITEPAPER_SECTION_ORDER_DEFAULT } from "@/entities/resume/constants/whitepaperSections"
import { useInterfaceStore } from "@/shared/store/useInterfaceStore"

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
        summary: true,
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
            sectionOrder: WHITEPAPER_SECTION_ORDER_DEFAULT,
        },
        classic: {
            blockSpace: 12,
            bulletText: true,
        },
    },
}

type UnknownRecord = Record<string, unknown>

const isPlainObject = (value: unknown): value is UnknownRecord =>
    typeof value === "object" && value !== null && !Array.isArray(value)
const isString = (value: unknown): value is string => typeof value === "string"
const isBoolean = (value: unknown): value is boolean => typeof value === "boolean"
const isStringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every(isString)

const getLegacyProjectSubtitle = (value: UnknownRecord) => {
    if (isString(value.projectSubtitle)) return value.projectSubtitle
    if (isString(value.projectFramework)) return value.projectFramework
    if (isString(value.projectFrameworks)) return value.projectFrameworks
    if (isStringArray(value.projectFrameworks)) return value.projectFrameworks.join(", ")
    return ""
}

const normalizeProjectItems = (value: unknown, fallback: ProjectItem[]) => {
    if (!Array.isArray(value)) return fallback

    return value
        .map((item) => {
            if (!isPlainObject(item)) return null
            const id = isString(item.id) ? item.id : nanoid()
            return {
                id,
                projectName: isString(item.projectName) ? item.projectName : "",
                projectSubtitle: getLegacyProjectSubtitle(item),
                preview: isString(item.preview) ? item.preview : "",
                briefSummary: isString(item.briefSummary) ? item.briefSummary : (isString(item.projectDescription) ? item.projectDescription : ""),
                bulletType: isBoolean(item.bulletType) ? item.bulletType : false,
                bulletSummary: isStringArray(item.bulletSummary) ? item.bulletSummary : [],
            }
        })
        .filter((item): item is ProjectItem => item !== null)
}

const shouldResetAfterMerge = (state: Partial<ResumeStore>, normalizedProjects: ProjectItem[]) => {
    if (state && !isPlainObject(state)) return true
    if (state.personalDetails !== undefined && !isPlainObject(state.personalDetails)) return true
    if (Array.isArray(state.personalProjects) && state.personalProjects.length > 0 && normalizedProjects.length === 0) return true
    return false
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
            merge: (persistedState, currentState) => {
                const state = persistedState as Partial<ResumeStore> | null
                if (!state) return currentState

                try {
                    const normalizedProjects = normalizeProjectItems(state.personalProjects, currentState.personalProjects)
                    if (shouldResetAfterMerge(state, normalizedProjects)) {
                        useInterfaceStore.getState().setHydrateNotice(
                            "Saved data could not be loaded, so it was reset to defaults. You can re-import your JSON data from the Data panel."
                        )
                        return currentState
                    }

                    return {
                        ...currentState,
                        ...state,
                        personalDetails: state.personalDetails || currentState.personalDetails,
                        education: state.education || currentState.education,
                        references: state.references || currentState.references,
                        softSkills: state.softSkills || currentState.softSkills,
                        coreSkills: state.coreSkills || currentState.coreSkills,
                        workExperiences: state.workExperiences || currentState.workExperiences,
                        personalProjects: normalizedProjects,
                        certificates: state.certificates || currentState.certificates,
                        achievements: state.achievements || currentState.achievements,
                        configuration: {
                            ...currentState.configuration,
                            ...(state.configuration || {}),
                        },
                        enableInRender: {
                            ...currentState.enableInRender,
                            ...(state.enableInRender || {}),
                        },
                        template: {
                            ...currentState.template,
                            ...(state.template || {}),
                            whitepaper: {
                                ...currentState.template.whitepaper,
                                ...(state.template?.whitepaper || {}),
                            },
                            classic: {
                                ...currentState.template.classic,
                                ...(state.template?.classic || {}),
                            },
                        },
                    }
                } catch {
                    useInterfaceStore.getState().setHydrateNotice(
                        "Saved data could not be loaded, so it was reset to defaults. You can re-import your JSON data from the Data panel."
                    )
                    return currentState
                }
            },
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated?.()
            },
        }
    )
)

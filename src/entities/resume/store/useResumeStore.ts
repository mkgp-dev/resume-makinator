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
import { isActivePage } from "@/app/navigation"
import type { ActivePage } from "@/app/navigation"
import { WHITEPAPER_SECTION_ORDER_DEFAULT } from "@/entities/resume/constants/whitepaperSections"
import { validateImportData } from "@/entities/resume/validation/import"
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
const isBoolean = (value: unknown): value is boolean => typeof value === "boolean"
const HYDRATE_RESET_NOTICE =
    "Saved data could not be loaded, so it was reset to defaults. You can re-import your JSON data from the Data panel."

const asObject = (value: unknown): UnknownRecord =>
    isPlainObject(value) ? value : {}

const setHydrateResetNotice = () => {
    useInterfaceStore.getState().setHydrateNotice(HYDRATE_RESET_NOTICE)
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
                if (!isPlainObject(state)) return currentState

                try {
                    const configuration = asObject(state.configuration)
                    const enableInRender = asObject(state.enableInRender)
                    const template = asObject(state.template)
                    const whitepaperTemplate = asObject(template.whitepaper)
                    const classicTemplate = asObject(template.classic)

                    const sanitizedData = validateImportData({
                        personalDetails: state.personalDetails ?? currentState.personalDetails,
                        education: state.education ?? currentState.education,
                        references: state.references ?? currentState.references,
                        softSkills: state.softSkills ?? currentState.softSkills,
                        coreSkills: state.coreSkills ?? currentState.coreSkills,
                        workExperiences: state.workExperiences ?? currentState.workExperiences,
                        personalProjects: state.personalProjects ?? currentState.personalProjects,
                        certificates: state.certificates ?? currentState.certificates,
                        achievements: state.achievements ?? currentState.achievements,
                        configuration: {
                            ...currentState.configuration,
                            ...configuration,
                        },
                        enableInRender: {
                            ...currentState.enableInRender,
                            ...enableInRender,
                        },
                        template: {
                            ...currentState.template,
                            ...template,
                            whitepaper: {
                                ...currentState.template.whitepaper,
                                ...whitepaperTemplate,
                            },
                            classic: {
                                ...currentState.template.classic,
                                ...classicTemplate,
                            },
                        },
                        ...(state.activePage !== undefined ? { activePage: state.activePage } : {}),
                    })

                    if (!sanitizedData) {
                        setHydrateResetNotice()
                        return currentState
                    }

                    const nextActivePage =
                        typeof state.activePage === "string" && isActivePage(state.activePage)
                            ? state.activePage
                            : currentState.activePage

                    return {
                        ...currentState,
                        ...sanitizedData,
                        activePage: nextActivePage,
                        hasAcknowledgedPrivacy: isBoolean(state.hasAcknowledgedPrivacy)
                            ? state.hasAcknowledgedPrivacy
                            : currentState.hasAcknowledgedPrivacy,
                    }
                } catch {
                    setHydrateResetNotice()
                    return currentState
                }
            },
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated?.()
            },
        }
    )
)

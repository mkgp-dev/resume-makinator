import { create } from "zustand"

type InterfaceStore = {
    newItem: string | null
    dataStatus: boolean | null
    hydrateNotice: string | null
    updateItem: (id: string | null) => void
    updateStatus: (value: boolean | null) => void
    setHydrateNotice: (value: string | null) => void
}

export const useInterfaceStore = create<InterfaceStore>()((set) => ({
    newItem: null,
    dataStatus: null,
    hydrateNotice: null,
    updateItem: (id) => set({ newItem: id }),
    updateStatus: (value) => set({ dataStatus: value }),
    setHydrateNotice: (value) => set({ hydrateNotice: value }),
}))

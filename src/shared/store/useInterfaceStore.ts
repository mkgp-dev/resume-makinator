import { create } from "zustand"

type InterfaceStore = {
    newItem: string | null
    dataStatus: boolean | null
    updateItem: (id: string | null) => void
    updateStatus: (value: boolean | null) => void
}

export const useInterfaceStore = create<InterfaceStore>()((set) => ({
    newItem: null,
    dataStatus: null,
    updateItem: (id) => set({ newItem: id }),
    updateStatus: (value) => set({ dataStatus: value }),
}))

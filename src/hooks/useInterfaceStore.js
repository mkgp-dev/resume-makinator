import { create } from "zustand";

export const useInterfaceStore = create(
    (set) => ({
        newItem: null,
        dataStatus: null,
        updateItem: (id) => set({ newItem: id }),
        updateStatus: (value) => set({ dataStatus: value }),
    })
);
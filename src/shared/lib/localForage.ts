import localforage from "localforage"

localforage.config({
    name: "rmLocalData",
    storeName: "rmStorage",
    description: "Web Storage API powered by localForage"
})

export default localforage
import '@testing-library/jest-dom/vitest'

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {
      return undefined
    },
    removeListener: () => {
      return undefined
    },
    addEventListener: () => {
      return undefined
    },
    removeEventListener: () => {
      return undefined
    },
    dispatchEvent: () => false,
  }),
})

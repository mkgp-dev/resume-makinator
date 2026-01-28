type BufferConstructor = typeof import("buffer").Buffer

declare global {
  var Buffer: BufferConstructor
}

export {}

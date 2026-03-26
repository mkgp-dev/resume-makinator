import type { Buffer } from "buffer"

type BufferConstructor = typeof Buffer

declare global {
  var Buffer: BufferConstructor
}

export {}

import { Font } from '@react-pdf/renderer'

let didRegisterFonts = false

export function ensurePdfFontsRegistered() {
  if (didRegisterFonts) {
    return
  }

  Font.register({
    family: 'Lora',
    fonts: [
      { src: '/fonts/Lora-Regular.ttf', fontWeight: 400 },
      { src: '/fonts/Lora-Medium.ttf', fontWeight: 500 },
      { src: '/fonts/Lora-Bold.ttf', fontWeight: 700 },
    ],
  })

  didRegisterFonts = true
}

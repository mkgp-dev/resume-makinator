import { MantineProvider, createTheme } from '@mantine/core'
import type { ReactNode } from 'react'

const theme = createTheme({
  primaryColor: 'emerald',
  colors: {
    emerald: [
      '#ECFDF5',
      '#D1FAE5',
      '#A7F3D0',
      '#6EE7B7',
      '#34D399',
      '#10B981',
      '#059669',
      '#047857',
      '#065F46',
      '#064E3B',
    ],
  },
  fontFamily: "'Geist Variable', Geist, ui-sans-serif, system-ui, sans-serif",
  fontFamilyMonospace:
    "'Geist Mono Variable', 'Geist Mono', ui-monospace, SFMono-Regular, monospace",
  headings: {
    fontFamily: "'Geist Variable', Geist, ui-sans-serif, system-ui, sans-serif",
    fontWeight: '500',
  },
  defaultRadius: 0,
  components: {
    Button: {
      defaultProps: { radius: 0 },
      styles: { root: { borderRadius: '1.2px' } },
    },
    TextInput: { defaultProps: { radius: 0 } },
    Textarea: { defaultProps: { radius: 0 } },
    Select: { defaultProps: { radius: 0 } },
    Paper: {
      defaultProps: { radius: 0, withBorder: true },
      styles: { root: { borderColor: '#E7E5E4' } },
    },
    Input: {
      styles: {
        input: {
          borderColor: '#E7E5E4',
          '&:focus': {
            borderColor: '#10B981',
            boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.1)',
          },
        },
      },
    },
  },
})

type MantineThemeProviderProps = {
  children: ReactNode
}

export function MantineThemeProvider({ children }: MantineThemeProviderProps) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      {children}
    </MantineProvider>
  )
}

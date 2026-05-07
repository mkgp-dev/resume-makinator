import { QueryClientProvider } from '@tanstack/react-query'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'
import type { ReactNode } from 'react'

import { MantineThemeProvider } from '@/app/providers/MantineThemeProvider'
import { queryClient } from '@/app/providers/queryClient'

type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <MantineThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ModalsProvider>
          <Notifications position="top-right" />
          {children}
        </ModalsProvider>
      </QueryClientProvider>
    </MantineThemeProvider>
  )
}

import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import '@fontsource-variable/geist/wght.css'
import '@fontsource-variable/geist-mono/wght.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from '@/App'
import { AppProviders } from '@/app/providers/AppProviders'
import '@/app/styles/global.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
)

import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AppProviders } from '@/app/providers/AppProviders'

describe('AppProviders smoke', () => {
  it('renders provider tree without crashing', () => {
    const { container } = render(
      <AppProviders>
        <div>Provider Smoke</div>
      </AppProviders>,
    )

    expect(container).toBeTruthy()
  })

  it('mounts Mantine provider classes', () => {
    render(
      <AppProviders>
        <div>Provider Smoke</div>
      </AppProviders>,
    )

    expect(document.querySelector('[class*="mantine-"]')).toBeTruthy()
  })
})

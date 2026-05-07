import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { LandingPage } from '@/features/landing/LandingPage'
import { renderWithRouter } from '@/test/router/render-with-router'

const createDocumentMock = vi.fn(async () => {
  return { id: 'resume-1' }
})

vi.mock('@/entities/resume/store', () => {
  return {
    useResumeDocumentsStore: (selector: (state: { createDocument: typeof createDocumentMock }) => unknown) => {
      return selector({
        createDocument: createDocumentMock,
      })
    },
  }
})

describe('LandingPage', () => {
  beforeEach(() => {
    createDocumentMock.mockClear()
  })

  it('renders required headline and start button', async () => {
    await renderWithRouter(LandingPage)

    expect(screen.getByText('Build your resume with AI.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Start Building →' })).toBeInTheDocument()
    expect(screen.getByText('AI Editing')).toBeInTheDocument()
    expect(screen.getByText('Live Preview')).toBeInTheDocument()
    expect(screen.getByText('Yours Forever')).toBeInTheDocument()
  })

  it('creates a document and navigates to /builder when start is clicked', async () => {
    const { router } = await renderWithRouter(LandingPage)

    fireEvent.click(screen.getByRole('button', { name: 'Start Building →' }))

    await waitFor(() => {
      expect(createDocumentMock).toHaveBeenCalledTimes(1)
      expect(router.state.location.pathname).toBe('/builder')
    })
  })
})

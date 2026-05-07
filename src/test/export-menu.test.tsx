import { fireEvent, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { createResumeDocument } from '@/entities/resume/utils/create-resume-document'
import { ExportMenu } from '@/features/resume-export/components/ExportMenu'
import { renderWithRouter } from '@/test/router/render-with-router'

const { toBlobMock, pdfMock, notificationsShowMock } = vi.hoisted(() => {
  const toBlob = vi.fn<() => Promise<Blob>>()
  return {
    toBlobMock: toBlob,
    pdfMock: vi.fn((doc: unknown) => {
      void doc
      return { toBlob }
    }),
    notificationsShowMock: vi.fn(),
  }
})

vi.mock('@react-pdf/renderer', async () => {
  return {
    pdf: pdfMock,
    Document: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    Page: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    Text: ({ children }: { children: ReactNode }) => <span>{children}</span>,
    View: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    StyleSheet: { create: <T,>(value: T) => value },
    Font: { register: vi.fn() },
  }
})

vi.mock('@mantine/notifications', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mantine/notifications')>()
  return {
    ...actual,
    notifications: {
      ...actual.notifications,
      show: notificationsShowMock,
    },
  }
})

describe('ExportMenu', () => {
  beforeEach(() => {
    toBlobMock.mockReset()
    pdfMock.mockClear()
    notificationsShowMock.mockClear()
  })

  it('calls export flow and downloads generated blob', async () => {
    const resume = createResumeDocument({
      content: {
        ...createResumeDocument().content,
        personalDetails: {
          fullName: 'Jane Doe',
          email: '',
          phone: '',
          location: '',
          headline: '',
          website: '',
          linkedin: '',
          github: '',
          summary: '',
        },
      },
    })

    toBlobMock.mockResolvedValue(new Blob(['pdf']))

    const createObjectUrlSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
    const revokeObjectUrlSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)

    await renderWithRouter(() => <ExportMenu resume={resume} />)
    fireEvent.click(screen.getByRole('button', { name: 'Compile PDF' }))

    await waitFor(() => {
      expect(toBlobMock).toHaveBeenCalled()
    })

    expect(pdfMock).toHaveBeenCalled()
    expect(createObjectUrlSpy).toHaveBeenCalled()
    expect(clickSpy).toHaveBeenCalled()
    expect(revokeObjectUrlSpy).toHaveBeenCalledWith('blob:test')

    createObjectUrlSpy.mockRestore()
    revokeObjectUrlSpy.mockRestore()
    clickSpy.mockRestore()
  })

  it('shows notification when export fails', async () => {
    const resume = createResumeDocument()
    toBlobMock.mockRejectedValue(new Error('failed'))

    await renderWithRouter(() => <ExportMenu resume={resume} />)
    fireEvent.click(screen.getByRole('button', { name: 'Compile PDF' }))

    await waitFor(() => {
      expect(notificationsShowMock).toHaveBeenCalled()
    })
  })
})

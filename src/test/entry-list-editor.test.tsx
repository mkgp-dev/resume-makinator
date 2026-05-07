import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { EntryListEditor } from '@/features/resume-editor/components/EntryListEditor'
import { renderWithRouter } from '@/test/router/render-with-router'

const { openConfirmModalMock } = vi.hoisted(() => {
  return {
    openConfirmModalMock: vi.fn(),
  }
})

vi.mock('@mantine/modals', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mantine/modals')>()
  return {
    ...actual,
    modals: {
      ...actual.modals,
      openConfirmModal: openConfirmModalMock,
    },
  }
})

describe('EntryListEditor', () => {
  it('can add, edit, and request delete confirmation', async () => {
    const changes: Array<Array<{ id: string; title: string }>> = []

    const Wrapper = () => {
      const items = [{ id: 'a', title: 'Item A' }]
      return (
        <EntryListEditor
          title="Test Entries"
          items={items}
          onChange={(next) => {
            changes.push(next)
          }}
          createEmptyItem={() => ({ id: 'b', title: '' })}
          renderSummary={(item) => item.title || 'Untitled'}
          renderForm={(item, onItemChange) => (
            <input
              aria-label="Title"
              value={item.title}
              onChange={(e) => onItemChange({ ...item, title: e.currentTarget.value })}
            />
          )}
        />
      )
    }

    await renderWithRouter(Wrapper)

    fireEvent.click(screen.getByRole('button', { name: 'Add Entry' }))
    expect(changes.at(-1)).toEqual([
      { id: 'a', title: 'Item A' },
      { id: 'b', title: '' },
    ])

    fireEvent.click(screen.getByRole('button', { name: 'Expand' }))
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Updated' } })
    expect(changes.at(-1)).toEqual([{ id: 'a', title: 'Updated' }])

    fireEvent.click(screen.getByLabelText('Delete entry'))
    expect(openConfirmModalMock).toHaveBeenCalled()
  })

  it('renders friendly empty state with Add Entry visible', async () => {
    const Wrapper = () => (
      <EntryListEditor
        title="Test Entries"
        items={[]}
        onChange={() => undefined}
        createEmptyItem={() => ({ id: 'b', title: '' })}
        renderSummary={(item) => item.title || 'Untitled'}
        renderForm={() => null}
      />
    )

    await renderWithRouter(Wrapper)

    expect(screen.getByText('No entries yet. Add your first entry to get started.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add Entry' })).toBeInTheDocument()
  })
})

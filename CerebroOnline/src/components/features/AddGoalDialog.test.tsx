import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { AddGoalDialog } from './AddGoalDialog'
import React from 'react'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, onClick }: any) => (
      <div className={className} onClick={onClick}>{children}</div>
    ),
    button: ({ children, className, onClick, disabled }: any) => (
      <button className={className} onClick={onClick} disabled={disabled}>{children}</button>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Target: () => <span data-testid="icon-target" />,
  X: () => <button>X</button>,
  ChevronDown: () => <span>v</span>
}))

describe('AddGoalDialog', () => {
  const mockOnClose = vi.fn()
  const mockOnSave = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not render when isOpen is false', () => {
    render(
      <AddGoalDialog
        isOpen={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
        periodType="weekly"
      />
    )
    expect(screen.queryByText('Nova Meta')).not.toBeInTheDocument()
  })

  it('should render when isOpen is true', () => {
    render(
      <AddGoalDialog
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        periodType="weekly"
      />
    )
    expect(screen.getByText(/Nova Meta/i)).toBeInTheDocument()
    expect(screen.getByText(/Meta Semanal/i)).toBeInTheDocument()
  })

  it('should call onClose when close button is clicked', () => {
    render(
      <AddGoalDialog
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        periodType="weekly"
      />
    )
    // The X icon mock is a button, or the button wrapping it
    // Let's find by text 'X' if we mocked it that way, or by role
    const closeButton = screen.getByText('X')
    fireEvent.click(closeButton) 
    // Wait, the button in component wraps the icon. 
    // Component: <button onClick={onClose}><X /></button>
    // Our mock X is <button>X</button>. So we have a button inside a button? Invalid HTML but might work for click bubbling.
    // Better: Helper to find the close button.
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should update title and enable save button', async () => {
    render(
      <AddGoalDialog
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        periodType="weekly"
      />
    )
    
    // Use regex for flexible matching or specific placeholder
    const input = screen.getByPlaceholderText(/Ex: Treinar/i)
    const saveButton = screen.getByText(/Criar Meta/i)

    // Initial state: disabled because title is empty
    expect(saveButton).toBeDisabled()

    // Type title
    fireEvent.change(input, { target: { value: 'Correr 5km' } })
    
    // Wait for state update and button enable
    await waitFor(() => {
        expect(input).toHaveValue('Correr 5km')
        expect(saveButton).not.toBeDisabled()
    })

    // Click save
    fireEvent.click(saveButton)
    
    expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Correr 5km',
      unit: 'dias'
    }))
  })
})

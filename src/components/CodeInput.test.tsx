import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CodeInput } from './CodeInput'
import type { CodeLength } from '../domain/codes'

function Harness({
  length = 4,
  initial = '',
  onComplete,
}: {
  length?: CodeLength
  initial?: string
  onComplete?: (value: string) => void
}) {
  const [value, setValue] = useState(initial)
  return (
    <>
      <CodeInput
        label="Enter the 4-digit code from your SMS"
        value={value}
        onChange={setValue}
        length={length}
        onComplete={onComplete}
      />
      <output data-testid="value">{value}</output>
    </>
  )
}

const boxes = () => screen.getAllByRole('textbox')
const currentValue = () => screen.getByTestId('value').textContent

describe('CodeInput', () => {
  it('renders one labelled box per digit', () => {
    render(<Harness />)
    expect(boxes()).toHaveLength(4)
    expect(screen.getByLabelText('Digit 1 of 4')).toBeInTheDocument()
    expect(screen.getByLabelText('Digit 4 of 4')).toBeInTheDocument()
  })

  it('renders six boxes for a sign-in code', () => {
    render(<Harness length={6} />)
    expect(boxes()).toHaveLength(6)
    expect(screen.getByLabelText('Digit 6 of 6')).toBeInTheDocument()
  })

  it('ties the group to the field label', () => {
    render(<Harness />)
    expect(
      screen.getByRole('group', {
        name: 'Enter the 4-digit code from your SMS',
      }),
    ).toBeInTheDocument()
  })

  it('auto-advances as digits are typed', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(boxes()[0])
    await user.keyboard('4821')
    expect(currentValue()).toBe('4821')
  })

  it('leaves focus on the last box once full, rather than wrapping', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(boxes()[0])
    await user.keyboard('4821')
    expect(boxes()[3]).toHaveFocus()
  })

  it('ignores non-digits', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(boxes()[0])
    await user.keyboard('4a8b2c1')
    expect(currentValue()).toBe('4821')
  })

  it('replaces the digit when typing into a filled box', async () => {
    const user = userEvent.setup()
    render(<Harness initial="4821" />)
    await user.click(boxes()[2])
    await user.keyboard('9')
    expect(currentValue()).toBe('4891')
  })

  it('steps back and clears on backspace in an empty box', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(boxes()[0])
    await user.keyboard('482')
    await user.keyboard('{Backspace}')
    expect(currentValue()).toBe('48')
    expect(boxes()[2]).toHaveFocus()
  })

  it('clears in place on backspace in a filled box', async () => {
    const user = userEvent.setup()
    render(<Harness initial="4821" />)
    await user.click(boxes()[3])
    await user.keyboard('{Backspace}')
    expect(currentValue()).toBe('482')
  })

  it('moves with the arrow keys', async () => {
    const user = userEvent.setup()
    render(<Harness initial="4821" />)
    await user.click(boxes()[2])
    await user.keyboard('{ArrowLeft}')
    expect(boxes()[1]).toHaveFocus()
    await user.keyboard('{ArrowRight}{ArrowRight}')
    expect(boxes()[3]).toHaveFocus()
  })

  it('does not move past either end with the arrow keys', async () => {
    const user = userEvent.setup()
    render(<Harness initial="4821" />)
    await user.click(boxes()[0])
    await user.keyboard('{ArrowLeft}')
    expect(boxes()[0]).toHaveFocus()
    await user.click(boxes()[3])
    await user.keyboard('{ArrowRight}')
    expect(boxes()[3]).toHaveFocus()
  })

  it('fills every box from one paste', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(boxes()[0])
    await user.paste('4821')
    expect(currentValue()).toBe('4821')
  })

  it('strips separators out of a pasted code', async () => {
    const user = userEvent.setup()
    render(<Harness length={6} />)
    await user.click(boxes()[0])
    await user.paste('482-913')
    expect(currentValue()).toBe('482913')
  })

  it('drops the overflow when a long code is pasted', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(boxes()[0])
    await user.paste('482913')
    expect(currentValue()).toBe('4829')
  })

  it('pastes from the box that has focus', async () => {
    const user = userEvent.setup()
    render(<Harness initial="48" />)
    await user.click(boxes()[2])
    await user.paste('21')
    expect(currentValue()).toBe('4821')
  })

  it('calls onComplete once the last box is filled', async () => {
    const onComplete = vi.fn()
    const user = userEvent.setup()
    render(<Harness onComplete={onComplete} />)
    await user.click(boxes()[0])
    await user.keyboard('482')
    expect(onComplete).not.toHaveBeenCalled()
    await user.keyboard('1')
    expect(onComplete).toHaveBeenCalledWith('4821')
  })

  it('calls onComplete on a full paste', async () => {
    const onComplete = vi.fn()
    const user = userEvent.setup()
    render(<Harness onComplete={onComplete} />)
    await user.click(boxes()[0])
    await user.paste('7390')
    expect(onComplete).toHaveBeenCalledWith('7390')
  })

  it('announces an error and marks every box invalid', () => {
    render(
      <CodeInput
        label="Enter the 4-digit code from your SMS"
        value="4819"
        onChange={() => {}}
        error="That code is not right. You have 2 tries left."
      />,
    )
    const alert = screen.getByText(
      'That code is not right. You have 2 tries left.',
    )
    expect(alert.closest('[aria-live]')).toHaveAttribute('aria-live', 'polite')
    for (const box of boxes()) {
      expect(box).toHaveAttribute('aria-invalid', 'true')
    }
  })

  it('disables every box together', () => {
    render(
      <CodeInput label="Code" value="" onChange={() => {}} disabled />,
    )
    for (const box of boxes()) expect(box).toBeDisabled()
  })

  it('hides the digits and relabels them when secret', () => {
    render(<CodeInput label="PIN" value="48" onChange={() => {}} secret />)
    const first = screen.getByLabelText('PIN digit 1 of 4')
    expect(first).toHaveAttribute('type', 'password')
  })
})

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { Nav } from './Nav'

function renderNav() {
  return render(
    <MemoryRouter initialEntries={['/sender/new']}>
      <Nav
        accent="sender"
        home="/"
        label="Sender"
        items={[
          { to: '/sender/new', label: 'New booking' },
          { to: '/sender/bookings', label: 'My bookings' },
        ]}
        aside={<b>Grace W.</b>}
      />
    </MemoryRouter>,
  )
}

describe('Nav', () => {
  it('marks the current page', () => {
    renderNav()
    expect(screen.getByRole('link', { name: 'New booking' })).toHaveClass('on')
    expect(screen.getByRole('link', { name: 'My bookings' })).not.toHaveClass(
      'on',
    )
  })

  it('keeps one copy of each link while the menu is closed', () => {
    renderNav()
    expect(screen.getAllByRole('link', { name: 'New booking' })).toHaveLength(1)
    expect(screen.getAllByText('Grace W.')).toHaveLength(1)
  })

  it('announces the menu button as a collapsed disclosure', () => {
    const { container } = renderNav()
    const button = screen.getByRole('button', { name: 'Menu' })
    expect(button).toHaveAttribute('aria-expanded', 'false')

    // The panel it controls exists even while closed, so the reference is
    // never dangling.
    const controls = button.getAttribute('aria-controls')
    expect(controls).toBeTruthy()
    expect(container.querySelector(`#${controls}`)).toHaveClass('navpanel')
  })

  it('opens the menu with the same links and aside', async () => {
    const user = userEvent.setup()
    renderNav()
    await user.click(screen.getByRole('button', { name: 'Menu' }))

    const button = screen.getByRole('button', { name: 'Close' })
    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(
      screen.getByRole('navigation', { name: 'Sender, menu' }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'New booking' })).toHaveLength(2)
    expect(screen.getAllByText('Grace W.')).toHaveLength(2)
  })

  it('closes the menu when a link in it is followed', async () => {
    const user = userEvent.setup()
    renderNav()
    await user.click(screen.getByRole('button', { name: 'Menu' }))
    const links = screen.getAllByRole('link', { name: 'My bookings' })
    await user.click(links[links.length - 1])

    expect(screen.getByRole('button', { name: 'Menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(
      screen.queryByRole('navigation', { name: 'Sender, menu' }),
    ).not.toBeInTheDocument()
  })

  it('omits the menu button when there is nothing to collapse', () => {
    render(
      <MemoryRouter>
        <Nav home="/" label="Main" />
      </MemoryRouter>,
    )
    expect(screen.queryByRole('button', { name: 'Menu' })).not.toBeInTheDocument()
  })
})

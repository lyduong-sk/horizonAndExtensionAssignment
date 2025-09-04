import { fireEvent, render, screen } from '@testing-library/react'
import { AllTheProviders } from '@skedulo/horizon-core'
import { AddressForm } from './AddressForm'

describe('AddressForm - the example component', () => {
  beforeEach(() => {
    render(
      <AllTheProviders>
        <AddressForm />
      </AllTheProviders>
    )
  })

  it('renders the React component', () => {
    expect(screen.getByText('Hello, Address Form!')).toBeInTheDocument()
  })

  it('has working click event', async () => {
    const button = await screen.findByText('Count is 0')
    expect(button).toBeInTheDocument()
    fireEvent(button, new CustomEvent('brz-button-click'))
    expect(await screen.findByText('Count is 1' )).toBeInTheDocument()
  })
})

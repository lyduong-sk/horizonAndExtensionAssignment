import { fireEvent, render, screen } from '@testing-library/react'
import { AllTheProviders } from '@skedulo/horizon-core'
import { AddressForm } from './index'

describe('AddressForm - the example component', () => {
  beforeEach(() => {
    render(
      <AllTheProviders>
        <AddressForm />
      </AllTheProviders>
    )
  })

  it('renders the React component', () => {
    expect(screen.getByText('Configurable Address Form')).toBeInTheDocument()
  })
})

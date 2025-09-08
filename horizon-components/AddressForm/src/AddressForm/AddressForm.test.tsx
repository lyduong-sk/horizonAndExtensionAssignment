import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { AllTheProviders } from '@skedulo/horizon-core'
import { AddressForm } from './AddressForm'
import * as horizonCore from '@skedulo/horizon-core'

const mockMutate = jest.fn()
const mockUseGraphQLMutation = jest.fn(() => ({ mutate: mockMutate, loading: false, error: null }))

jest.spyOn(horizonCore, 'useGraphQLMutation').mockImplementation(mockUseGraphQLMutation)

describe('AddressForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the React component', () => {
    render(
      <AllTheProviders>
        <AddressForm />
      </AllTheProviders>
    )
    expect(screen.getByText('Configurable Address Form')).toBeInTheDocument()
  })

  it('updates field value on input change', () => {
    render(
      <AllTheProviders>
        <AddressForm />
      </AllTheProviders>
    )
    const streetInput = screen.getByTestId('address-input-street')
    fireEvent.change(streetInput, { target: { value: '456 Oak Ave' } })
    expect(streetInput as HTMLInputElement).toHaveValue('456 Oak Ave')
  })

  it('renders record info when record and recordContext are provided', () => {
    const record = { name: 'Test Account', uid: 'rec123' }
    const recordContext = { objectUid: 'obj456', resourceUid: 'res789', resourceName: 'ResourceX' }
    render(
      <AllTheProviders>
        <AddressForm record={record} recordContext={recordContext} />
      </AllTheProviders>
    )
    expect(screen.getByText('Current Record: Test Account')).toBeInTheDocument()
    expect(screen.getByText('Record ID: obj456')).toBeInTheDocument()
    expect(screen.getByText('Resource: ResourceX')).toBeInTheDocument()
  })
})

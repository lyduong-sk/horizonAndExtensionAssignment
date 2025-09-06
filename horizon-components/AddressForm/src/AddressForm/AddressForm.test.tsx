import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { AllTheProviders } from '@skedulo/horizon-core'
import { AddressForm } from './index'
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

  it('renders address fields with default labels and placeholders', () => {
    render(
      <AllTheProviders>
        <AddressForm />
      </AllTheProviders>
    )
    expect(screen.getByPlaceholderText('e.g. 123 Main St, 456 Oak Ave')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('e.g. New York, Los Angeles')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('e.g. NY, CA')).toBeInTheDocument()
  })

  it('updates field value on input change', () => {
    render(
      <AllTheProviders>
        <AddressForm />
      </AllTheProviders>
    )
    const streetInput = screen.getByPlaceholderText('e.g. 123 Main St, 456 Oak Ave')
    fireEvent.change(streetInput, { target: { value: '456 Oak Ave' } })
    expect(streetInput).toHaveValue('456 Oak Ave')
  })

  it('calls mutate and shows success toast on Save', async () => {
    mockMutate.mockResolvedValueOnce({})
    render(
      <AllTheProviders>
        <AddressForm />
      </AllTheProviders>
    )
    const saveButton = screen.getByText('Save')
    fireEvent.click(saveButton)
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled()
      expect(screen.getByText('Address updated successfully!')).toBeInTheDocument()
    })
  })

  it('shows error toast on mutation failure', async () => {
    mockMutate.mockRejectedValueOnce(new Error('Network error'))
    render(
      <AllTheProviders>
        <AddressForm />
      </AllTheProviders>
    )
    const saveButton = screen.getByText('Save')
    fireEvent.click(saveButton)
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled()
      expect(screen.getByText(/Failed to update address: Network error/)).toBeInTheDocument()
    })
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

  it('calls onChange when field value changes', () => {
    const onChange = jest.fn()
    render(
      <AllTheProviders>
        <AddressForm onChange={onChange} />
      </AllTheProviders>
    )
    const cityInput = screen.getByPlaceholderText('e.g. New York, Los Angeles')
    fireEvent.change(cityInput, { target: { value: 'San Francisco' } })
    expect(onChange).toHaveBeenCalled()
  })

  it('displays error message if mutation error exists', () => {
    mockUseGraphQLMutation.mockReturnValueOnce({ mutate: mockMutate, loading: false, error: { message: 'Mutation failed' } })
    render(
      <AllTheProviders>
        <AddressForm />
      </AllTheProviders>
    )
    expect(screen.getByText(/Error: Mutation failed/)).toBeInTheDocument()
  })
})

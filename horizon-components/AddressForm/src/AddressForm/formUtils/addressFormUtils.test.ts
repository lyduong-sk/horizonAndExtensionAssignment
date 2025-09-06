import { buildAddressMutationInput } from './addressFormUtils'

describe('buildAddressMutationInput', () => {
  it('should build input object with correct mapped fields and objectUid', () => {
    const fields = {
      street: { label: 'Street', mappedFieldValue: '123 Main St' },
      city: { label: 'City', mappedFieldValue: 'New York' },
      state: { label: 'State', mappedFieldValue: 'NY' }
    }
    const props = {
      streetMappedField: 'street_address',
      cityMappedField: 'city_name',
      stateMappedField: 'state_code'
    }
    const record = { uid: 'abc123' }
    const recordContext = { objectUid: 'obj456' }
    const result = buildAddressMutationInput(fields, props, record, recordContext)
    expect(result).toEqual({
      UID: 'obj456',
      street_address: '123 Main St',
      city_name: 'New York',
      state_code: 'NY'
    })
  })

  it('should fallback to record.uid if objectUid is missing', () => {
    const fields = {
      street: { label: 'Street', mappedFieldValue: '123 Main St' },
      city: { label: 'City', mappedFieldValue: 'New York' },
      state: { label: 'State', mappedFieldValue: 'NY' }
    }
    const props = {
      streetMappedField: 'street_address',
      cityMappedField: 'city_name',
      stateMappedField: 'state_code'
    }
    const record = { uid: 'abc123' }
    const recordContext = {}
    const result = buildAddressMutationInput(fields, props, record, recordContext)
    expect(result.UID).toBe('abc123')
  })

  it('should fallback to record.id if uid is missing', () => {
    const fields = {
      street: { label: 'Street', mappedFieldValue: '123 Main St' },
      city: { label: 'City', mappedFieldValue: 'New York' },
      state: { label: 'State', mappedFieldValue: 'NY' }
    }
    const props = {
      streetMappedField: 'street_address',
      cityMappedField: 'city_name',
      stateMappedField: 'state_code'
    }
    const record = { id: 'xyz789' }
    const recordContext = {}
    const result = buildAddressMutationInput(fields, props, record, recordContext)
    expect(result.UID).toBe('xyz789')
  })

  it('should not include fields if mappedFieldName is missing', () => {
    const fields = {
      street: { label: 'Street', mappedFieldValue: '123 Main St' },
      city: { label: 'City', mappedFieldValue: 'New York' },
      state: { label: 'State', mappedFieldValue: 'NY' }
    }
    const props = {}
    const record = { uid: 'abc123' }
    const recordContext = {}
    const result = buildAddressMutationInput(fields, props, record, recordContext)
    expect(result).toEqual({ UID: 'abc123' })
  })

  it('should handle missing record and recordContext gracefully', () => {
    const fields = {
      street: { label: 'Street', mappedFieldValue: '123 Main St' },
      city: { label: 'City', mappedFieldValue: 'New York' },
      state: { label: 'State', mappedFieldValue: 'NY' }
    }
    const props = {
      streetMappedField: 'street_address',
      cityMappedField: 'city_name',
      stateMappedField: 'state_code'
    }
    const result = buildAddressMutationInput(fields, props)
    expect(result.UID).toBeUndefined()
    expect(result.street_address).toBe('123 Main St')
    expect(result.city_name).toBe('New York')
    expect(result.state_code).toBe('NY')
  })

  it('should set field value to empty string if mappedFieldValue is missing', () => {
    const fields = {
      street: { label: 'Street', mappedFieldValue: undefined },
      city: { label: 'City', mappedFieldValue: null },
      state: { label: 'State', mappedFieldValue: '' }
    }
    const props = {
      streetMappedField: 'street_address',
      cityMappedField: 'city_name',
      stateMappedField: 'state_code'
    }
    const record = { uid: 'abc123' }
    const result = buildAddressMutationInput(fields, props, record)
    expect(result.street_address).toBe('')
    expect(result.city_name).toBe('')
    expect(result.state_code).toBe('')
  })
})

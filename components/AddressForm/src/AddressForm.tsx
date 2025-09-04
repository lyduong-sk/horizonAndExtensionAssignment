import { useState, ReactNode, FC } from 'react'
import { Button, Link, InputText } from '@skedulo/breeze-ui-react'

// Address field config type
interface AddressFieldConfig {
  key: string
  defaultLabel: string
  mappedFieldPlaceholder: string
}

const addressFields: AddressFieldConfig[] = [
  {
    key: 'street',
    defaultLabel: 'Street Address',
    mappedFieldPlaceholder: 'e.g. 123 Main St, 456 Oak Ave'
  },
  {
    key: 'city',
    defaultLabel: 'City',
    mappedFieldPlaceholder: 'e.g. New York, Los Angeles'
  },
  {
    key: 'state',
    defaultLabel: 'State',
    mappedFieldPlaceholder: 'e.g. NY, CA'
  }
]

type AddressFormState = {
  [key: string]: {
    label: string
    mappedField: string
  }
}

// RecordContext type for Page Builder context
interface RecordContext {
  objectUid?: string
  resourceUid?: string
  resourceName?: string
}

type Props = {
  streetLabel?: string
  streetMappedField?: string
  cityLabel?: string
  cityMappedField?: string
  stateLabel?: string
  stateMappedField?: string
  children?: ReactNode
  onChange?: (state: AddressFormState) => void
  record?: any
  recordContext?: RecordContext
}

export const AddressForm: FC<Props> = props => {
  const { children, onChange, record, recordContext } = props
  console.log('props', props)
  window['addressFormProps'] = props // For debugging purposes
  // Initialize state for each address field
  const [fields, setFields] = useState<AddressFormState>(() =>
    addressFields.reduce((acc, field) => {
      acc[field.key] = { label: field.defaultLabel, mappedField: '' }
      return acc
    }, {} as AddressFormState)
  )

  // Handle input changes
  const handleFieldChange = (key: string, type: 'label' | 'mappedField', value: string) => {
    const updated = {
      ...fields,
      [key]: {
        ...fields[key],
        [type]: value
      }
    }
    setFields(updated)
    if (onChange) onChange(updated)
  }

  // Optionally display record info for demonstration
  const recordName = record?.name || 'Unknown'
  const recordId = recordContext?.objectUid
  const isResourcePage = !!recordContext?.resourceUid

  return (
    <div className="tw-flex tw-justify-center tw-min-h-screen tw-bg-gray-50">
      <div className="tw-bg-white tw-rounded-lg tw-shadow-md tw-p-8 tw-w-full tw-max-w-xl">
        <h2 className="tw-mb-6 tw-font-bold tw-text-2xl tw-text-gray-800">Configurable Address Form</h2>
        {/* Display record context info if available */}
        {record && (
          <div className="tw-mb-6 tw-text-sm tw-text-gray-500">
            <div>Current Record: {recordName}</div>
            {recordId && <div>Record ID: {recordId}</div>}
            {isResourcePage && <div>Resource: {recordContext?.resourceName}</div>}
          </div>
        )}
        <form className="tw-space-y-8">
          {addressFields.map(field => {
            // Use the label prop if truthy, otherwise use default label
            const labelValue = props[`${field.key}Label`]
              ? props[`${field.key}Label`]
              : `Custom label for ${field.defaultLabel}`
            return (
              <div key={field.key} className="tw-grid tw-items-center">
                <InputText
                  label={`${labelValue}`}
                  value={fields[field.key].mappedField}
                  onChange={e => handleFieldChange(field.key, 'mappedField', e.target.value)}
                  name={`${field.key}-mappedField`}
                  id={`${field.key}-mappedField`}
                  placeholder={field.mappedFieldPlaceholder}
                  className="tw-w-full tw-flat"
                />
              </div>
            )
          })}
        </form>
        <div className="tw-mt-8">{children}</div>
      </div>
    </div>
  )
}

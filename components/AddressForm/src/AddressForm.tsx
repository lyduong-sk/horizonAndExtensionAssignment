import { useState, ReactNode } from 'react'
import { Button, Link, InputText } from '@skedulo/breeze-ui-react'
import { CoreEventType, useEventBus } from '@skedulo/horizon-core'

// Address field config type
interface AddressFieldConfig {
  key: string;
  defaultLabel: string;
  mappedFieldPlaceholder: string;
}

const addressFields: AddressFieldConfig[] = [
  {
    key: 'street',
    defaultLabel: 'Street Address',
    mappedFieldPlaceholder: 'e.g. SiteAddressStreet, HomeAddressStreet',
  },
  {
    key: 'city',
    defaultLabel: 'City',
    mappedFieldPlaceholder: 'e.g. SiteAddressCity, HomeAddressCity',
  },
  {
    key: 'state',
    defaultLabel: 'State',
    mappedFieldPlaceholder: 'e.g. SiteAddressState, HomeAddressState',
  },
]

type AddressFormState = {
  [key: string]: {
    label: string;
    mappedField: string;
  }
}

type Props = {
  children?: ReactNode;
  onChange?: (state: AddressFormState) => void;
}

export const AddressForm = ({ children, onChange }: Props) => {
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
        [type]: value,
      },
    }
    setFields(updated)
    if (onChange) onChange(updated)
  }

  return (
    <div className="tw-p-4">
      <h2 className="tw-mb-4 tw-font-bold">Configurable Address Form</h2>
      <div className="tw-space-y-8">
        {addressFields.map(field => (
          <div key={field.key} className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
            <InputText
              label={`Custom Label for ${field.defaultLabel}`}
              value={fields[field.key].label}
              onChange={e => handleFieldChange(field.key, 'label', e.target.value)}
              name={`${field.key}-label`}
              id={`${field.key}-label`}
              placeholder={`Label for ${field.defaultLabel}`}
            />
            <InputText
              label={`Mapped Field for ${field.defaultLabel}`}
              value={fields[field.key].mappedField}
              onChange={e => handleFieldChange(field.key, 'mappedField', e.target.value)}
              name={`${field.key}-mappedField`}
              id={`${field.key}-mappedField`}
              placeholder={field.mappedFieldPlaceholder}
            />
          </div>
        ))}
      </div>
      <div className="tw-mt-8">
        {children}
      </div>
    </div>
  )
}

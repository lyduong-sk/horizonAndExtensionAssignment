import { useState, ReactNode, FC, useEffect } from 'react'
import { Button, Link, InputText } from '@skedulo/breeze-ui-react'
import { ApiClientV1 } from '@skedulo/horizon-core'

// Address field config type
interface IAddressFieldConfig {
  key: string
  defaultLabel: string
  mappedFieldPlaceholder: string
}

const addressFields: IAddressFieldConfig[] = [
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

type TAddressFormState = {
  [key: string]: {
    label: string
    mappedFieldValue: string
  }
}

// RecordContext type for Page Builder context
interface IRecordContext {
  objectUid?: string
  resourceUid?: string
  resourceName?: string
}

type TProps = {
  streetLabel?: string
  streetMappedField?: string
  cityLabel?: string
  cityMappedField?: string
  stateLabel?: string
  stateMappedField?: string
  children?: ReactNode
  onChange?: (state: TAddressFormState) => void
  record?: any
  recordContext?: IRecordContext
}

export const AddressForm: FC<TProps> = props => {
  /* Common */
  const { children, onChange, record, recordContext } = props
  console.log('props', props)
  window['addressFormProps'] = props // For debugging purposes

  /* Initial Data */
  // Set initial data from props and record
  const [fields, setFields] = useState<TAddressFormState>(() =>
    addressFields.reduce((prevFieldObj, currFieldObj) => {
      const mappedFieldName = props[`${currFieldObj.key}MappedField` as keyof TProps] as string | undefined
      const mappedFieldValue = mappedFieldName && record ? (record[mappedFieldName] ?? '') : ''
      prevFieldObj[currFieldObj.key] = { label: currFieldObj.defaultLabel, mappedFieldValue }
      return prevFieldObj
    }, {} as TAddressFormState)
  )

  // Update fields when record or mapped field props change
  useEffect(() => {
    setFields(
      addressFields.reduce((prevFieldObj, nextFieldObj) => {
        const mappedFieldName = props[`${nextFieldObj.key}MappedField` as keyof TProps] as string | undefined
        const mappedFieldValue = mappedFieldName && record ? (record[mappedFieldName] ?? '') : ''
        prevFieldObj[nextFieldObj.key] = { label: nextFieldObj.defaultLabel, mappedFieldValue }
        return prevFieldObj
      }, {} as TAddressFormState)
    )
  }, [record, props.streetMappedField, props.cityMappedField, props.stateMappedField])

  // Handle input changes
  const handleFieldChange = (key: string, type: 'label' | 'mappedFieldValue', value: string) => {
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

  /* Data for rendering */
  // Display record info for demonstration
  const recordName = record?.name || 'Unknown'
  const recordId = recordContext?.objectUid
  const isResourcePage = !!recordContext?.resourceUid

  /* Render */
  return (
    <div className="tw-flex tw-justify-center tw-min-h-screen tw-bg-gray-50">
      <div className="tw-bg-white tw-rounded-lg tw-shadow-md tw-p-8 tw-w-full tw-max-w-xl">
        <h2 className="tw-mb-6 tw-font-bold tw-text-2xl tw-text-gray-800">Configurable Address Form</h2>
        {record && (
          <div className="tw-mb-6 tw-text-sm tw-text-gray-500">
            <div>Current Record: {recordName}</div>
            {recordId && <div>Record ID: {recordId}</div>}
            {isResourcePage && <div>Resource: {recordContext?.resourceName}</div>}
          </div>
        )}
        <form
          className="address-form tw-space-y-8"
          onSubmit={e => {
            e.preventDefault()
          }}
        >
          {addressFields.map(field => {
            // Use the label prop if truthy, otherwise use default label
            const labelValue = props[`${field.key}Label`]
              ? props[`${field.key}Label`]
              : `Custom label for ${field.defaultLabel}`
            return (
              <div key={field.key} className="tw-grid tw-grid-cols-1 md:tw-grid-cols-5 tw-gap-4 tw-items-center">
                <div className="tw-col-span-3">
                  <InputText
                    label={`${labelValue}`}
                    value={fields[field.key].mappedFieldValue}
                    onChange={e => handleFieldChange(field.key, 'mappedFieldValue', e.target.value)}
                    name={`${field.key}-mappedFieldValue`}
                    id={`${field.key}-mappedFieldValue`}
                    placeholder={field.mappedFieldPlaceholder}
                    className="tw-w-full tw-flat"
                  />
                </div>
              </div>
            )
          })}
          <div className="tw-flex tw-mt-8">
            <button
              type="button"
              className="tw-bg-blue-600 tw-text-white tw-px-6 tw-py-2 tw-rounded tw-flat tw-font-semibold tw-shadow-sm hover:tw-bg-blue-700 focus:tw-outline-none"
              onClick={() => {
                // Build the update object
                const updateObj: Record<string, string> = {}
                if (props.streetMappedField) {
                  updateObj[props.streetMappedField] = fields.street.mappedFieldValue
                }
                if (props.cityMappedField) {
                  updateObj[props.cityMappedField] = fields.city.mappedFieldValue
                }
                if (props.stateMappedField) {
                  updateObj[props.stateMappedField] = fields.state.mappedFieldValue
                }
                console.log('Mapped update object:', updateObj)
              }}
            >
              Save
            </button>
          </div>
        </form>
        <div className="tw-mt-8">{children}</div>
      </div>
    </div>
  )
}

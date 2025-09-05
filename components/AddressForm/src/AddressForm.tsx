import { useState, ReactNode, FC, useEffect } from 'react'
import { Button, InputText } from '@skedulo/breeze-ui-react'
import { gql } from '@apollo/client'
import { useGraphQLMutation } from '@skedulo/horizon-core'
import { ToastItem } from './Toast'
import { ToastContainer } from './ToastContainer'

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

const UPDATE_ACCOUNTS_MUTATION = gql`
  mutation updateAccounts($input: UpdateAccounts!) {
    schema {
      updateAccounts(input: $input)
    }
  }
`

export const AddressForm: FC<TProps> = props => {
  /* Common */
  const { children, onChange, record, recordContext } = props
  console.log('AddressForm props:', props)
  const {mutate, loading, error} = useGraphQLMutation({
    mutation: UPDATE_ACCOUNTS_MUTATION,
    resourceName: 'Accounts'
  })

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



  /* Toast */
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const pushToast = (partial: Omit<ToastItem, 'id'>) => {
    setToasts(prev => [...prev, { id: Math.random().toString(36).slice(2), ...partial }]);
  };
  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));


  /* Render */
  return (
    <div className="tw-flex tw-justify-center tw-min-h-screen tw-bg-gray-50">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
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
          {/* Address Fields */}
          {addressFields.map(field => (
            <div key={field.key} className="tw-flex tw-flex-col tw-gap-2">
              <label className="tw-font-semibold tw-text-gray-700">{fields[field.key].label}</label>
              <InputText
                value={fields[field.key].mappedFieldValue}
                placeholder={field.mappedFieldPlaceholder}
                onChange={e =>
                  handleFieldChange(field.key, 'mappedFieldValue', (e.target as HTMLInputElement)?.value || '')
                }
              />
            </div>
          ))}
          {/* Save Button */}
          <Button
            className="tw-mt-6"
            onClick={async () => {
              const input: any = {
                UID: recordContext?.objectUid || record?.uid || record?.id
              };
              addressFields.forEach(field => {
                const mappedFieldName = props[`${field.key}MappedField` as keyof TProps] as string | undefined;
                if (mappedFieldName) {
                  input[mappedFieldName] = fields[field.key].mappedFieldValue;
                }
              });
              try {
                await mutate({ variables: { input } });
                pushToast({ type: 'success', message: 'Address updated successfully!' });
              } catch (err: any) {
                pushToast({
                  type: 'danger',
                  message: 'Failed to update address: ' + (err?.message || String(err))
                });
              }
            }}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
          {error && <div className="tw-text-red-600 tw-mt-2">Error: {error.message}</div>}
        </form>
        <div className="tw-mt-8">{children}</div>
      </div>
    </div>
  )
}

import { useState, ReactNode, FC, useEffect } from 'react'
import { Button, InputText } from '@skedulo/breeze-ui-react'
import { gql } from '@apollo/client'
import { useGraphQLMutation } from '@skedulo/horizon-core'
import { IToastItem } from '../Toast'
import { ToastContainer } from '../Toast/ToastContainer'
import { buildAddressMutationInput } from './formUtils/addressFormUtils'

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

const UPDATE_JOBS_MUTATION = gql`
  mutation updateJob($updateInput: UpdateJobs!) {
    schema {
      updateJobs(input: $updateInput)
    }
  }
`

const UPDATE_ACCOUNTS_MUTATION = gql`
  mutation updateAccounts($input: UpdateAccounts!) {
    schema {
      updateAccounts(input: $input)
    }
  }
`

export const buildInitialFields = (props: TProps, record?: any): TAddressFormState =>
  addressFields.reduce((prevFieldObj, currFieldObj) => {
    const mappedFieldName = props[`${currFieldObj.key}MappedField` as keyof TProps] as string | undefined
    const mappedFieldValue = mappedFieldName && record ? (record[mappedFieldName] ?? '') : ''
    const fieldLabel = props[`${currFieldObj.key}Label` as keyof TProps] || currFieldObj.defaultLabel
    prevFieldObj[currFieldObj.key] = { label: fieldLabel, mappedFieldValue }
    return prevFieldObj
  }, {} as TAddressFormState)

export const AddressForm: FC<TProps> = props => {

  /* Common */
  const { children, onChange, record, recordContext } = props
  const { mutate, loading, error } = useGraphQLMutation({
    mutation: UPDATE_ACCOUNTS_MUTATION, // TODO: Infer from input fields to update for account/jobs/etc...
    resourceName: 'Accounts'
  })

  /* Initial Data */
  // Set initial data from props and record
  const [fields, setFields] = useState<TAddressFormState>(() => buildInitialFields(props, record))

  // Update fields when record or mapped field props change
  useEffect(() => {
    setFields(buildInitialFields(props, record))
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

  /* Toast */
  const [toasts, setToasts] = useState<IToastItem[]>([])
  const pushToast = (partial: Omit<IToastItem, 'id'>) => {
    setToasts(prev => [...prev, { id: Math.random().toString(36).slice(2), ...partial }])
  }
  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id))

  /* Data for rendering */
  const recordName = record?.name || 'Unknown'
  const recordId = recordContext?.objectUid
  const isResourcePage = !!recordContext?.resourceUid

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
              <InputText
                id={field.key}
                label={fields[field.key].label}
                value={fields[field.key].mappedFieldValue}
                placeholder={field.mappedFieldPlaceholder}
                data-testid={`address-input-${field.key}`}
                onChange={e =>
                  handleFieldChange(field.key, 'mappedFieldValue', (e.target as HTMLInputElement)?.value || '')
                }
              />
            </div>
          ))}
          {/* Save Button */}
          <Button
            className="tw-mt-6"
            data-testid="address-save-button"
            onClick={async () => {
              const input = buildAddressMutationInput(fields, props, record, recordContext)
              try {
                await mutate({ variables: { input } })
                pushToast({ type: 'success', message: 'Address updated successfully!' })
              } catch (err: any) {
                pushToast({
                  type: 'danger',
                  message: 'Failed to update address: ' + (err?.message || String(err))
                })
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

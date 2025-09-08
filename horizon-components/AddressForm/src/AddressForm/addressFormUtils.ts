
import { TProps, TAddressFormState, IAddressFieldConfig } from './AddressForm.type'

export function buildAddressMutationInput(
  fields: Record<string, { label: string; mappedFieldValue: string }>,
  props: Record<string, any>,
  record?: any,
  recordContext?: { objectUid?: string }
): Record<string, any> {
  const input: Record<string, any> = {
    UID: recordContext?.objectUid || record?.uid || record?.id
  }
  ;['street', 'city', 'state'].forEach(key => {
    const mappedFieldName = props[`${key}MappedField`]
    if (mappedFieldName) {
      input[mappedFieldName] = fields[key]?.mappedFieldValue ?? ''
    }
  })
  return input
}
export const addressFields: IAddressFieldConfig[] = [
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
export const buildInitialFields = (props: TProps, record?: any): TAddressFormState =>
  addressFields.reduce((prevFieldObj, currFieldObj) => {
    const mappedFieldName = props[`${currFieldObj.key}MappedField` as keyof TProps] as string | undefined
    const mappedFieldValue = mappedFieldName && record ? (record[mappedFieldName] ?? '') : ''
    const fieldLabel = props[`${currFieldObj.key}Label` as keyof TProps] || currFieldObj.defaultLabel
    prevFieldObj[currFieldObj.key] = { label: fieldLabel, mappedFieldValue }
    return prevFieldObj
  }, {} as TAddressFormState)

import { ReactNode } from 'react'

export interface IAddressFieldConfig {
  key: string
  defaultLabel: string
  mappedFieldPlaceholder: string
}

export type TAddressFormState = {
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

export type TProps = {
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

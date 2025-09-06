import { InputText, Table, TableHead, TableBody, TableRow, TableCell, Button } from '@skedulo/breeze-ui-react'
import React, { useCallback, useEffect, useState } from 'react'
import { IToastItem } from '../Toast'
import { ToastContainer } from '../Toast/ToastContainer'

export type AddressFormProperties = {
  streetLabel: string
  streetMappedField: string
  cityLabel: string
  cityMappedField: string
  stateLabel: string
  stateMappedField: string
}

export type AddressFormEditorProps = {
  properties: AddressFormProperties
  onPropertiesChange: (properties: AddressFormProperties) => void
}

export const AddressFormEditor: React.FC<AddressFormEditorProps> = ({ properties, onPropertiesChange }) => {
  /* Toast */
  const [toasts, setToasts] = useState<IToastItem[]>([])
  const pushToast = (partial: Omit<IToastItem, 'id'>) => {
    setToasts(prev => [...prev, { id: Math.random().toString(36).slice(2), ...partial }])
  }
  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id))

  /* Initial Properties */
  const [values, setValues] = useState<AddressFormProperties>({ ...properties })
  // useEffect(() => {
  //   setValues({ ...properties })
  // }, [properties])

  const handleChange = useCallback(
    (field: keyof AddressFormProperties) => (e: any) => {
      const newValue = e.detail?.value ?? ''
      const newValues = { ...values, [field]: newValue }
      setValues(newValues)
      onPropertiesChange({
        ...properties,
        [field]: newValue
      })
    },
    [values]
  )

  /* Save properties */
  // const handleSave = useCallback(() => {
  //   console.log('values', values)
  //   debugger
  //   onPropertiesChange({...values})
  //   pushToast({ type: 'success', message: 'Values saved!' })
  // }, [values, onPropertiesChange])

  return (
    <div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Table>
        <TableHead sticky={true} cells={[{ name: 'Field' }, { name: 'Label' }, { name: 'Mapped Field' }]} />
        <TableBody>
          <TableRow key="street">
            <TableCell>Street</TableCell>
            <TableCell>
              <InputText
                value={values.streetLabel}
                onChange={handleChange('streetLabel')}
                size="full"
                placeholder="Street Label"
                required
              />
            </TableCell>
            <TableCell>
              <InputText
                value={values.streetMappedField}
                onChange={handleChange('streetMappedField')}
                size="full"
                placeholder="Street Mapped Field"
                required
              />
            </TableCell>
          </TableRow>
          <TableRow key="city">
            <TableCell>City</TableCell>
            <TableCell>
              <InputText
                value={values.cityLabel}
                onChange={handleChange('cityLabel')}
                size="full"
                placeholder="City Label"
                required
              />
            </TableCell>
            <TableCell>
              <InputText
                value={values.cityMappedField}
                onChange={handleChange('cityMappedField')}
                size="full"
                placeholder="City Mapped Field"
                required
              />
            </TableCell>
          </TableRow>
          <TableRow key="state">
            <TableCell>State</TableCell>
            <TableCell>
              <InputText
                value={values.stateLabel}
                onChange={handleChange('stateLabel')}
                size="full"
                placeholder="State Label"
                required
              />
            </TableCell>
            <TableCell>
              <InputText
                value={values.stateMappedField}
                onChange={handleChange('stateMappedField')}
                size="full"
                placeholder="State Mapped Field"
                required
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <div className="tw-mt-4">
        {/*<Button onClick={handleSave}>Save</Button>*/}
      </div>
    </div>
  )
}

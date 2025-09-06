import { ComponentMetadata, registerComponent } from '@skedulo/horizon-core'

import { name } from '../package.json'
import { AddressForm } from './AddressForm'
import { AddressFormEditor } from './AddressFormEditor'

registerComponent(name, 'AddressFormEditor', AddressFormEditor, {
  name: 'Address Form Editor',
  description: 'Editor for configuring the Address Form component'
})

registerComponent(name, 'AddressForm', AddressForm, {
  name: 'Lys Address Form',
  description: 'Configurable Address Form for mapping address fields to Skedulo Object fields',
  properties: {
    config: {
      type: 'string',
      title: 'config',
      description: 'The configuration for the address entry component (JSON format)',
      required: false
    }
  },
  propertiesEditor: {
    component: 'AddressFormEditor'
  }
} satisfies ComponentMetadata)

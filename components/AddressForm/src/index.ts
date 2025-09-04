import { ComponentMetadata, registerComponent } from '@skedulo/horizon-core'

import { name } from '../package.json'
import { AddressForm } from './AddressForm'

/**
 * Register the component so that it can be used with the Horizon platform
 *
 * Once a component is registered, it can be referenced using the PlatformComponent tag
 * in a template, or directly from the Page Builder by selecting if metadata is provided.
 *
 * <PlatformComponent packageName="horizon-scripts-example" componentName="ExampleComponent" />
 */
registerComponent(
  name,
  'AddressForm',
  AddressForm,
  {
    name: 'Lys Address Form',
    description: 'Configurable Address Form for mapping address fields to Skedulo Object fields',
    properties: {
      streetLabel: {
        type: 'string',
        title: 'Street Address Label',
        description: 'Custom label for the Street Address field',
        required: true
      },
      streetMappedField: {
        type: 'string',
        title: 'Street Address Mapped Field',
        description: 'Skedulo Object field to map for Street Address',
        required: true
      },
      cityLabel: {
        type: 'string',
        title: 'City Label',
        description: 'Custom label for the City field',
        required: true
      },
      cityMappedField: {
        type: 'string',
        title: 'City Mapped Field',
        description: 'Skedulo Object field to map for City',
        required: true
      },
      stateLabel: {
        type: 'string',
        title: 'State Label',
        description: 'Custom label for the State field',
        required: true
      },
      stateMappedField: {
        type: 'string',
        title: 'State Mapped Field',
        description: 'Skedulo Object field to map for State',
        required: true
      }
    }
  } satisfies ComponentMetadata
)

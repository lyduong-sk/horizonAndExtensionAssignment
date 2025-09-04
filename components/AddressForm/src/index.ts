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
  // Metadata is optional, but if provided, it will be used to display the component in the Page Builder
  // Only components with metadata will be available in the Page Builder.
  {
    name: 'Example Component',
    description: 'Example Component for testing horizon-scripts',
    properties: {
      // Define any properties that the component will use from Page Builder
      // See PropertyMetadata interface for the complete schema definition
      countStart: {
        type: 'number',
        title: 'Count start',
        description: 'The number to start the count at',
        required: true
      }
    }
  } satisfies ComponentMetadata
)


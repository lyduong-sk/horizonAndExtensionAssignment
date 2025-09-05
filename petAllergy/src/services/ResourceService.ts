import { TransformerInput } from '@skedulo/optimization-manager-client'
import { ExecutionContext } from '@skedulo/pulse-solution-services'

/**
 * Fetches resources with custom field IsAllergicToPet using Pulse Solution Services.
 * @param transformerInput - The optimization extension input
 * @param context - The initialized Pulse Solution Services execution context
 * @returns Array of resources with UID, Name, and IsAllergicToPet
 */
export default async function fetchResourcesWithAllergy(
  transformerInput: TransformerInput,
  context: ExecutionContext
) {
  const resourceIds = transformerInput.productData.resources.map(resource => resource.UID)
  if (resourceIds.length === 0) return []
  const resourceIdsFilterString = resourceIds.map(id => `'${id}'`).join(',')

  // Build query for Resources with custom field
  const queryBuilder = context.newQueryBuilder({
    objectName: 'Resources',
    operationName: 'fetchResources',
    readOnly: true
  })
  queryBuilder.withFields(['UID', 'Name', 'IsAllergicToPet'])
  queryBuilder.withFilter(`UID IN [${resourceIdsFilterString}]`)
  queryBuilder.withOrderBy('Name ASC')

  const queryResult = await queryBuilder.execute()
  return queryResult.records
}

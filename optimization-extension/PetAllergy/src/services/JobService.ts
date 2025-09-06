import { TransformerInput } from '@skedulo/optimization-manager-client'
import { ExecutionContext } from '@skedulo/pulse-solution-services'

/**
 * Fetches jobs with custom field HasPet using Pulse Solution Services.
 * @param transformerInput - The optimization extension input
 * @param context - The initialized Pulse Solution Services execution context
 * @returns Array of jobs with UID, Name, and HasPet
 */
export default async function fetchJobsWithHasPet(
  transformerInput: TransformerInput,
  context: ExecutionContext
) {
  const jobIds = transformerInput.productData.jobs.map(job => job.UID)
  if (jobIds.length === 0) return []
  const jobIdsFilterString = jobIds.map(id => `'${id}'`).join(',')

  // Build query for Jobs with custom field
  const queryBuilder = context.newQueryBuilder({
    objectName: 'Jobs',
    operationName: 'fetchJobs',
    readOnly: true
  })
  queryBuilder.withFields(['UID', 'Name', 'HasPet'])
  queryBuilder.withFilter(`UID IN [${jobIdsFilterString}]`)
  queryBuilder.withOrderBy('Name ASC')

  const queryResult = await queryBuilder.execute()
  return queryResult.records
}

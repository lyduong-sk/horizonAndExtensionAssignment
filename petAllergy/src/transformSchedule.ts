import { TransformerInput, TransformerOutput } from '@skedulo/optimization-manager-client'

/**
 * Transforms the schedule by enforcing the pet allergy constraint:
 * Engineers (resources) who are allergic to pets will not be assigned to jobs where HasPet is true.
 * If job.HasPet === true and resource.IsAllergicToPet === true, allocation is excluded.
 *
 * @param transformerInput - The input containing jobs, resources, and feature model.
 * @returns The output with filtered allocations in the feature model.
 *
 * @example
 * // If job.HasPet === true and resource.IsAllergicToPet === true, allocation is excluded.
 */
const transformSchedule = async (transformerInput: TransformerInput): Promise<TransformerOutput> => {
  const { productData, featureModel } = transformerInput
  console.log('petAllergy > transformerInput', transformerInput)
  const jobs = productData.jobs
  const resources = productData.resources
  const allocations = featureModel.allocations

  // Get job & resource
  const jobMap = new Map(jobs.map(job => [job.UID, job]))
  const resourceMap = new Map(resources.map(resource => [resource.UID, resource]))

  // Filter out
  const filteredAllocations = allocations.filter(allocation => {
    // Find job by groupId, JobId, or JobUID
    console.log('petAllergy > allocation', allocation)
    let job
    if (allocation.groupId && jobMap.has(allocation.groupId)) {
      job = jobMap.get(allocation.groupId)
      // @ts-ignore
    } else if (allocation.JobId && jobMap.has(allocation.JobId)) {
      // @ts-ignore
      job = jobMap.get(allocation.JobId)
      // @ts-ignore
    } else if (allocation.JobUID && jobMap.has(allocation.JobUID)) {
      // @ts-ignore
      job = jobMap.get(allocation.JobUID)
    }

    // Find resource by resourceId
    let resource = undefined
    if (allocation.resourceId && resourceMap.has(allocation.resourceId)) {
      resource = resourceMap.get(allocation.resourceId)
    }

    if (!job || !resource) {
      return true
    }
    console.log('petAllergy > job', job)
    console.log('petAllergy > resource', resource)

    const hasPet = (job as any).HasPet
    const isAllergicToPet = (resource as any).IsAllergicToPet

    // Exclude these
    return !(hasPet && isAllergicToPet)
  })

  // Build new feature model with filtered allocations
  const newFeatureModel = {
    ...featureModel,
    allocations: filteredAllocations
  }

  return {
    productData,
    featureModel: newFeatureModel
  }
}

export default transformSchedule

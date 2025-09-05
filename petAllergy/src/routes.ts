/**
 * Describe the entry-point into the "skedulo-function" by updating the
 * array returned by the `getRoutes` method with additional routes
 */
import * as pathToRegExp from 'path-to-regexp'

import { TransformerInput, TransformerOutput, createOptimizationRoutes } from '@skedulo/optimization-manager-client'
import { ExecutionContext } from '@skedulo/pulse-solution-services'
import { FunctionRoute } from '@skedulo/sdk-utilities'
import fetchResourcesWithAllergy from './services/ResourceService'
import fetchJobsWithHasPet from './services/JobService'

// tslint:disable-next-line:no-empty-interface
interface RequestPayload {}

export function getCompiledRoutes() {
  return getRoutes().map(route => {
    const regex = pathToRegExp(route.path)

    return {
      regex,
      method: route.method,
      handler: route.handler
    }
  })
}

function getRoutes(): FunctionRoute[] {
  return [
    {
      method: 'get',
      path: '/ping',
      handler: async (__, headers, method, path, skedContext) => {
        // const apiServer = skedContext.auth.baseUrl;

        return {
          status: 200,
          body: { result: 'pong' }
        }
      }
    },
    // Optimization extension route with context initialization
    ...createOptimizationRoutes(async (transformerInput: TransformerInput): Promise<TransformerOutput> => {
      /* Initialize Pulse Solution Services execution context for API/data access. */
      const limits = {
        totalCalls: 50,
        maxConcurrentRequests: 10,
        maxMethodExecutionTimeMs: 10000,
        throwOnViolation: false // Don't throw if limits exceeded (can change later)
      }
      const context = ExecutionContext.fromCredentials(
        {
          apiServer: transformerInput.configuration.basePath,
          apiToken: transformerInput.configuration.accessToken
        },
        {
          requestSource: 'petAllergy-extension',
          userAgent: 'petAllergy-function'
        },
        limits
      )
      // For now, just log context info for debugging
      console.log('Initialized Pulse Solution Services context:', context)

      /* Transform */
      const { productData, featureModel } = transformerInput
      // Fetch resources with IsAllergicToPet using Pulse Solution Services
      const enrichedResources = await fetchResourcesWithAllergy(transformerInput, context)
      console.log('petAllergy > enrichedResources', enrichedResources)
      // Fetch jobs with HasPet using Pulse Solution Services
      const enrichedJobs = await fetchJobsWithHasPet(transformerInput, context)
      console.log('petAllergy > enrichedJobs', enrichedJobs)
      // Build maps for fast lookup
      const resourceMap = new Map(enrichedResources.map(resource => [resource.UID, resource]))
      const jobMap = new Map(enrichedJobs.map(job => [job.UID, job]))

      console.log('petAllergy > transformerInput', transformerInput)
      const jobs = productData.jobs
      const resources = productData.resources
      const allocations = featureModel.allocations

      // Get job & resource
      const jobMapFromProductData = new Map(jobs.map(job => [job.UID, job]))
      const resourceMapFromProductData = new Map(resources.map(resource => [resource.UID, resource]))

      // Get job & resources with custom fields (HasPet & IsAllergicToPet)
      // [Agent Job]


      // Filter out
      const filteredAllocations = allocations.filter(allocation => {
        // Find job by groupId, JobId, or JobUID
        console.log('petAllergy > allocation', allocation)
        let job
        if (allocation.groupId && jobMap.has(allocation.groupId)) {
          job = jobMap.get(allocation.groupId)
          //@ts-ignore
        } else if (allocation.JobId && jobMap.has(allocation.JobId)) {
          //@ts-ignore
          job = jobMap.get(allocation.JobId)
          //@ts-ignore
        } else if (allocation.JobUID && jobMap.has(allocation.JobUID)) {
          //@ts-ignore
          job = jobMap.get(allocation.JobUID)
        }
        // Find resource by resourceId using enriched data
        let resource = undefined
        if (allocation.resourceId && resourceMap.has(allocation.resourceId)) {
          resource = resourceMap.get(allocation.resourceId)
        }
        if (!job || !resource) {
          return true
        }
        // Use custom field from enriched job and resource
        const hasPet = (job as any).HasPet
        const isAllergicToPet = (resource as any).IsAllergicToPet

        // Exclude these
        return !(hasPet && isAllergicToPet)
      })

      /* Build new feature model with filtered allocations */
      const newFeatureModel = {
        ...featureModel,
        allocations: filteredAllocations
      }

      return {
        productData,
        featureModel: newFeatureModel
      }
    })
  ]
}

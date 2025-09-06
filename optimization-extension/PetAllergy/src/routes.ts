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

      /* Transform */
      const { productData, featureModel } = transformerInput
      // Fetch resources with IsAllergicToPet using Pulse Solution Services
      const enrichedResources = await fetchResourcesWithAllergy(transformerInput, context)
      console.log('--- start ---')
      console.log('petAllergy > enrichedResources', JSON.stringify(enrichedResources))
      console.log('--- end ---')
      // Fetch jobs with HasPet using Pulse Solution Services
      const enrichedJobs = await fetchJobsWithHasPet(transformerInput, context)
      console.log('--- start ---')
      console.log('petAllergy > enrichedJobs', JSON.stringify(enrichedJobs))
      console.log('--- end ---')
      // Build maps for fast lookup
      const resourceMap = new Map(enrichedResources.map(resource => [resource.UID, resource]))
      const jobMap = new Map(enrichedJobs.map(job => [job.UID, job]))

      // Tag allocations with attribute requirements if job has pet
      featureModel.allocations.forEach(allocation => {
        const job = jobMap.get(allocation.groupId)
        if (job && job.HasPet) {
          allocation.attributeRequirements = allocation.attributeRequirements || []
          allocation.attributeRequirements.push({ id: 'PetOk' })
        }
      })
      // Tag resources with attributes if NOT allergic to pets
      featureModel.resources.forEach(resource => {
        const enrichedResource = resourceMap.get(resource.id)
        if (enrichedResource && !enrichedResource.IsAllergicToPet) {
          resource.attributes = resource.attributes || []
          resource.attributes.push({ id: 'PetOk' })
        }
      })

      /* Build new feature model with filtered allocations */
      console.log('--- start ---')
      console.log('petAllergy > featureModel', JSON.stringify(featureModel))
      console.log('--- end ---')

      return {
        productData,
        featureModel
      }
    })
  ]
}

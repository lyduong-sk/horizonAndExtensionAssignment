/**
 * Describe the entry-point into the "skedulo-function" by updating the
 * array returned by the `getRoutes` method with additional routes
 */
import * as pathToRegExp from 'path-to-regexp'

import { createOptimizationRoutes } from '@skedulo/optimization-manager-client'
import { FunctionRoute } from '@skedulo/sdk-utilities'
import transformSchedule from './transformSchedule'

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
    ...createOptimizationRoutes(transformSchedule)
  ]
}

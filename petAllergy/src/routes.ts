/**
 * Describe the entry-point into the "skedulo-function" by updating the
 * array returned by the `getRoutes` method with additional routes
 */
import * as pathToRegExp from "path-to-regexp";

import { FunctionRoute } from "@skedulo/sdk-utilities";
import {createOptimizationRoutes} from "@skedulo/optimization-manager-client";
import {
  TransformerInput,
  TransformerOutput
} from "@skedulo/optimization-manager-client/dist/transformers/scheduleTransformer";

// tslint:disable-next-line:no-empty-interface
interface RequestPayload {}

export function getCompiledRoutes() {
  return getRoutes().map((route) => {
    const regex = pathToRegExp(route.path);

    return {
      regex,
      method: route.method,
      handler: route.handler,
    };
  });
}

const transformSchedule = async (transformerInput: TransformerInput): Promise<TransformerOutput> => {
  const allocationIds = transformerInput.featureModel.allocations.map((allocation) => allocation.id);
  // Create a single resource dependency for all allocations. This means that every allocation will be given to one resource.
  const resourceDependencies = [{
    allocationIds: allocationIds,
  }]
  return {
    productData: transformerInput.productData,
    featureModel: {
      ...transformerInput.featureModel,
      resourceDependencies,
    },
  };
}

function getRoutes(): FunctionRoute[] {
  return [
    {
      method: "get",
      path: "/ping",
      handler: async (__, headers, method, path, skedContext) => {
        // const apiServer = skedContext.auth.baseUrl;

        return {
          status: 200,
          body: { result: "pong"},
        };
      },
    },
    ...createOptimizationRoutes(transformSchedule)
  ];
}

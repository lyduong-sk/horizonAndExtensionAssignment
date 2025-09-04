# Pulse Solution Services

- [Overview](#pulse-solution-services)
- [Installation](#installation)
- [Quick Start](#quick-start)
    - [Initialize Execution Context](#initialize-execution-context)
    - [Execution Limits](#execution-limits)
    - [API Clients](#api-clients)
        - [Metadata Client](#metadata-client)
        - [Vocabulary Client](#vocabulary-client)
        - [GraphQL Client](#graphql-client)
        - [Config Variable Client](#config-variable-client)
        - [Org Preferences Client](#org-preferences-client)
        - [Config Features (Feature Flags) Client](#config-features-feature-flags-client)
        - [Mobile Notification Client](#mobile-notification-client)
        - [Configuration Templates](#configuration-templates)
        - [Geo API Client](#geo-api-client)
        - [Availability API Client](#availability-api-client)
        - [Files API Client](#files-api-client)
        - [Artifact Client](#artifact-client)
    - [GraphQL Service](#graphql-service)
        - [Query Data](#query-data)
        - [Query by Pages](#query-by-pages)
        - [Batch Queries](#batch-queries)
        - [Update Data](#update-data)
        - [Upsert Data](#upsert-data)
        - [Batch Mutations](#batch-mutations)
        - [Pagination](#pagination)
    - [Resource Service](#resource-service)
        - [Resource Builder](#resource-builder)
        - [Resource Validator](#resource-validator)
    - [GeoService](#geoservice)
    - [Batch Service](#batch-service)
    - [Lock Service](#lock-service)
    - [Cache Service](#cache-service)
    - [Logging Utils](#logging-utils)

## Overview

**@skedulo/pulse-solution-services** provides common services and utilities for building solutions on the Pulse platform.

## Installation

```bash
npm install @skedulo/pulse-solution-services
```
or
```bash
yarn add @skedulo/pulse-solution-services
```

## Quick Start
### Initialize Execution Context

**From a function**
```javascript
const context = ExecutionContext.fromContext(skedContext, {
  requestSource: "my-cool-project",
  userAgent: "my-cool-function"
});
```

The `requestSource` and `userAgent` options are important for observability and debugging, as they set the value for the `X-Skedulo-Source` and `User-Agent` headers that are automatically included in all requests made within this context.

**From other execution contexts**
```javascript
const context = ExecutionContext.fromCredentials({
  apiServer: user.apiBasePath,
  apiToken: user.accessToken,
}, {
  requestSource: "my-cool-project",
  userAgent: "my-cool-function"
});
```
Once initialized, the context object provides access to the various services detailed in subsequent sections.

### Execution Limits

#### Overview

Execution Limits serve two main purposes:

- Provide execution metrics to help developers optimize their code.
- Ensure system stability by terminating executions that exceed limits. While this is not currently the default behavior, it may be in the future.

By default, the following limit are set:

- Total API Calls: 50
- Max Concurrent Requests: 5
- Max Method Execution Time: 12 seconds

A warning is logged if a limit is violated.

#### Example

**Using default limits**

```javascript
// Initialize the execution context
const context = ExecutionContext.fromContext(skedContext, {
  requestSource: "my-cool-project",
  userAgent: "my-cool-function"
});

// Call services with the context
const artifactClient = context.newArtifactClient(ArtifactType.WEBHOOK);
const webhooks = await artifactClient.list();
const functionPromises = webhooks.map((webhook: any) => artifactClient.get(webhook.name));
await Promise.all(functionPromises);
// Get execution metrics
console.log(context.getExecutionMetrics());
```

**Overriding limits**

```javascript
const limits = {
  totalCalls: 50,
  maxConcurrentRequests: 10,
  maxMethodExecutionTimeMs: 10000,
  throwOnViolation: true // Throws an error if limits are exceeded
};

const context = ExecutionContext.fromContext(skedContext, {
  requestSource: "my-cool-project",
  userAgent: "my-cool-function",
  limits
});
```
### Config Helper
Retrieves the values of configuration variables defined within a function. To use this helper, the execution context must be initialized from `skedContext`.
```javascript
const secretValue = context.configHelper.getString('SECRET_NAME');
```
In addition to `getString()`, other available methods include `getNumber()` and `getJson()`.

### API Clients

#### Base API Client
Handles requests to any Skedulo API that does not have a dedicated API client implementation.

**GET request**
```javascript
context.baseClient.performRequest({
  endpoint: `files/avatar?user_ids=<id1>,<id2>`,
});
```

**POST request**
```javascript
context.baseClient.performRequest({
  method: "POST",
  endpoint: `function/hello-func/hello-func/ping`,
  body: { message: "Hello" }
});
```

#### Metadata Client
Fetches metadata from `/metadata` endpoints.
```javascript
// Calls /metadata endpoint to retrieve all metadata 
const metadata = await context.metadataClient.fetchAllMetadata();

// Calls /metadata/{mapping} endpoint to fetch metadata for a specific object
const jobMetadata = await context.metadataClient.fetchObjectMetadata('job');
```

#### Vocabulary Client
Manages vocabulary items for picklist fields in schemas.
```javascript
// Calls /custom/vocabulary/Jobs/Type to fetch all vocabulary items for the 'Type' field in 'Jobs' schema
const vocabularyItems = await context.vocabularyClient.getVocabularyItems('Jobs', 'Type');

// Calls /custom/vocabulary/Jobs/Type to add a new vocabulary item
const newVocabularyItem = await context.vocabularyClient.addVocabularyItem('Jobs', 'Type', {
  value: "Repair",
  label: "Repair Service",
  active: true,
  defaultValue: false,
  description: "A repair job type"
});

// Calls /custom/vocabulary/Jobs/Type/Upgrade to update the 'Upgrade' vocabulary item
const updatedVocabularyItem = await context.vocabularyClient.updateVocabularyItem('Jobs', 'Type', 'Upgrade', {
  value: "Upgrade",
  label: "System Upgrade",
  description: "An upgraded system installation"
});
```

#### GraphQL Client
Executes GraphQL queries and mutations against `/graphql/graphql`.
```javascript
// execute final query string
const queryResult = await context.graphqlClient.execute(queryString, {readOnly: true});

// using query string with variables
const graphQLRequest: GraphQLRequest = {
  query: queryString,
  variables: {}
}
const queryUsingVariablesResult = await context.graphqlClient.execute(graphQLRequest, {readOnly: true});
```

#### Config Variable Client

Provides CRUD and search methods for managing configuration variables.

```javascript
// Calls /configuration/extension endpoint to create a configuration var
await context.configVarClient.create({
  key: "TEST_KEY",
  value: "TEST_VALUE",
  configType: "plain-text",
  description: "TEST_DESCRIPTION",
});

// Gets a plain-text config var
const config = await context.configVarClient.get('TEST_KEY');

// Deletes a config var
const config = await context.configVarClient.delete('TEST_KEY');
```

#### Org Preferences Client
Fetch Org Preferences from the `/config/org_preference` endpoint.
```javascript
// Get
const config: Record<string, any> = await context.orgPreferencesClient.get();

// Update
const jobConfig = {
  allowAbortJob:false
}
const config: Record<string, any> = await context.orgPreferencesClient.deploy(jobConfig);
```

#### Config Features (Feature Flags) Client
Fetch Config Features from the `/config/features` endpoint.
```javascript
// Get
const config: Record<string, any> = await context.configFeaturesClient.get();
```

#### Mobile Notification Client
Manage mobile notifications, SMS messaging, and templates.

**Mobile Notification Templates**
```javascript
// Get all mobile notification templates
const templates = await context.mobileNotificationClient.getTemplates();

// Update a template
await context.mobileNotificationClient.setTemplate(
  NotificationTemplate.JOB_DISPATCH, 
  NotificationType.SMS, 
  'Updated text for job dispatch: {{ Name }} starts at {{ Start }}.'
);

// Delete a template
await context.mobileNotificationClient.deleteTemplate(NotificationTemplate.JOB_DISPATCH, NotificationType.SMS);
```

**Job Notifications**
Send notifications related to job dispatch, reminders, cancellations, and custom messages.
```javascript
// Dispatch resources and notify them
const result: DispatchResponse = await context.mobileNotificationClient.dispatchResources({
  jobId: "12345",
  resourceIds: ["resource-1", "resource-2"]
});

// Notify resources about an allocated job
const result: NotifyResponse = await context.mobileNotificationClient.notifyAllocatedResources({
  jobId: "12345",
  resourceIds: ["resource-1", "resource-2"]
});

// Notify resources of job cancellation
const result: NotifyCancelResponse = await context.mobileNotificationClient.notifyJobCancellation({
  jobId: "12345"
});

// Send a one-off message via push notification
const result: OneOffResponse = await context.mobileNotificationClient.sendOneOffMessage({
  resourceId: "resource-1",
  message: "Reminder: Your job starts in 1 hour.",
  protocol: NotificationType.PUSH
});
```
**SMS Messaging**
Send SMS messages or request job confirmations via SMS.
```javascript
// Send an SMS to any phone number
const result: SmsResponse = await context.mobileNotificationClient.sendSms({
  phoneNumber: "+1234567890",
  countryCode: "US",
  message: "Thank you for confirming your appointment!",
  expectsReply: false
});

// Request job confirmation via SMS
const result: SmsResponse = await context.mobileNotificationClient.requestSmsConfirmation({
  phoneNumber: "+1234567890",
  countryCode: "US",
  jobId: "12345",
  message: "Please confirm your job by replying YES or NO."
});
```
#### Configuration Templates

**Templates**
```javascript
// Get templates
const templates: ConfigTemplate[] = await context.configTemplateClient.get('Jobs');

// Get teamplate values
const values: ConfigValue[] = await context.configTemplateClient.getTemplateValues(templateId);

// Delete a template
const result: Record<string,string> = await context.configTemplateClient.delete(templateId);
```
**Template Values**
```javascript
// Get template values
const values: ConfigValue[] = await context.configTemplateClient.getTemplateValues(templateId);

// Create a new template and values
const newTemplate: ConfigTemplate = {
  name: "Installation",
  schemaName: 'Jobs'
}
const createdTemplate: ConfigTemplate = await context.configTemplateClient.create(newTemplate);
console.log(JSON.stringify(createdTemplate, null, 2));

const configTemplateValues: ConfigValue[] = [
  {
    templateId: createdTemplate.id!,
    rel: "job",
    field: "CanBeDeclined",
    value: "true"
  },
  {
    templateId: createdTemplate.id!,
    rel: "job",
    field: "Duration",
    value: "120"
  }
]

const newValues = await context.configTemplateClient.upsertTemplateValues(createdTemplate.id!, configTemplateValues);
console.log(JSON.stringify(newValues, null, 2));
```

#### Geo API Client
Provides access to geolocation-related services via the `/geoservices` endpoints.

```javascript
// Calls /distanceMatrix endpoint to compute travel distance and time
const distanceMatrix: DistanceMatrixResponse = await context.geoAPIClient.getDistanceMatrix({
  origins: [{ lat: 37.7749, lng: -122.4194 }],
  destinations: [{ lat: 34.0522, lng: -118.2437 }],
  avoid: ["highway"],
});

// Calls /directions endpoint to fetch directions between two locations
const directions: DirectionsResponse = await context.geoAPIClient.getDirections({
  requests: [{
    origin: { lat: 37.7749, lng: -122.4194 },
    destination: { lat: 34.0522, lng: -118.2437 },
    waypoints: [{ lat: 36.7783, lng: -119.4179 }],
    avoid: ["toll"],
  }],
});

// Calls /geocode endpoint to retrieve latitude and longitude for an address
const geocode: GeocodeResponse = await context.geoAPIClient.geocodeAddress({
  addresses: ["1600 Amphitheatre Parkway, Mountain View, CA"],
});

// Calls /autocomplete endpoint to get address suggestions
const autocomplete = await context.geoAPIClient.autocompleteAddress({
  input: "1600 Amphi",
  sessionId: "unique-session-id",
  location: { lat: 37.7749, lng: -122.4194 },
  radius: 5000,
  country: "US",
});

// Calls /place endpoint to fetch place details using a place ID
const placeDetails = await context.geoAPIClient.getPlaceDetails({
  placeId: "ChIJ2eUgeAK6j4ARbn5u_wAGqWA",
  sessionId: "unique-session-id",
});

// Calls /timezone endpoint to fetch timezone information for a location
const timezone: TimezoneResponse = await context.geoAPIClient.getTimezone({
  location: [37.7749, -122.4194],
  timestamp: Math.floor(Date.now() / 1000),
});
```

#### Availability API Client
**Fetch Resource Availability**
```javascript
// Calls /availability/simple endpoint to retrieve availability for resources
const resourceAvailability: AvailabilityResult[] = await context.availabilityAPIClient.fetchAvailability({
  resourceIds: ["resource_123", "resource_456"],
  start: "2024-06-01T00:00:00Z",
  end: "2024-06-02T00:00:00Z",
  mergedAvailabilities: false,  // Optional, defaults to false
  entries: true  // Optional, defaults to true
});

// Example: Accessing merged availability intervals
console.log(availability[0].mergedAvailabilities);

// Example: Accessing detailed availability entries
console.log(availability[0].entries);
```

**Upsert Availability Patterns**
```javascript
// Calls /availability/patterns endpoint to create or update availability patterns
const patternRequest = {
  pattern: {
    // UID: "existing-pattern-id", // Include UID to update existing pattern
    name: "Availability Pattern - MON",
    pattern: {
      type: "weekly" as const,
      repeatWeeks: 1,
      days: [
        {
          weekday: "MON" as const,
          intervals: [{ startTime: "08:00", endTime: "18:00" }]
        }
      ]
    }
  },
  resources: [
    {
      resourceId: "<resource_id>",
      start: "2025-08-31T14:00:00.000Z",
      end: "2025-09-28T13:59:59.999Z"
    }
  ]
};

const patternId = await context.availabilityAPIClient.upsertPattern(patternRequest);
```

#### Files API Client
**Get avatars**
```javascript
// Calls /files/avatar to get a map of (userId -> url) for the given userIds
const params: GetAvatarParams = {
  userIds: ["<user1>", "<user2>"],
  sizeHint: "small", // Optional - small, thumbnail or full image otherwise
};
const result = await context.filesAPIClient.getAvatar(params);
```

**Get attachments**
```javascript
// Calls /files/attachments/{parentId} to attachments that belong to the parent
const attachments = await context.filesAPIClient.getAttachments(parentId);
```

#### Artifact Client
The `ArtifactClient` provides a unified way to manage various artifact types.
```javascript
// Creating an Artifact Client for a specific type
const client = context.newArtifactClient(ArtifactType.CUSTOM_OBJECT);
```
**Listing All Artifacts**
Retrieve all artifactse.
```javascript
await client.list();
```

**Using Artifact Parameters for CRUD Operations**
When performing CRUD operations, provide `ArtifactParams` with the necessary values based on the artifact type.
```javascript
type ArtifactParams = {
  name?: string;         // Artifact name (required for most operations)
  objectName?: string;   // Optional identifier for object-based artifacts
  viewTypeName?: string; // Optional view type name if applicable
  scope?: string;        // Optional scope if applicable
};
```
**Notes**
- Use the object label for `objectName` in Horizon artifacts.
- `name` is the `slug` for Horizon templates and `defId` for mobile extensions.
```javascript
// Get an artifact
await client.get({ name: "Jobs" });

// Create an artifact
const upsertStatus: any = await client.upsert({}, 
  {
    metadata: { 
      type: 'CustomObject' 
    },
    name: 'Tasks',
    label: 'Tasks',
    description: 'Daily tasks'
  }
);

// Wait for 2 seconds then poll the status
await new Promise(resolve => setTimeout(resolve, 2000));
const result = await client.status(upsertStatus.id);

// Update an artifact
await client.upsert(
  {
    name: 'Tasks'
  }, 
  {
    metadata: { 
      type: 'CustomObject' 
    },
    name: 'Tasks',
    label: 'Tasks',
    description: 'Daily tasks - updated'
  }
);

// Delete an artifact
await client.delete(
  {
    name: 'Tasks'
  }
);
```

### GraphQL Service

#### Query data
```javascript
// Create a query builder for the Jobs object
const queryBuilder = context.newQueryBuilder({
  objectName: 'Jobs',
  operationName: 'fetchJobWithJobAllocations', 
  readOnly: true
});
queryBuilder.withFields(['UID', 'Name'])
            .withFilter("JobStatus != 'Complete'") 
            .withLimit(1)
            .withOffset(1)
            .withOrderBy('Name ASC');
// Add a child query for Job Allocations
queryBuilder.withChildQuery('JobAllocations')
            .withFields(['UID', 'Name'])
            .withParentQuery('Job')
              .withFields(['UID', 'Name']);
// Add a parent query for Primary Region       
queryBuilder.withParentQuery('Region')
            .withFields(['UID', 'Name']); 
// Finally, execute the query 
let queryResult = await queryBuilder.execute();

console.log(queryResult.records);
console.log(queryResult.totalCount); // 5
console.log(queryResult.queryLimit); // maximum allowed limit returned in the X-Skedulo-Dynamic-Query-Limit response header
console.log(queryResult.pageInfo.hasNextPage); // true
console.log(queryResult.endCursor); // Mg==
console.log(queryResult.endOffset); // 1
```

The `X-Graphql-Operation` header is added to all GraphQL requests and contains the value of `operationName`.

#### Query Builder Methods

The `GraphQLQueryBuilder` provides several methods to configure your queries:

**Limiting Results:**
- `withLimit(limit: number)` - Sets the maximum number of records using the `limit` parameter (recommended)
- `withFirst(first: number)` - Sets the maximum number of records using the `first` parameter (use when `first` is specifically needed)

```javascript
// Recommended: Use withLimit() for the 'limit' parameter
queryBuilder.withLimit(100);  // → GraphQL query uses: limit: 100

// When specifically needed: Use withFirst() for the 'first' parameter  
queryBuilder.withFirst(100);  // → GraphQL query uses: first: 100
```

**Filtering and Ordering:**
- `withFields(fields: string[])` - Specify which fields to retrieve
- `withFilter(condition: string)` - Add filter conditions to limit results
- `withOrderBy(orderBy: string)` - Set the sort order (e.g., `'Name ASC'`, `'CreatedDate DESC'`)

**Pagination:**
- `withOffset(offset: number)` - Set the starting position for results
- `withCursor(after: string)` - Use cursor-based pagination

#### Query by Pages
```javascript
// Create a query builder for the Jobs object
const queryBuilder = context.newQueryBuilder({
  objectName: 'Jobs',
  operationName: 'fetchJobs', 
  readOnly: true
});
// Fetch data from pages 1 through 5 (inclusive)
const queryResult = await queryBuilder.executeAll(1, 5);

// Fetch data from the first 20 pages
const queryResult = await queryBuilder.executeAll();
```

The `queryBuilder.executeAll` method supports querying up to a maximum of 20 pages.

#### Batch Queries

To execute multiple queries in a single request, use `graphqlService.queryBatch`. This method takes an array of query builders, sends them to the GraphQL batch endpoint, and returns an array of query results. This is useful for fetching data from multiple objects efficiently.

```javascript
// Create query builders for Jobs and Contacts
const jobQueryBuilder = context.newQueryBuilder({
  objectName: 'Jobs',
  operationName: 'fetchJobs',
  readOnly: true
});
jobQueryBuilder.withFields(['UID', 'Name'])
               .withLimit(10);

const contactQueryBuilder = context.newQueryBuilder({
  objectName: 'Contacts',
  operationName: 'fetchContacts',
  readOnly: true
});
contactQueryBuilder.withFields(['UID', 'FirstName', 'LastName'])
                   .withLimit(5);

// Execute batch query
const queryResults = await context.graphqlService.queryBatch([jobQueryBuilder, contactQueryBuilder]);

// Process results
const jobResults = queryResults[0];
const contactResults = queryResults[1];
console.log('Jobs:', jobResults.records);
console.log('Job Total Count:', jobResults.totalCount);
console.log('Contacts:', contactResults.records);
console.log('Contact Total Count:', contactResults.totalCount);
```
#### Update data
```javascript
const recordsToUpdate = queryResult.records.map((record) => {
  return {
    UID: record.UID,
    Name: record.Name + " - Updated"
  }
});
const updateResult = await context.graphqlService.update({
    objectName: 'Resources',
    operationName: 'updateResources',
    records: recordsToUpdate,
    bulkOperation: true, // optional
    suppressChangeEvents: true // optional
  });
```

#### upsert data
```javascript
const upsertResult = await context.graphqlService.upsert({
    objectName: 'Resources',
    operationName: 'updateResources',
    records: recordsToUpsert,
    bulkOperation: true, // optional
    suppressChangeEvents: true, // optional
    keyField: "ExternalId"
  });
```

#### Batch mutations
```javascript
// Define mutation parameters for inserting Jobs and deleting Contacts
const insertJobParams = {
  objectName: 'Jobs',
  operationName: 'insertJobs',
  operation: GraphqlOperations.INSERT,
  records: [
    { UID: 'job1', Name: 'Developer Job', Status: 'Open' },
    { UID: 'job2', Name: 'Designer Job', Status: 'Open' }
  ],
  bulkOperation: true
};

const deleteContactParams = {
  objectName: 'Contacts',
  operationName: 'deleteContacts',
  operation: GraphqlOperations.DELETE,
  records: [
    { UID: 'contact1' },
    { UID: 'contact2' }
  ]
};

// Execute batch mutation
const mutationResults = await context.graphqlService.mutateBatch([insertJobParams, deleteContactParams]);

// Process results
const insertResult = mutationResults[0];
const deleteResult = mutationResults[1];
console.log('Inserted Job UIDs:', context.graphqlService.extractUIDs(insertResult));
console.log('Deleted Contact UIDs:', context.graphqlService.extractUIDs(deleteResult));
```

The `bulkOperation` and `readOnly` options help optimize large-scale mutations and read-heavy queries. When enabled, they automatically add the `X-Skedulo-Bulk-Operation` (for mutations) and `X-Skedulo-Read-Only` (for queries) headers to improve performance.
To reduce the impact on change event processing, especially during high-volume mutations, the `suppressChangeEvents` option can be used. This disables change history tracking, helping to minimize delays.

#### Pagination

The GraphQL Service supports pagination using either offset-based or cursor-based strategies, allowing you to fetch large datasets incrementally.

*Pagination with offset*
```javascript
while(queryResult.pageInfo.hasNextPage) {
  queryBuilder.withOffset(queryResult.endOffset + 1);
  queryResult = await queryBuilder.execute();
}
```
*Pagination with cursor*
```javascript
while(queryResult.pageInfo.hasNextPage) {
  queryBuilder.withCursor(queryResult.endCursor);
  queryResult = await queryBuilder.execute();
}
```

### Resource Service
The Resource Service consists of two main components:

- **Resource Builder**: Retrieves resource information, including availability, scheduled jobs, activities, tags, etc
- **Resource Validator**: Validates which resources are available for which jobs based on given conditions.

#### Resource Builder

The Resource Builder retrieves resource data, including availability, activities, scheduled jobs, tags, and other relevant details. By default, it enables the following options: `useTag`, `useJobAllocation`, `useResourceShift`, `useActivity`, `useAvailabilityPattern`, and `useHoliday`, with a time range set to 14 days from the current time.

**Usage**
```javascript
// Define query parameters for resource fetching
const params = new ResourceQueryParam();
params.regionIds = new Set(['<region_id>']);
// Override default values
params.useTag = false;
params.startTime = new Date();
params.endTime = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000);// next 7 days from now

// Build resources with the given parameters
const resources = await context.resourceBuilder.build(params);
console.log(resources);
```

#### Resource Validator
The Resource Validator takes a list of resources and jobs, and determines which resources are qualified to perform the jobs based on:

- Availability: Is the resource available during the job's timeframe?
- Conflict Detection: Does the resource already have conflicting events (e.g., another job, activity, or time-off)?
- Tag Matching: Does the resource have the required skills for the job?

**Usage**
```javascript
// Fetch jobs using GraphQL
const jobQueryResult = await context
  .newQueryBuilder({ objectName: "Jobs", operationName: "fetchJobs", readOnly: true })
  .withLimit(2)
  .withFields(TenantObjects.Jobs.Fields)
  .execute();

// Convert raw job data into structured Job entities
const jobs: Job[] = jobQueryResult.records.map((job) => EntityFactory.createJob(job));

// Define validation options
const validationOptions = {
    checkAvailability: true, // Check if the resource is available
    checkConflict: true,     // Check for conflicting events
    checkTag: true           // Check if the resource has the required skills
};

// Create a validator instance
const validator = new ResourceValidator(validationOptions);

// Run validation
const result: ValidationResult = validator.validate(resources, jobs);

// Output results
console.log(JSON.stringify(result, null, 2));

const resourcesQualifiedForAtleastOneJob = result.getQualifiedResources();
const jobsWithAtLeastXQualifiedResources = result.getJobsWithXQualifiedResources(2);
const unqualifiedJobsWithReasons = result.getUnqualifiedJobsWithReasons();
```
**Validation Output**
The Resource Validator returns a structured JSON output indicating which resources are qualified, and the reasons why certain jobs are not assigned. The results can be formatted to present a clearer qualification status along with detailed reasons.
```javascript
console.log(JSON.stringify(result.format(), null, 2));

/*
[
  {
    "resource": {
      "id": "0005fcae-3c63-46c0-8533-b2e154c25040",
      "name": "Tracey Rodriguez"
    },
    "job": {
      "id": "00143a8e-7958-4df1-8ade-767b19e9aff8",
      "name": "JOB-71777"
    },
    "qualificationStatus": "Qualified",
    "reasons": []
  },
  {
    "resource": {
      "id": "0005fcae-3c63-46c0-8533-b2e154c25040",
      "name": "Tracey Rodriguez"
    },
    "job": {
      "id": "0014bfb0-2993-4d6a-ad25-ed5d9c79de14",
      "name": "JOB-71743"
    },
    "qualificationStatus": "Not Qualified",
    "reasons": [
      {
        "reason": "Conflict Detected",
        "conflictingEvents": [
          {
            "id": "2025-02-13T14:00:00.000Z_2025-02-14T14:00:00.000Z",
            "name": "Regional Holiday",
            "eventType": "holiday"
          }
        ]
      }
    ]
  }
]
*/
```

### GeoService
Provides a high-level interface for geolocation-related operations, built on top of `GeoAPIClient`.

**Get Distance Matrix**
Computes travel distance and duration between origins and destinations. Handles cases where no route is available.
```javascript
const origins = [{ lat: 55.93, lng: -3.118 }, { lat: 50.087, lng: 14.421 }];
const destinations = [{ lat: 50.087, lng: 14.421 }, { lat: 0, lng: 0 }];

const distanceMatrix: Map<string, DistanceMatrixEntry> = await context.geoService.getDistanceMatrix(origins, destinations);

for(const origin of origins) {
  for(const destination of destinations) {
    const key = context.geoService.createKey(origin, destination);
    const entry = distanceMatrix.get(key);
    console.log(`Origin-Destination: ${key} - Status: ${entry?.status}`);
    if(entry?.status === "OK") {
      console.log(`Distance: ${entry?.distance?.distanceInMeters} meters`);
      console.log(`Duration: ${entry?.duration?.durationInSeconds} seconds`);
    }
  }
}
```

**Get Address Suggestions**
Fetches address autocomplete suggestions and retrieves detailed place information.
```javascript
const input = "1600 Amphitheatre Pkwy";
const suggestions: PlaceResponse[]|null = await context.geoService.getAddressSuggestions({ input, country: 'US' }, 2);

if (suggestions) {
  suggestions.forEach((place, index) => {
        console.log(`Place ${index + 1}: ${place.formattedAddress}`);
        console.log(`Latitude: ${place.geometry.lat}, Longitude: ${place.geometry.lng}`);
    });
} else {
    console.log("No place details found.");
}
```

### Lock Service
The Lock Service provides a locking mechanism to prevent concurrent execution of critical processes, such as batch jobs. It ensures that only one instance of a process can proceed at a time by using configuration variables with expiration timestamps.
```javascript
// Acquire a lock, auto release after 5 minutes
const lockAcquired = await context.lockService.acquireLock({
  name: 'MY_LOCK',
  ttl: 5 * 60 * 1000, // 5 minutes
});

// Release a lock
await context.lockService.releaseLock('MY_LOCK');
```

### Batch Service
The Batch Service offers a flexible and scalable solution for large-scale data processing.

#### How to Use
1. Create a subclass of GraphBatch that encapsulates the specific logic for your batch job.
2. Override the `start` method to return a configured GraphQLQueryBuilder object. This builder should set up the query fields, filters, and any required ordering.
3. Override the `execute` method to implement the logic to process each batch of records (e.g., updates, deletes, logging).
4. Optionally override the `finish` method to perform any final cleanup, such as logging the results or sending notifications.
5. Run the batch.

#### Example
Below is an example of bulk job update.
```javascript
import {
  GraphBatch,
  GraphqlOperations,
  GraphQLQueryBuilder,
} from "@skedulo/pulse-solution-services";

export class BulkJobUpdate extends GraphBatch {
  public result: string[] = [];

  // This method is called once at the beginning of the batch process.
  protected async start(): Promise<GraphQLQueryBuilder> {
    const queryBuilder = this.context
      .newQueryBuilder({objectName: "Jobs", operationName: "fetchJobsWithRegion"})
      .withFields(["UID", "Name", "Start"])
      .withOrderBy("Name ASC");
    queryBuilder.withParentQuery("Region").withFields(["UID", "Name"]);

    return queryBuilder;
  }

  // This method is called for each batch of records.
  protected async execute(records: any[]): Promise<void> {
    
    const recordsToUpdate = records.map((record) => ({
      UID: record.UID,
      Description: `${record.Name} scheduled for ${new Date(record.Start).toLocaleDateString("en-GB")} in ${record.Region.Name}`,
    }));
    await this.context.graphqlService.mutate({
      objectName: "Jobs",
      operation: GraphqlOperations.UPDATE,
      operationName: "updateJobs",
      records: recordsToUpdate
    });
    this.result.push(...records.map((record) => record.Name));
  }

  // This method is called once at the end of the batch process.
  protected async finish(): Promise<void> {
    this.context.logger.info(`Processed ${this.result.length} records.`);
  }
}
```

Run the batch
```javascript
const context = ExecutionContext.fromCredentials({
  apiServer: user.apiBasePath,
  apiToken: user.user.accessToken,
});
const batch = new BulkJobUpdate(context, {
  batchSize: 10,
  maxBatches: 10,
  strategy: PaginationStrategy.CURSOR,
  delaySeconds: 1,
});
await batch.run();
```

#### Unique Batch
The Unique Batch ensures that only one instance runs at a time. It leverages the Lock Service to prevent concurrent executions. The default lock duration is 16 minutes, configurable via the `lockTtl` setting.

**Implementation**

To create a unique batch, extend the `UniqueGraphBatch` class, everything else remains the same as a regular `GraphBatch`.

```javascript
export class UniqueBulkJobUpdate extends UniqueGraphBatch {
```
**Run a unique batch**
```javascript
const batch = new UniqueBulkJobUpdate(context, {
  batchSize: 10,
  maxBatches: 10,
  strategy: PaginationStrategy.CURSOR,
  delaySeconds: 1,
  lockTtl: 5 * 60 * 1000, // 5 minutes - optional
});
batch.run(); // Runs successfully
batch.run(); // Fails (lock still active)
```

### Cache Service
The Cache Service enables efficient data sharing between function executions and improves performance by reducing redundant operations and API calls.
```javascript
// Multi-layer cache 
const metadata: object[] = await context.inMemoryCache.get(
  "METADATA",{
    useSecondaryCache: true,
  }
)
```

### Logging Utils
The log method decorator helps streamline debugging by tracking key function executions, including their inputs and outputs.
```javascript
class ExampleService {
  @LogMethod("example_space")
  processData(input: string): string {
    return `Processed: ${input}`;
  }
}
```
Two environment variables control logging behavior:

- LOG_NAMESPACE: Filters logs by a specific namespace or displays all logs. The namespace for services in this library is PSS.
- LOG_ENTRY_MAX_LENGTH: Defaults to 120 but can be increased to capture complete input/output data.

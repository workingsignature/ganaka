# @ganaka/types

Shared TypeScript types and Zod schemas for the Ganaka API. This package ensures type safety between the server and client by providing a single source of truth for API contracts.

## Installation

```bash
pnpm add @ganaka/types
```

## Features

- 🔒 **Type-safe API contracts** using Zod schemas
- 🌳 **Tree-shakeable** - import only what you need
- 🔄 **Runtime validation** - use Zod schemas for request/response validation
- 📦 **Zero configuration** - works out of the box with TypeScript
- 🎯 **Organized by endpoint** - easy to find what you need

## Usage

### Importing Types

The package supports both namespace and modular imports for optimal tree-shaking:

```typescript
// Import from specific modules (recommended for tree-shaking)
import {
  createStrategyBodySchema,
  type CreateStrategyBody,
} from "@ganaka/types/strategies";

import {
  getKeysResponseSchema,
  type GetKeysResponse,
} from "@ganaka/types/keys";

// Or import from main entry
import {
  createStrategyBodySchema,
  getKeysResponseSchema,
  type ApiResponse,
} from "@ganaka/types";
```

### Server-Side Usage

Use schemas for request validation:

```typescript
import { createStrategyBodySchema } from "@ganaka/types/strategies";

fastify.post("/strategies", async (request, reply) => {
  // Validate request body
  const validatedBody = createStrategyBodySchema.parse(request.body);

  // TypeScript knows the exact shape of validatedBody
  const strategy = await createStrategy(validatedBody);

  return reply.send(strategy);
});
```

### Client-Side Usage

Use types for type-safe API calls:

```typescript
import {
  createStrategyBodySchema,
  type CreateStrategyBody,
  type CreateStrategyResponse,
} from "@ganaka/types/strategies";

// RTK Query example
export const strategiesAPI = createApi({
  endpoints: (builder) => ({
    createStrategy: builder.mutation<
      CreateStrategyResponse,
      CreateStrategyBody
    >({
      query: (body) => ({
        url: "/strategies",
        method: "POST",
        body,
      }),
    }),
  }),
});

// Or with fetch
async function createStrategy(
  data: CreateStrategyBody
): Promise<CreateStrategyResponse> {
  const response = await fetch("/api/strategies", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response.json();
}
```

## Available Modules

### Common (`@ganaka/types/common`)

- `apiResponseSchema` - Standard API response wrapper
- `idParamSchema` - Common ID parameter
- `DeveloperKeyStatus` - Enum for key statuses

### Strategies (`@ganaka/types/strategies`)

- GET `/strategies` - List all strategies
- GET `/strategies/:id` - Get single strategy
- POST `/strategies` - Create strategy
- PUT `/strategies/:id` - Update strategy
- DELETE `/strategies/:id` - Delete strategy

### Versions (`@ganaka/types/versions`)

- GET `/strategies/:strategyid/versions` - List versions
- GET `/strategies/:strategyid/versions/:id` - Get single version
- POST `/strategies/:strategyid/versions` - Create version
- PUT `/strategies/:strategyid/versions/:id` - Update version
- DELETE `/strategies/:strategyid/versions/:id` - Delete version

### Shortlists (`@ganaka/types/shortlists`)

- GET `/shortlists` - List shortlists
- POST `/shortlists` - Create shortlist
- PUT `/shortlists/:id` - Update shortlist
- DELETE `/shortlists/:id` - Delete shortlist

### Keys (`@ganaka/types/keys`)

- GET `/keys` - List developer keys
- POST `/keys` - Create developer key
- PATCH `/keys/:id/deactivate` - Deactivate key

## Schema Naming Convention

Each endpoint follows a consistent naming pattern:

- **Params**: `{operation}{Resource}ParamsSchema` (e.g., `getStrategyParamsSchema`)
- **Query**: `{operation}{Resource}QuerySchema` (e.g., `getStrategiesQuerySchema`)
- **Body**: `{operation}{Resource}BodySchema` (e.g., `createStrategyBodySchema`)
- **Response**: `{operation}{Resource}ResponseSchema` (e.g., `createStrategyResponseSchema`)

Types follow the same pattern without the `Schema` suffix.

## Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Watch mode for development
pnpm dev

# Type check
pnpm lint
```

## License

MIT

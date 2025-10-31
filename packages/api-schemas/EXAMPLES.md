# Usage Examples

## Server-Side (Fastify)

### Using schemas for validation

```typescript
import { FastifyPluginAsync } from "fastify";
import { 
  createStrategyBodySchema,
  type CreateStrategyResponse 
} from "@ganaka/types/strategies";

const strategiesRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/", async (request, reply) => {
    // Validate request body
    const validatedBody = createStrategyBodySchema.parse(request.body);
    
    // Your business logic here
    const strategy = await prisma.strategy.create({
      data: {
        name: validatedBody.name,
        description: validatedBody.description,
        isPublic: validatedBody.isPublic,
        customAttributes: validatedBody.customAttributes,
        owner: { connect: { id: user.id } },
      },
    });

    // Response is type-safe
    const response: CreateStrategyResponse = {
      id: strategy.id,
      name: strategy.name,
      description: strategy.description,
      isPublic: strategy.isPublic,
      customAttributes: strategy.customAttributes,
    };

    return reply.send(response);
  });
};
```

### Multiple endpoints from same module

```typescript
import {
  getVersionsParamsSchema,
  getVersionsResponseSchema,
  createVersionBodySchema,
  type GetVersionsResponse,
  type CreateVersionBody,
} from "@ganaka/types/versions";

// Use in your routes
fastify.get("/strategies/:strategyid/versions", async (request, reply) => {
  const params = getVersionsParamsSchema.parse(request.params);
  const versions = await getVersions(params.strategyid);
  
  return reply.send(versions); // TypeScript knows this should match GetVersionsResponse
});
```

## Client-Side (RTK Query)

### Creating type-safe API endpoints

```typescript
import { createApi } from "@reduxjs/toolkit/query/react";
import { 
  createStrategyBodySchema,
  type CreateStrategyBody,
  type CreateStrategyResponse,
  type GetStrategiesResponse,
  type UpdateStrategyBody,
  type UpdateStrategyResponse,
} from "@ganaka/types/strategies";
import { baseQueryWithAuth } from "./common";

export const strategiesApi = createApi({
  reducerPath: "strategiesAPI",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["strategies"],
  endpoints: (builder) => ({
    // GET /strategies
    getStrategies: builder.query<GetStrategiesResponse, void>({
      query: () => ({
        url: "/strategies",
        method: "GET",
      }),
      providesTags: ["strategies"],
    }),
    
    // POST /strategies
    createStrategy: builder.mutation<CreateStrategyResponse, CreateStrategyBody>({
      query: (body) => ({
        url: "/strategies",
        method: "POST",
        body,
      }),
      invalidatesTags: ["strategies"],
    }),
    
    // PUT /strategies/:id
    updateStrategy: builder.mutation<
      UpdateStrategyResponse,
      { id: string; body: UpdateStrategyBody }
    >({
      query: ({ id, body }) => ({
        url: `/strategies/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["strategies"],
    }),
  }),
});

export const { 
  useGetStrategiesQuery,
  useCreateStrategyMutation,
  useUpdateStrategyMutation,
} = strategiesApi;
```

### Using in React components

```typescript
import { useCreateStrategyMutation } from "./api/strategies.api";
import type { CreateStrategyBody } from "@ganaka/types/strategies";

function CreateStrategyForm() {
  const [createStrategy, { isLoading }] = useCreateStrategyMutation();

  const handleSubmit = async (data: CreateStrategyBody) => {
    try {
      const result = await createStrategy(data).unwrap();
      console.log("Created strategy:", result.id);
    } catch (error) {
      console.error("Failed to create strategy:", error);
    }
  };

  // Form implementation...
}
```

## Client-Side (Plain Fetch)

### Type-safe fetch calls

```typescript
import type {
  CreateStrategyBody,
  CreateStrategyResponse,
  GetStrategiesResponse,
} from "@ganaka/types/strategies";

class StrategyAPI {
  private baseURL = "https://api.ganaka.com/v1/core";

  async getStrategies(): Promise<GetStrategiesResponse> {
    const response = await fetch(`${this.baseURL}/strategies`);
    return response.json();
  }

  async createStrategy(data: CreateStrategyBody): Promise<CreateStrategyResponse> {
    const response = await fetch(`${this.baseURL}/strategies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  }
}
```

## Form Validation (React Hook Form + Zod)

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  createStrategyBodySchema,
  type CreateStrategyBody 
} from "@ganaka/types/strategies";

function StrategyForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateStrategyBody>({
    resolver: zodResolver(createStrategyBodySchema),
  });

  const onSubmit = (data: CreateStrategyBody) => {
    // Data is validated and type-safe
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("name")} />
      {errors.name && <span>{errors.name.message}</span>}
      
      <input {...register("description")} />
      {errors.description && <span>{errors.description.message}</span>}
      
      <button type="submit">Create Strategy</button>
    </form>
  );
}
```

## Testing

### Using schemas in tests

```typescript
import { describe, it, expect } from "vitest";
import { 
  createStrategyBodySchema,
  createStrategyResponseSchema 
} from "@ganaka/types/strategies";

describe("Strategy API", () => {
  it("should validate correct request body", () => {
    const validBody = {
      name: "My Strategy",
      description: "A test strategy",
      isPublic: false,
    };

    const result = createStrategyBodySchema.safeParse(validBody);
    expect(result.success).toBe(true);
  });

  it("should reject invalid request body", () => {
    const invalidBody = {
      name: "My Strategy",
      // missing required fields
    };

    const result = createStrategyBodySchema.safeParse(invalidBody);
    expect(result.success).toBe(false);
  });
});
```

## Tree-Shaking

### Import only what you need

```typescript
// ✅ Good - imports only strategies module
import { 
  createStrategyBodySchema,
  type CreateStrategyBody 
} from "@ganaka/types/strategies";

// ✅ Also good - imports from specific modules
import { getKeysResponseSchema } from "@ganaka/types/keys";
import { createVersionBodySchema } from "@ganaka/types/versions";

// ⚠️ Works but imports everything - less optimal for tree-shaking
import { 
  createStrategyBodySchema,
  getKeysResponseSchema 
} from "@ganaka/types";
```

## API Response Wrapper

```typescript
import type { ApiResponse } from "@ganaka/types/common";
import type { StrategyItem } from "@ganaka/types/strategies";

// Server response structure
const response: ApiResponse<StrategyItem[]> = {
  statusCode: 200,
  message: "Strategies fetched successfully",
  data: [
    {
      id: "1",
      name: "Strategy 1",
      description: "Description",
      isPublic: false,
    },
  ],
};
```


/**
 * @ganaka/apiTypes
 * Shared API types and schemas for Ganaka platform
 *
 * This package provides type-safe API contracts using Zod schemas.
 */

// Re-export common types
export * from "./common";

// Re-export all endpoint-specific types
export * as strategiesSchemas from "./v1/core/strategies/strategies";
export * as strategyVersionsSchemas from "./v1/core/strategies/:strategyid/versions/versions";
export * as shortlistsSchemas from "./v1/core/shortlists/shortlists";
export * as keysSchemas from "./v1/core/keys/keys";

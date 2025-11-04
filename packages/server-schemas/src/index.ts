/**
 * @ganaka/apiTypes
 * Shared API types and schemas for Ganaka platform
 *
 * This package provides type-safe API contracts using Zod schemas.
 */

// Re-export common types
export * from "./common";

// Re-export public endpoint schemas
export * as public_health_schemas from "./public/health";
export * as public_shortlists_schemas from "./public/shortlists/shortlists";
export * as public_triggers_schemas from "./public/triggers/triggers";
export * as public_webhooks_schemas from "./public/webhooks/webhooks";

// Re-export all endpoint-specific types
export * as v1_core_strategies_schemas from "./v1/core/strategies/strategies";
export * as v1_core_strategies_versions_schemas from "./v1/core/strategies/:strategyid/versions/versions";
export * as v1_core_shortlists_schemas from "./v1/core/shortlists/shortlists";
export * as v1_core_keys_schemas from "./v1/core/keys/keys";
export * as v1_core_instruments_schemas from "./v1/core/instruments/instruments";

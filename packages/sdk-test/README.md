# Ganaka SDK Test Project

This is a test project within the pnpm workspace for testing the Ganaka SDK.

## Usage

From the root of the workspace:

```bash
# Build the SDK and run tests
pnpm test:sdk

# Build the SDK in watch mode and run tests in watch mode
pnpm dev:sdk

# Just build the SDK
pnpm build:sdk

# Just run the SDK tests
pnpm test:sdk:run
```

Or from this directory:

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm dev
```

## How it works

This project uses the SDK from the workspace via `workspace:*` protocol. Make sure to build the SDK before running tests.


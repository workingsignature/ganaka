# Ganaka SDK

TypeScript/JavaScript client library for the Ganaka trading platform.

## Installation

```bash
npm install @ganaka/sdk
# or
yarn add @ganaka/sdk
# or
pnpm add @ganaka/sdk
```

## Quick Start

```typescript
import { GanakaClient } from "@ganaka/sdk";

// Initialize the client
const client = new GanakaClient({
  apiKey: "your-api-key",
  baseUrl: "https://api.ganaka.com",
  debug: true,
});

// Check API health
const health = await client.health();
console.log(health);

// Get shortlists
const shortlists = await client.getShortlists();
if (shortlists.success) {
  console.log("Shortlists:", shortlists.data);
}
```

## Configuration

```typescript
const client = new GanakaClient({
  apiKey: "your-api-key", // API key for authentication
  baseUrl: "http://localhost:3000", // API base URL
  wsUrl: "ws://localhost:3000", // WebSocket URL for real-time data
  timeout: 30000, // Request timeout in milliseconds
  debug: false, // Enable debug logging
});
```

## API Methods

### Shortlists

```typescript
// Get all shortlists
const shortlists = await client.getShortlists();

// Get a specific shortlist
const shortlist = await client.getShortlist("shortlist-id");

// Create a new shortlist
const newShortlist = await client.createShortlist({
  name: "My Watchlist",
  symbols: ["AAPL", "GOOGL", "MSFT"],
});

// Update a shortlist
const updated = await client.updateShortlist("shortlist-id", {
  name: "Updated Watchlist",
});

// Delete a shortlist
await client.deleteShortlist("shortlist-id");
```

### Instruments

```typescript
// Search instruments
const results = await client.searchInstruments("apple");

// Get instrument details
const instrument = await client.getInstrument("AAPL");

// Get multiple instruments
const instruments = await client.getInstruments(["AAPL", "GOOGL"]);
```

### Strategies

```typescript
// Get all strategies
const strategies = await client.getStrategies();

// Create a strategy
const strategy = await client.createStrategy({
  name: "My Strategy",
  type: "momentum",
  parameters: {
    period: 20,
    threshold: 0.02,
  },
  status: "inactive",
});

// Start/stop a strategy
await client.startStrategy("strategy-id");
await client.stopStrategy("strategy-id");
```

### Orders

```typescript
// Place an order
const order = await client.placeOrder({
  symbol: "AAPL",
  quantity: 100,
  orderType: "market",
  side: "buy",
});

// Get orders
const orders = await client.getOrders();

// Cancel an order
await client.cancelOrder("order-id");
```

## WebSocket - Real-time Data

```typescript
// Get WebSocket client
const ws = client.getWebSocket();

// Connect to WebSocket
await client.connectWebSocket();

// Subscribe to events
ws.on("connected", () => {
  console.log("Connected to real-time data");
});

ws.on("tick", (data) => {
  console.log("Tick data:", data);
});

ws.on("error", (error) => {
  console.error("WebSocket error:", error);
});

// Subscribe to tick data for symbols
ws.subscribeTicks(["AAPL", "GOOGL"]);

// Unsubscribe
ws.unsubscribeTicks(["AAPL"]);

// Disconnect
client.disconnectWebSocket();
```

## Error Handling

All API methods return an `ApiResponse` object with the following structure:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

Example error handling:

```typescript
const response = await client.getShortlists();

if (response.success) {
  console.log("Data:", response.data);
} else {
  console.error("Error:", response.error);
}
```

## TypeScript Support

This SDK is written in TypeScript and provides full type definitions:

```typescript
import type { Shortlist, Instrument, Order, Strategy, User } from "@ganaka/sdk";
```

## Development

### Building

```bash
# Install dependencies
pnpm install

# Build the library
pnpm run build

# Watch mode
pnpm run dev

# Type checking
pnpm run lint
```

### Publishing

```bash
# Build before publishing
pnpm run build

# Publish to npm
npm publish
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.



















# Ganaka Server

A TypeScript Node.js server built with Fastify, featuring:

- **Fastify**: Fast and low overhead web framework
- **@fastify/sensible**: Sensible defaults for Fastify
- **@fastify/cors**: CORS support
- **@fastify/autoload**: Automatic plugin and route loading
- **TypeScript**: Type-safe development
- **Nodemon**: Hot reloading during development

## Getting Started

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

The server will start on `http://localhost:3000` with hot reloading enabled.

### Production

```bash
pnpm build
pnpm start
```

## API Endpoints

- `GET /health` - Health check endpoint
- `GET /api/example` - Example route
- `POST /api/example` - Example POST route
- `GET /api/example/:id` - Example route with parameters

## Project Structure

```
src/
├── index.ts          # Main server file
├── plugins/          # Auto-loaded plugins
│   └── example.ts
└── routes/           # Auto-loaded routes
    └── example.ts
```

## Environment Variables

- `PORT` - Server port (default: 3000)
- `HOST` - Server host (default: 0.0.0.0)

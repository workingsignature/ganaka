# Ganaka Bot

A TypeScript Node.js bot application with nodemon for development.

## Features

- TypeScript support
- Nodemon for hot reloading during development
- Environment variable configuration
- Graceful shutdown handling
- Error handling and logging

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (package manager)

### Installation

1. Install dependencies:

```bash
pnpm install
```

2. Copy the environment file:

```bash
cp env.example .env
```

3. Update the `.env` file with your configuration.

### Development

Start the bot in development mode with hot reloading:

```bash
pnpm run dev
```

### Production

Build and start the bot:

```bash
pnpm run build
pnpm start
```

### Available Scripts

- `pnpm run dev` - Start development server with nodemon
- `pnpm run build` - Build TypeScript to JavaScript
- `pnpm start` - Start the production server
- `pnpm run clean` - Clean the dist directory

## Project Structure

```
src/
├── index.ts          # Main application entry point
└── ...

dist/                 # Compiled JavaScript (generated)
├── index.js
└── ...

package.json          # Package configuration
tsconfig.json         # TypeScript configuration
nodemon.json          # Nodemon configuration
```

## Environment Variables

- `BOT_NAME` - Name of the bot (default: GanakaBot)
- `BOT_VERSION` - Version of the bot (default: 1.0.0)
- `PORT` - Port to run the bot on (default: 3000)
- `NODE_ENV` - Environment (development/production)

## Development

The bot uses nodemon for automatic restarting during development. It watches for changes in:

- TypeScript files (`.ts`)
- JavaScript files (`.js`)
- JSON files (`.json`)

The bot will automatically restart when you make changes to the source code.

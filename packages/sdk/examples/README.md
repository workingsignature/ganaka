# Ganaka SDK Examples

This directory contains example code demonstrating how to use the Ganaka Python SDK.

## Setup with uv (Recommended)

### Quick Setup

```bash
# From the examples directory
make setup
# Or manually:
uv venv
uv pip install -e ..
uv pip install python-dotenv
```

### Set your API key

```bash
export GANAKA_API_KEY="your_api_key_here"
```

### Run Examples with uv

```bash
# Using make commands (easiest)
make run-quick     # Quick start example
make run-basic     # Basic usage
make run-advanced  # Advanced patterns
make run-bot       # Trading bot

# Or using uv directly
uv run python quick_start.py
uv run python basic_usage.py
uv run python advanced_usage.py
uv run python trading_bot.py
```

## Alternative: Setup with pip

```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Unix/macOS

# Install dependencies
pip install -e ..
pip install python-dotenv
```

## Examples

### 📁 `basic_usage.py`

Simple example showing basic SDK initialization and API calls.

```bash
python basic_usage.py
```

### 📁 `advanced_usage.py`

Advanced patterns including:

- Context manager usage
- Error handling
- Async operations (if supported)
- Batch operations

```bash
python advanced_usage.py
```

### 📁 `trading_bot.py`

A simple trading bot example that:

- Monitors shortlists
- Fetches candle data
- Makes decisions based on simple strategies

```bash
python trading_bot.py
```

## Environment Variables

The examples use these environment variables:

- `GANAKA_API_KEY`: Your API key (required)
- `GANAKA_BASE_URL`: API base URL (optional, defaults to production)
- `GANAKA_DEBUG`: Enable debug logging (optional)

## Requirements

See `requirements.txt` for dependencies needed to run the examples.

# Ganaka Python SDK

A minimal Python SDK for interacting with the Ganaka API.

## Installation

```bash
pip install ganaka
```

## Quick Start

```python
from ganaka import GanakaClient

# Initialize the client
client = GanakaClient(api_key="your_api_key_here")

# Use context manager for automatic cleanup
with GanakaClient(api_key="your_api_key_here") as client:
    # Your code here
    pass
```

## Development

This project uses [uv](https://github.com/astral-sh/uv) for environment management.

### Setup

```bash
# Install uv if you haven't already
curl -LsSf https://astral.sh/uv/install.sh | sh

# Create virtual environment
uv venv

# Activate virtual environment
source .venv/bin/activate  # On Unix/macOS
# or
.venv\Scripts\activate  # On Windows

# Install development dependencies
uv pip install -e ".[dev]"
```

### Type Checking

```bash
pyright src/ganaka
```

### Linting

```bash
ruff check src/ganaka
```

## License

MIT

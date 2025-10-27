.PHONY: help setup run-basic run-advanced run-bot run-quick clean

help:
	@echo "Available commands:"
	@echo "  make setup         - Set up uv environment and install dependencies"
	@echo "  make run-basic     - Run basic usage example"
	@echo "  make run-advanced  - Run advanced usage example"  
	@echo "  make run-bot       - Run trading bot example"
	@echo "  make run-quick     - Run quick start example"
	@echo "  make clean         - Clean up environment"

setup:
	@echo "🔧 Setting up uv environment..."
	uv venv
	uv pip install -e ..
	uv pip install python-dotenv
	@echo "✅ Setup complete! Activate with: source .venv/bin/activate"

run-basic:
	uv run python basic_usage.py

run-advanced:
	uv run python advanced_usage.py

run-bot:
	uv run python trading_bot.py

run-quick:
	uv run python quick_start.py

clean:
	rm -rf .venv
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete

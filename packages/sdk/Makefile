.PHONY: help install dev lint typecheck build clean

help:
	@echo "Available commands:"
	@echo "  make install    - Install package"
	@echo "  make dev        - Install package with dev dependencies"
	@echo "  make lint       - Run ruff linter"
	@echo "  make typecheck  - Run pyright type checker"
	@echo "  make build      - Build distribution packages"
	@echo "  make clean      - Clean build artifacts"

install:
	uv pip install -e .

dev:
	uv pip install -e ".[dev]"

lint:
	ruff check src/ganaka

typecheck:
	pyright src/ganaka

build:
	uv pip install --system build hatchling
	python -m build

clean:
	rm -rf build dist *.egg-info
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete


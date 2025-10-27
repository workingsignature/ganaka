#!/usr/bin/env python3
"""Quick start example - minimal code to get started."""

from ganaka import GanakaClient
import os
import sys

# Add parent directory to path for development
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


# Get your API key from environment variable
api_key = os.environ.get("GANAKA_API_KEY", "demo_key_12345")

# Create client and make API calls
with GanakaClient(api_key=api_key) as client:
    # Get all shortlists
    shortlists = client.get_shortlists()
    print(f"Found {shortlists.get('total', 0)} shortlists")

    # Create a new shortlist
    my_list = client.create_shortlist(
        name="My Favorites",
        symbols=["AAPL", "GOOGL", "MSFT"]
    )
    print(f"Created: {my_list.get('name')}")

    # Get market data
    candles = client.get_candle_data(
        symbol="AAPL",
        interval="1d"
    )
    print(f"Got {len(candles.get('candles', []))} candles")

print("✅ Done!")

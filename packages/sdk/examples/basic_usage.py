#!/usr/bin/env python3
"""Basic usage example for Ganaka SDK."""

from ganaka import GanakaClient, __version__
import os
import sys

# Add parent directory to path for development
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def get_api_key() -> str:
    """Get API key from environment variable."""
    api_key = os.environ.get("GANAKA_API_KEY")
    if not api_key:
        print("Error: Please set GANAKA_API_KEY environment variable")
        print("Export it with: export GANAKA_API_KEY='your_key_here'")
        sys.exit(1)
    return api_key


def main() -> None:
    """Run basic SDK examples."""
    print(f"Ganaka SDK Version: {__version__}")
    print("-" * 50)

    # Get API key
    api_key = get_api_key()

    # Initialize client
    client = GanakaClient(api_key=api_key)
    print("✅ Client initialized")

    # Example 1: Get shortlists
    print("\n📋 Fetching shortlists...")
    shortlists = client.get_shortlists()
    print(f"Found {shortlists.get('total', 0)} shortlists")

    # Example 2: Create a shortlist
    print("\n📝 Creating a new shortlist...")
    new_shortlist = client.create_shortlist(
        name="My Watchlist",
        symbols=["RELIANCE", "TCS", "INFY", "HDFC"]
    )
    print(
        f"Created shortlist: {new_shortlist.get('name')} (ID: {new_shortlist.get('id')})")

    # Example 3: Get instruments
    print("\n🎯 Fetching available instruments...")
    instruments = client.get_instruments(exchange="NSE")
    print(f"Found {instruments.get('total', 0)} instruments on NSE")

    # Example 4: Get candle data
    print("\n📊 Fetching candle data for RELIANCE...")
    candles = client.get_candle_data(
        symbol="RELIANCE",
        interval="1d",
        start_time="2024-01-01",
        end_time="2024-01-31"
    )
    print(
        f"Retrieved {len(candles.get('candles', []))} candles for {candles.get('symbol')}")

    # Cleanup
    client.close()
    print("\n✅ Client closed successfully")


if __name__ == "__main__":
    main()

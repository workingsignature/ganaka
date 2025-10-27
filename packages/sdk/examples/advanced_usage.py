#!/usr/bin/env python3
"""Advanced usage patterns for Ganaka SDK."""

from ganaka import GanakaClient
import os
import sys
import time
from datetime import datetime, timedelta
from typing import Any, Optional

# Add parent directory to path for development
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class GanakaTrader:
    """A wrapper class demonstrating advanced SDK usage patterns."""

    def __init__(self, api_key: str, base_url: Optional[str] = None):
        """Initialize the trader with SDK client."""
        self.client = GanakaClient(
            api_key=api_key,
            base_url=base_url or "https://api.ganaka.com"
        )
        self.watchlists: dict[str, list[str]] = {}

    def __enter__(self) -> "GanakaTrader":
        """Context manager entry."""
        return self

    def __exit__(self, *args: Any) -> None:
        """Context manager exit with cleanup."""
        self.cleanup()

    def cleanup(self) -> None:
        """Cleanup resources."""
        if self.client:
            self.client.close()
            print("🧹 Cleaned up resources")

    def setup_watchlists(self) -> None:
        """Set up multiple watchlists for different strategies."""
        watchlists_config = {
            "High Volume": ["RELIANCE", "TCS", "HDFC", "INFY"],
            "Momentum": ["ADANI", "TATA", "WIPRO"],
            "Value Picks": ["ITC", "COAL", "BHEL"],
        }

        print("📋 Setting up watchlists...")
        for name, symbols in watchlists_config.items():
            _ = self.client.create_shortlist(name=name, symbols=symbols)
            self.watchlists[name] = symbols
            print(f"  ✅ Created: {name} with {len(symbols)} symbols")

    def analyze_symbol(self, symbol: str) -> dict[str, Any]:
        """Analyze a single symbol with multiple timeframes."""
        print(f"\n🔍 Analyzing {symbol}...")

        analysis: dict[str, Any] = {
            "symbol": symbol,
            "timestamp": datetime.now().isoformat(),
            "timeframes": {}
        }

        # Analyze different timeframes
        timeframes = ["1m", "5m", "15m", "1h", "1d"]
        for tf in timeframes:
            candles = self.client.get_candle_data(
                symbol=symbol,
                interval=tf,
                start_time=(datetime.now() - timedelta(days=7)).isoformat(),
                end_time=datetime.now().isoformat()
            )

            # Mock analysis (in real implementation, calculate actual indicators)
            analysis["timeframes"][tf] = {
                "candle_count": len(candles.get("candles", [])),
                "trend": "bullish" if tf in ["1h", "1d"] else "neutral",
                "volume": "high" if symbol in ["RELIANCE", "TCS"] else "normal"
            }

        return analysis

    def monitor_watchlists(self, duration_seconds: int = 10) -> None:
        """Monitor all watchlists for specified duration."""
        print(f"\n📊 Monitoring watchlists for {duration_seconds} seconds...")

        start_time = time.time()
        iteration = 0

        while time.time() - start_time < duration_seconds:
            iteration += 1
            print(
                f"\n⏰ Iteration {iteration} at {datetime.now().strftime('%H:%M:%S')}")

            for watchlist_name, symbols in self.watchlists.items():
                print(f"\n  📁 {watchlist_name}:")
                for symbol in symbols[:2]:  # Limit to 2 symbols for demo
                    # In real implementation, fetch real-time data
                    print(
                        f"    • {symbol}: Mock price ₹{1000 + iteration * 10}")

            time.sleep(3)  # Wait 3 seconds between iterations

        print("\n✅ Monitoring completed")

    def generate_report(self) -> dict[str, Any]:
        """Generate a summary report of all activities."""
        report = {
            "timestamp": datetime.now().isoformat(),
            "watchlists": len(self.watchlists),
            "total_symbols": sum(len(symbols) for symbols in self.watchlists.values()),
            "status": "active"
        }

        print("\n📈 Report Summary:")
        for key, value in report.items():
            print(f"  • {key}: {value}")

        return report


def main() -> None:
    """Run advanced SDK examples."""
    print("🚀 Ganaka SDK - Advanced Usage Examples")
    print("=" * 50)

    # Get configuration from environment
    api_key = os.environ.get("GANAKA_API_KEY")
    if not api_key:
        print("❌ Error: Please set GANAKA_API_KEY environment variable")
        sys.exit(1)

    base_url = os.environ.get("GANAKA_BASE_URL")  # Optional

    # Use context manager for automatic cleanup
    print("\n🎯 Using context manager pattern...")
    with GanakaTrader(api_key=api_key, base_url=base_url) as trader:
        # Set up watchlists
        trader.setup_watchlists()

        # Analyze specific symbol
        analysis = trader.analyze_symbol("RELIANCE")
        print(f"\n📊 Analysis complete for {analysis['symbol']}")
        for tf, data in analysis["timeframes"].items():
            print(f"  • {tf}: Trend={data['trend']}, Volume={data['volume']}")

        # Monitor watchlists (shortened for demo)
        trader.monitor_watchlists(duration_seconds=5)

        # Generate report
        _ = trader.generate_report()

    print("\n✅ All operations completed successfully!")
    print("   (Context manager automatically cleaned up resources)")


if __name__ == "__main__":
    main()

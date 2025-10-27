#!/usr/bin/env python3
"""Simple trading bot example using Ganaka SDK."""

from ganaka import GanakaClient
import os
import sys
import time
import random
from datetime import datetime, timedelta
from typing import Any, Optional

# Add parent directory to path for development
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class SimpleTradingBot:
    """A simple trading bot demonstrating SDK usage in a real-world scenario."""

    def __init__(self, api_key: str):
        """Initialize the trading bot."""
        self.client = GanakaClient(api_key=api_key)
        self.positions: dict[str, dict[str, Any]] = {}
        self.balance = 100000.0  # Starting balance in INR
        self.max_position_size = 10000.0  # Max per position

    def calculate_sma(self, prices: list[float], period: int) -> Optional[float]:
        """Calculate Simple Moving Average."""
        if len(prices) < period:
            return None
        return sum(prices[-period:]) / period

    def calculate_rsi(self, prices: list[float], period: int = 14) -> Optional[float]:
        """Calculate Relative Strength Index (simplified)."""
        if len(prices) < period + 1:
            return None

        # Calculate price changes
        changes = [prices[i] - prices[i-1] for i in range(1, len(prices))]

        # Separate gains and losses
        gains = [c if c > 0 else 0 for c in changes[-period:]]
        losses = [-c if c < 0 else 0 for c in changes[-period:]]

        avg_gain = sum(gains) / period
        avg_loss = sum(losses) / period

        if avg_loss == 0:
            return 100

        rs = avg_gain / avg_loss
        rsi = 100 - (100 / (1 + rs))

        return rsi

    def generate_signal(self, symbol: str) -> str:
        """Generate trading signal for a symbol.

        Returns:
            'BUY', 'SELL', or 'HOLD'
        """
        print(f"  📊 Analyzing {symbol}...")

        # Fetch candle data (mock implementation)
        _ = self.client.get_candle_data(
            symbol=symbol,
            interval="1h",
            start_time=(datetime.now() - timedelta(days=30)).isoformat()
        )

        # Mock price data for demonstration
        # In real implementation, extract from candles
        prices = [100 + random.uniform(-10, 10) for _ in range(50)]

        # Calculate indicators
        sma_20 = self.calculate_sma(prices, 20) or prices[-1]
        sma_50 = self.calculate_sma(prices, 50) or prices[-1]
        rsi = self.calculate_rsi(prices) or 50
        current_price = prices[-1]

        print(f"    • Current Price: ₹{current_price:.2f}")
        print(f"    • SMA(20): ₹{sma_20:.2f}")
        print(f"    • SMA(50): ₹{sma_50:.2f}")
        print(f"    • RSI(14): {rsi:.2f}")

        # Simple strategy logic
        if rsi < 30 and current_price > sma_20:
            signal = "BUY"
            print(f"    ✅ Signal: {signal} (Oversold + Above SMA20)")
        elif rsi > 70 and current_price < sma_20:
            signal = "SELL"
            print(f"    ⛔ Signal: {signal} (Overbought + Below SMA20)")
        elif sma_20 > sma_50 and current_price > sma_20:
            signal = "BUY"
            print(f"    ✅ Signal: {signal} (Bullish trend)")
        elif sma_20 < sma_50 and current_price < sma_20:
            signal = "SELL"
            print(f"    ⛔ Signal: {signal} (Bearish trend)")
        else:
            signal = "HOLD"
            print(f"    ⏸️ Signal: {signal} (No clear trend)")

        return signal

    def execute_trade(self, symbol: str, signal: str, price: float) -> None:
        """Execute a trade based on the signal."""
        timestamp = datetime.now().isoformat()

        if signal == "BUY" and symbol not in self.positions:
            # Check if we have enough balance
            if self.balance >= self.max_position_size:
                quantity = int(self.max_position_size / price)
                cost = quantity * price

                self.positions[symbol] = {
                    "quantity": quantity,
                    "entry_price": price,
                    "cost": cost,
                    "timestamp": timestamp
                }

                self.balance -= cost

                print(
                    f"    💰 BOUGHT {quantity} units of {symbol} at ₹{price:.2f}")
                print(f"       Total cost: ₹{cost:.2f}")
                print(f"       Remaining balance: ₹{self.balance:.2f}")

        elif signal == "SELL" and symbol in self.positions:
            position = self.positions[symbol]
            quantity = position["quantity"]
            entry_price = position["entry_price"]

            # Calculate profit/loss
            revenue = quantity * price
            profit = revenue - position["cost"]
            profit_pct = (profit / position["cost"]) * 100

            # Update balance and remove position
            self.balance += revenue
            del self.positions[symbol]

            emoji = "📈" if profit > 0 else "📉"
            print(
                f"    {emoji} SOLD {quantity} units of {symbol} at ₹{price:.2f}")
            print(f"       Entry: ₹{entry_price:.2f}, Exit: ₹{price:.2f}")
            print(f"       P&L: ₹{profit:.2f} ({profit_pct:+.2f}%)")
            print(f"       New balance: ₹{self.balance:.2f}")

    def run_strategy(self, symbols: list[str], iterations: int = 5) -> None:
        """Run the trading strategy for specified iterations."""
        print("\n🤖 Trading Bot Started")
        print(f"   Initial Balance: ₹{self.balance:.2f}")
        print(f"   Monitoring: {', '.join(symbols)}")
        print(f"   Max position size: ₹{self.max_position_size:.2f}")
        print("-" * 60)

        for i in range(iterations):
            print(
                f"\n🔄 Iteration {i+1}/{iterations} - {datetime.now().strftime('%H:%M:%S')}")

            for symbol in symbols:
                # Generate signal
                signal = self.generate_signal(symbol)

                # Mock current price (in real implementation, get from market data)
                current_price = 100 + random.uniform(-5, 5)

                # Execute trade if signal is not HOLD
                if signal != "HOLD":
                    self.execute_trade(symbol, signal, current_price)

            # Wait between iterations (shorter for demo)
            if i < iterations - 1:
                print(f"\n⏰ Waiting 3 seconds before next iteration...")
                time.sleep(3)

        # Final summary
        self.print_summary()

    def print_summary(self) -> None:
        """Print trading summary."""
        print("\n" + "=" * 60)
        print("📊 TRADING SUMMARY")
        print("=" * 60)

        print(f"\n💼 Open Positions: {len(self.positions)}")
        if self.positions:
            for symbol, pos in self.positions.items():
                print(
                    f"  • {symbol}: {pos['quantity']} units @ ₹{pos['entry_price']:.2f}")

        # Calculate total portfolio value
        positions_value = sum(pos["cost"] for pos in self.positions.values())
        total_value = self.balance + positions_value
        initial_value = 100000.0
        total_return = total_value - initial_value
        return_pct = (total_return / initial_value) * 100

        print(f"\n💰 Financial Summary:")
        print(f"  • Cash Balance: ₹{self.balance:.2f}")
        print(f"  • Positions Value: ₹{positions_value:.2f}")
        print(f"  • Total Portfolio: ₹{total_value:.2f}")
        print(f"  • Total Return: ₹{total_return:+.2f} ({return_pct:+.2f}%)")

        emoji = "🟢" if total_return >= 0 else "🔴"
        print(f"\n{emoji} Status: {'Profit' if total_return >= 0 else 'Loss'}")

    def cleanup(self) -> None:
        """Cleanup resources."""
        self.client.close()


def main() -> None:
    """Run the trading bot."""
    print("🚀 Ganaka Trading Bot Example")
    print("=" * 60)

    # Get API key
    api_key = os.environ.get("GANAKA_API_KEY")
    if not api_key:
        print("❌ Error: Please set GANAKA_API_KEY environment variable")
        sys.exit(1)

    # Initialize bot
    bot = SimpleTradingBot(api_key=api_key)

    # Define symbols to trade
    symbols = ["RELIANCE", "TCS", "INFY"]

    try:
        # Run the trading strategy
        bot.run_strategy(symbols=symbols, iterations=3)

    except KeyboardInterrupt:
        print("\n\n⚠️ Bot interrupted by user")
        bot.print_summary()

    except Exception as e:
        print(f"\n❌ Error occurred: {e}")

    finally:
        bot.cleanup()
        print("\n✅ Bot shutdown complete")


if __name__ == "__main__":
    main()

# Kelly Criterion Simulator

A sophisticated web application designed to help users understand and apply the Kelly Criterion betting strategy through interactive simulation and practical calculation tools.

## Features

### 🎮 Simulation Mode
- **Interactive Betting Game**: Practice with virtual money against randomly generated betting opportunities
- **Real-time Feedback**: Visual indicators showing bet quality and results
- **Performance Tracking**: Compare your strategy against the mathematically optimal Kelly Criterion
- **Customizable Parameters**: Adjust bet ranges, probability limits, and more
- **Visual Analytics**: Charts showing bankroll growth over time

### 🧮 Calculator Mode
- **Real-world Application**: Calculate optimal bet sizes for actual betting opportunities
- **Multiple Bet Support**: Analyze several simultaneous betting opportunities
- **Flexible Input**: Enter probability and payout directly
- **Risk Management**: See both full Kelly and half Kelly recommendations
- **Quick Presets**: Common betting scenarios for easy exploration

### 📚 Educational Features
- **Comprehensive Tooltips**: Hover over any metric for detailed explanations
- **Welcome Tutorial**: Step-by-step introduction for beginners
- **Visual Feedback**: Color-coded indicators for positive/negative edge bets
- **Bet Quality Indicators**: Learn when your bets are too conservative or aggressive

## Overview

This simulator helps users develop intuition about optimal bet sizing using the Kelly Criterion formula. Whether you're learning the concept or need to calculate real bets, this tool provides both educational value and practical utility.

### What is the Kelly Criterion?

The Kelly Criterion is a mathematical formula that determines the optimal size of a series of bets to maximize long-term growth while avoiding ruin. It considers:
- The probability of winning
- The payout odds
- Your current bankroll

Formula: `f* = (bp - q) / b`
Where:
- `f*` = fraction of bankroll to bet
- `b` = net odds received on the bet
- `p` = probability of winning
- `q` = probability of losing (1 - p)

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/betting-simulator.git

# Navigate to the project directory
cd betting-simulator

# Install dependencies
npm install

# Start the development server
npm start
```

The app will open in your browser at `http://localhost:3000`.

## Usage

### Simulation Mode
1. Adjust bet parameters using the sliders on each bet card
2. Click "Place Bets" to see results
3. Track your performance against the optimal strategy
4. Use the settings panel to customize game difficulty

### Calculator Mode
1. Switch to Calculator Mode using the toggle in the header
2. Click "Add New Bet" or use quick presets
3. Enter your win probability and payout
4. View the recommended Kelly bet size
5. Optional: Enter bankroll to see dollar amounts

## Technologies Used

- **React** - UI framework
- **WebAssembly (Rust)** - High-performance Kelly calculations
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Recharts** - Data visualization

## Documentation

See [DOCUMENTATION.md](DOCUMENTATION.md) for detailed information about:
- Component architecture
- Adding new features
- Customization options
- Tooltip system
- Educational content

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Kelly Criterion formula developed by John L. Kelly Jr.
- UI inspired by modern financial applications
- Educational approach based on interactive learning principles

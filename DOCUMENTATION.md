# Betting Simulator Documentation System

## Overview

The Betting Simulator now includes a comprehensive documentation system designed to help beginners understand betting concepts and the Kelly Criterion. The system includes:

1. **Welcome Modal** - An onboarding flow for first-time users
2. **Tooltip System** - Contextual help throughout the interface
3. **How It Works Button** - Quick access to the tutorial
4. **Mode Switching** - Toggle between Simulation and Calculator modes

## Modes

### 1. Simulation Mode
The game-like experience where users practice betting with virtual money against randomly generated bets. Features include:
- Random bet generation with adjustable parameters
- Bankroll tracking and comparison with optimal strategy
- Visual feedback with charts and animations
- Reset game functionality

### 2. Calculator Mode
A practical tool for calculating optimal bet sizes for real-world betting opportunities. Features include:
- Manual input of win probability and payout
- Support for multiple simultaneous bets
- Add/remove bet functionality
- Real-time Kelly Criterion calculations
- Half Kelly recommendations for risk management
- Optional bankroll input for dollar amount calculations

## Components

### 1. WelcomeModal (`src/components/WelcomeModal.js`)

A multi-step onboarding modal that introduces users to:
- The purpose of the betting simulator
- Basic betting concepts (probability and payout)
- Strategic goals and tips
- Quick start guide

**Features:**
- 4-step onboarding flow
- Progress indicator
- Keyboard navigation (Arrow keys, ESC)
- LocalStorage integration to show only on first visit
- Smooth animations with Framer Motion

**Usage:**
```javascript
<WelcomeModal 
  isOpen={showWelcomeModal} 
  onClose={() => setShowWelcomeModal(false)} 
/>
```

### 2. Tooltip Component (`src/components/Tooltip.js`)

Provides contextual help for various betting metrics and concepts.

**Features:**
- Hover-activated tooltips
- Multiple positioning options (top, bottom, left, right)
- Rich content with title, description, and examples
- Pre-defined content for all major metrics

**Usage:**
```javascript
<TooltipComponent {...tooltipContent.probability} />
```

**Available Tooltip Content:**
- `probability` - Win probability explanation
- `payout` - Payout multiplier explanation
- `edge` - Mathematical advantage explanation
- `impliedOdds` - Break-even probability
- `optimalSize` - Kelly Criterion optimal bet size
- `bankroll` - Available betting money
- `optimalBankroll` - Benchmark performance
- `betAmount` - Bet sizing strategy
- `totalBets` - Round counter
- `expectedGrowth` - Growth rate explanation

### 3. HowItWorksButton (`src/components/HowItWorksButton.js`)

A button component to reopen the tutorial modal.

**Variants:**
- `default` - Standard button for header
- `floating` - Fixed position floating action button

**Usage:**
```javascript
<HowItWorksButton 
  onClick={() => setShowWelcomeModal(true)}
  variant="floating" 
/>
```

### 4. ModeSwitch (`src/components/ModeSwitch.js`)

A toggle component for switching between Simulation and Calculator modes.

**Usage:**
```javascript
<ModeSwitch currentMode={appMode} onModeChange={setAppMode} />
```

### 5. CalculatorMode (`src/components/CalculatorMode.js`)

The main calculator interface for real-world betting calculations.

**Features:**
- Quick preset examples for common betting scenarios
- Summary statistics with total Kelly percentages
- Copy results to clipboard functionality
- Advanced options for bankroll input and safety guidelines
- Responsive grid layout for multiple bets

### 6. CalculatorBetCard (`src/components/CalculatorBetCard.js`)

Individual bet card for calculator mode with editable inputs.

**Features:**
- Editable probability and payout fields
- Real-time calculation of edge and expected value
- Visual bet size indicator with half Kelly marker
- Warning indicators for negative edge or high Kelly percentages
- Remove bet functionality

## Calculator Mode Tooltips

Additional tooltip content specific to calculator mode (`src/components/CalculatorTooltips.js`):

- `kellyFormula` - Mathematical formula explanation
- `halfKelly` - Risk reduction strategy
- `decimalOdds` - European odds format
- `americanOdds` - US odds format
- `expectedValue` - Long-term profitability
- `multipleKelly` - Simultaneous bet optimization
- `kellySafety` - Conservative betting approaches

## Extending the Documentation

### Adding New Tooltips

1. Add tooltip content to `tooltipContent` object in `src/components/Tooltip.js`:
```javascript
export const tooltipContent = {
  // ... existing tooltips
  newMetric: {
    title: "New Metric Name",
    content: "Clear explanation of what this metric means",
    example: "Real-world example to help understanding"
  }
};
```

2. Use the tooltip in your component:
```javascript
<TooltipComponent {...tooltipContent.newMetric} />
```

### Adding Calculator Presets

Edit the `presets` array in `src/components/CalculatorMode.js`:
```javascript
const presets = [
  // ... existing presets
  { name: "New Scenario", probability: 0.45, payout: 2.5 }
];
```

### Adding Welcome Modal Steps

1. Edit the `steps` array in `src/components/WelcomeModal.js`:
```javascript
const steps = [
  // ... existing steps
  {
    icon: <YourIcon className="w-12 h-12 text-primary-400" />,
    title: "New Step Title",
    content: (
      <div className="space-y-4">
        <p className="text-gray-300">Your content here</p>
      </div>
    )
  }
];
```

## Best Practices

1. **Keep explanations simple** - Avoid jargon, use analogies
2. **Use visual cues** - Icons and colors help understanding
3. **Progressive disclosure** - Don't overwhelm with all information at once
4. **Interactive learning** - Let users explore and discover
5. **Consistent terminology** - Use the same terms throughout
6. **Provide real examples** - Concrete scenarios help understanding

## Future Enhancements

### Phase 2 - Interactive Learning
- Tutorial scenarios with preset situations
- Contextual hints based on user actions
- Visual indicators for bet quality
- Guided walkthroughs for both modes

### Phase 3 - Advanced Features
- Glossary modal for quick term lookups
- Achievement system for gamification
- Advanced strategy guide for experienced users
- Performance analytics with insights
- Export/import betting scenarios
- Historical bet tracking

## Accessibility

The documentation system includes:
- Keyboard navigation support
- Clear contrast ratios
- Descriptive labels
- Screen reader friendly markup
- Focus indicators
- Reduced motion options

## Customization

### Styling
- Colors defined in `tailwind.config.js`
- Glass morphism effects for modern look
- Responsive design for all screen sizes
- Dark theme optimized

### Content
- All text content is easily editable
- Support for rich HTML content
- Extensible tooltip system
- Modular component architecture 
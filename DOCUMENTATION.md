# Betting Simulator Documentation System

## Overview

The Betting Simulator now includes a comprehensive documentation system designed to help beginners understand betting concepts and the Kelly Criterion. The system includes:

1. **Welcome Modal** - An onboarding flow for first-time users
2. **Tooltip System** - Contextual help throughout the interface
3. **How It Works Button** - Quick access to the tutorial

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

### Creating Tutorial Scenarios

For Phase 2 implementation, create interactive scenarios:

1. Create `src/components/TutorialScenarios.js`
2. Define preset betting scenarios with lessons
3. Add a tutorial mode toggle to the main app

Example structure:
```javascript
const scenarios = [
  {
    id: "sure-thing",
    name: "The Sure Thing",
    description: "High probability, low payout scenario",
    bets: [{ probability: 0.9, payout: 1.2 }],
    lesson: "Even 'sure things' require careful sizing!",
    optimalBet: 0.08, // 8% of bankroll
  }
];
```

## Best Practices

1. **Keep explanations simple** - Avoid jargon, use analogies
2. **Use visual cues** - Icons and colors help understanding
3. **Progressive disclosure** - Don't overwhelm with all information at once
4. **Interactive learning** - Let users explore and discover
5. **Consistent terminology** - Use the same terms throughout

## Future Enhancements

### Phase 2 - Interactive Learning
- Tutorial scenarios with preset situations
- Contextual hints based on user actions
- Visual indicators for bet quality

### Phase 3 - Advanced Features
- Glossary modal for quick term lookups
- Achievement system for gamification
- Advanced strategy guide for experienced users
- Performance analytics with insights

## Accessibility

The documentation system includes:
- Keyboard navigation support
- Clear contrast ratios
- Descriptive labels
- Screen reader friendly markup

## Customization

### Styling
- Colors defined in `tailwind.config.js`
- Glass morphism effects for modern look
- Responsive design for all screen sizes

### Content
- All text content is easily editable
- Support for rich HTML content
- Extensible tooltip system 
export const calculatorTooltipContent = {
  kellyFormula: {
    title: "Kelly Criterion Formula",
    content: "f* = (bp - q) / b, where f* is the fraction to bet, b is the net odds, p is probability of winning, and q is probability of losing.",
    example: "For 60% win chance and 2x payout: f* = (1×0.6 - 0.4) / 1 = 20%"
  },
  
  halfKelly: {
    title: "Half Kelly Strategy",
    content: "Betting half the Kelly amount reduces volatility while still capturing most of the growth. It's psychologically easier to handle.",
    example: "If Kelly says bet 20%, Half Kelly = 10%. You get 75% of the growth with 50% of the volatility!"
  },
  
  decimalOdds: {
    title: "Decimal Odds",
    content: "European-style odds showing total return including your stake. To convert to payout, it's simply the decimal odds.",
    example: "Decimal odds of 2.50 means a $10 bet returns $25 total (2.5x your stake)"
  },
  
  americanOdds: {
    title: "American Odds",
    content: "US-style odds. Positive (+) shows profit on $100 bet. Negative (-) shows amount to bet for $100 profit.",
    example: "+150 means bet $100 to win $150. -200 means bet $200 to win $100."
  },
  
  expectedValue: {
    title: "Expected Value (EV)",
    content: "The average return of a bet if repeated many times. Positive EV means profitable in the long run.",
    example: "EV of +0.10 means you expect to gain 10 cents per dollar bet on average"
  },
  
  edgeInput: {
    title: "Your Estimated Edge",
    content: "The advantage you believe you have over the implied probability. This is your confidence in the bet.",
    example: "If implied odds are 40% and you think it's really 50%, your edge is +10%"
  },
  
  multipleKelly: {
    title: "Multiple Simultaneous Bets",
    content: "When betting on multiple events at once, Kelly sizes are adjusted to account for correlation and total risk.",
    example: "Two 10% Kelly bets don't mean bet 20% total - the calculator optimizes the combination"
  },
  
  bankrollOptional: {
    title: "Bankroll Size (Optional)",
    content: "Enter your total betting bankroll to see dollar amounts. Leave empty to see percentages only.",
    example: "With $1,000 bankroll and 5% Kelly, you'd bet $50"
  },
  
  removeBet: {
    title: "Remove This Bet",
    content: "Remove this bet from your calculations. Only available in calculator mode.",
    example: "Click to remove if you decide not to make this bet"
  },
  
  kellySafety: {
    title: "Kelly Safety Levels",
    content: "Full Kelly: Maximum growth but high volatility. Half Kelly: 75% growth, 50% volatility. Quarter Kelly: Conservative approach.",
    example: "Many professionals use Half Kelly or less for psychological comfort"
  }
}; 
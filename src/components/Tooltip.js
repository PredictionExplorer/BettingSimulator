import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

const Tooltip = ({ content, title, example, children, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 -mt-1',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 -mb-1 rotate-180',
    left: 'left-full top-1/2 -translate-y-1/2 -ml-1 -rotate-90',
    right: 'right-full top-1/2 -translate-y-1/2 -mr-1 rotate-90'
  };

  return (
    <div 
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children || (
        <button className="p-0.5 rounded-full hover:bg-white/10 transition-colors">
          <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-300" />
        </button>
      )}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 ${positionClasses[position]} pointer-events-none`}
          >
            <div className="relative">
              <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-3 max-w-xs">
                {title && (
                  <h4 className="font-semibold text-white text-sm mb-1">{title}</h4>
                )}
                {content && (
                  <p className="text-gray-300 text-sm leading-relaxed">{content}</p>
                )}
                {example && (
                  <div className="mt-2 pt-2 border-t border-gray-700">
                    <p className="text-xs text-gray-400 italic">{example}</p>
                  </div>
                )}
              </div>
              {/* Arrow */}
              <div className={`absolute w-0 h-0 ${arrowClasses[position]}`}>
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-900" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Tooltip content definitions
export const tooltipContent = {
  probability: {
    title: "Win Probability",
    content: "How likely you are to win this bet. A 70% probability means you'll win about 7 out of 10 times if you made this bet repeatedly.",
    example: "Think of it like a weighted coin flip - 70% means it lands on 'heads' (you win) 7 out of 10 times!"
  },
  
  payout: {
    title: "Payout Multiplier",
    content: "How much money you get back if you win. A 2.5x payout means betting $10 returns $25 total (your $10 bet + $15 profit).",
    example: "Like a slot machine: bet 1 coin, win 2.5 coins back!"
  },
  
  edge: {
    title: "Your Edge (Advantage)",
    content: "The mathematical advantage of this bet. Positive edge means the odds are in your favor. Negative edge means the house has the advantage.",
    example: "Positive edge = good bet, like being the casino instead of the player!"
  },
  
  impliedOdds: {
    title: "Implied Odds",
    content: "The break-even probability based on the payout. This is what the probability would need to be for the bet to be 'fair' with no edge.",
    example: "If payout is 2x, implied odds are 50% - you'd need to win half the time to break even."
  },
  
  optimalSize: {
    title: "Optimal Bet Size",
    content: "The mathematically perfect amount to bet for maximum long-term growth, calculated using the Kelly Criterion.",
    example: "Think of it as GPS for betting - it shows the most efficient route to grow your money!"
  },
  
  bankroll: {
    title: "Your Bankroll",
    content: "The total amount of money you have available for betting. Never bet money you can't afford to lose!",
    example: "Your 'betting wallet' - manage it wisely to stay in the game!"
  },
  
  optimalBankroll: {
    title: "Optimal Strategy Bankroll",
    content: "Shows how much money you'd have if you always bet the mathematically optimal amount using the Kelly Criterion.",
    example: "This is your 'perfect play' benchmark - try to match or beat it!"
  },
  
  betAmount: {
    title: "Bet Amount",
    content: "The percentage of your bankroll you're betting. Betting too much can lead to ruin, while betting too little means slower growth.",
    example: "Like choosing your speed - too fast is risky, too slow means you might miss opportunities!"
  },
  
  totalBets: {
    title: "Total Rounds Played",
    content: "The number of betting rounds you've completed. More rounds give you better data to see if your strategy is working.",
    example: "Each round is a learning opportunity - patterns emerge over time!"
  },
  
  expectedGrowth: {
    title: "Expected Growth Rate",
    content: "The theoretical average growth rate per bet if you use the optimal Kelly sizing for all bets shown.",
    example: "Like compound interest - small edges add up to big gains over time!"
  }
};

export default Tooltip; 
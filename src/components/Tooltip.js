import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

const TooltipPortal = ({ children, isVisible, targetRef, position }) => {
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!targetRef.current || !isVisible) return;

    const updatePosition = () => {
      const rect = targetRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      let top = 0;
      let left = 0;

      switch (position) {
        case 'top':
          top = rect.top + scrollY - 8; // 8px gap
          left = rect.left + scrollX + rect.width / 2;
          break;
        case 'bottom':
          top = rect.bottom + scrollY + 8;
          left = rect.left + scrollX + rect.width / 2;
          break;
        case 'left':
          top = rect.top + scrollY + rect.height / 2;
          left = rect.left + scrollX - 8;
          break;
        case 'right':
          top = rect.top + scrollY + rect.height / 2;
          left = rect.right + scrollX + 8;
          break;
        default:
          break;
      }

      setCoords({ top, left });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [targetRef, isVisible, position]);

  if (!isVisible) return null;

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 -mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 -ml-2'
  };

  return ReactDOM.createPortal(
    <div
      style={{
        position: 'absolute',
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        zIndex: 9999,
      }}
      className="pointer-events-none"
    >
      <div className={`relative ${positionClasses[position]}`}>
        {children}
      </div>
    </div>,
    document.body
  );
};

const Tooltip = ({ content, title, example, children, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const targetRef = useRef(null);

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 -mt-1',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 -mb-1 rotate-180',
    left: 'left-full top-1/2 -translate-y-1/2 -ml-1 -rotate-90',
    right: 'right-full top-1/2 -translate-y-1/2 -mr-1 rotate-90'
  };

  return (
    <>
      <div 
        ref={targetRef}
        className="relative inline-flex"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children || (
          <button className="p-0.5 rounded-full hover:bg-white/10 transition-colors">
            <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-300" />
          </button>
        )}
      </div>
      
      <TooltipPortal isVisible={isVisible} targetRef={targetRef} position={position}>
        <AnimatePresence>
          {isVisible && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
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
      </TooltipPortal>
    </>
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
  },
  
  // New tooltip content for additional UI elements
  placeBets: {
    title: "Place Your Bets",
    content: "Click to lock in your bet amounts and see the results. Make sure your total bets don't exceed 100% of your bankroll!",
    example: "Once you click, the dice are rolled and you'll see if you won or lost each bet."
  },
  
  nextRound: {
    title: "Continue to Next Round",
    content: "Generate new betting opportunities and continue playing. Your bankroll carries over from round to round.",
    example: "Each round brings new opportunities - stay disciplined and stick to your strategy!"
  },
  
  addBet: {
    title: "Add Another Bet",
    content: "Add one more betting opportunity to the current round. The optimal sizes will be recalculated for all bets.",
    example: "More bets mean more diversification, but also more complexity in sizing!"
  },
  
  showChart: {
    title: "Performance Chart",
    content: "Toggle the bankroll history chart to see how your money has grown (or shrunk) over time compared to the optimal strategy.",
    example: "Visual feedback helps you see if your strategy is working in the long run."
  },
  
  minBets: {
    title: "Minimum Bets per Round",
    content: "The minimum number of betting opportunities that will appear in each round.",
    example: "Set to 1 for simple rounds, or higher for more complex decision-making."
  },
  
  maxBets: {
    title: "Maximum Bets per Round",
    content: "The maximum number of betting opportunities that will appear in each round.",
    example: "More bets = more choices, but don't get overwhelmed!"
  },
  
  minProbability: {
    title: "Minimum Win Probability",
    content: "The lowest possible win probability for generated bets. Lower probabilities usually come with higher payouts.",
    example: "5% minimum means you might see 'long shot' bets with big payouts."
  },
  
  maxProbability: {
    title: "Maximum Win Probability",
    content: "The highest possible win probability for generated bets. Higher probabilities usually have lower payouts.",
    example: "95% maximum means you might see 'almost sure thing' bets with small payouts."
  },
  
  betState: {
    title: "Bet Result",
    content: "Shows whether you won (green) or lost (red) this bet after placing it.",
    example: "Win or lose, focus on whether you made a good decision, not just the outcome!"
  }
};

export default Tooltip; 
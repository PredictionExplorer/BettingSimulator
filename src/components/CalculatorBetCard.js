import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, DollarSign, Percent, AlertCircle } from 'lucide-react';
import { cn } from '../utils/cn';
import TooltipComponent, { tooltipContent } from './Tooltip';
import { calculatorTooltipContent } from './CalculatorTooltips';

const CalculatorBetCard = ({ bet, onUpdate, onRemove, index, bankroll }) => {
  const [displayProbability, setDisplayProbability] = useState("");
  const [displayPayout, setDisplayPayout] = useState("");

  useEffect(() => {
    setDisplayProbability((bet.probability * 100).toFixed(1));
    setDisplayPayout(bet.payout.toFixed(2));
  }, [bet.probability, bet.payout]);

  const edge = bet.probability - (1.0 / bet.payout);
  const edgePercentage = (edge * 100).toFixed(2);
  const expectedValue = (bet.probability * bet.payout - 1).toFixed(3);
  
  const handleProbabilityChange = (e) => {
    setDisplayProbability(e.target.value);
  };

  const handleProbabilityBlur = () => {
    let probNum = parseFloat(displayProbability) / 100;
    if (isNaN(probNum) || probNum < 0.01) probNum = 0.01;
    if (probNum > 0.99) probNum = 0.99;
    onUpdate(bet.id, { ...bet, probability: probNum });
    // useEffect will sync displayProbability if probNum was changed
  };
  
  const handlePayoutChange = (e) => {
    setDisplayPayout(e.target.value);
  };

  const handlePayoutBlur = () => {
    let payoutNum = parseFloat(displayPayout);
    if (isNaN(payoutNum) || payoutNum < 1.01) payoutNum = 1.01;
    // No upper bound explicitly set for payout, but can be added if needed
    onUpdate(bet.id, { ...bet, payout: payoutNum });
    // useEffect will sync displayPayout if payoutNum was changed
  };
  
  // Warning states
  const hasNegativeEdge = edge < 0;
  const hasHighKelly = bet.optimalSize && bet.optimalSize > 0.25;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn(
        "relative group overflow-hidden rounded-2xl glass-card border transition-all duration-300",
        hasNegativeEdge ? "border-red-500/30" : "border-white/20",
        "hover:shadow-2xl hover:shadow-primary-500/10"
      )}
    >
      {/* Remove button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onRemove(bet.id)}
        className="absolute top-3 right-3 p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition-all z-10"
      >
        <X className="w-4 h-4" />
        <TooltipComponent 
          {...calculatorTooltipContent.removeBet} 
          position="left"
        >
          <div className="absolute inset-0" />
        </TooltipComponent>
      </motion.button>
      
      <div className="relative p-6 space-y-4">
        {/* Header - Use index + 1 for sequential numbering */}
        <div className="flex items-center justify-between pr-12">
          <h3 className="text-lg font-bold text-white">
            Bet #{index + 1}
          </h3>
          {hasNegativeEdge && (
            <div className="flex items-center gap-1 text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs">Negative Edge</span>
            </div>
          )}
        </div>
        
        {/* Editable Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-1">
              <Percent className="w-3 h-3" />
              Win Probability
              <TooltipComponent {...tooltipContent.probability} position="top" />
            </label>
            <input
              type="number"
              value={displayProbability}
              onChange={handleProbabilityChange}
              onBlur={handleProbabilityBlur} // Validate on blur
              min="1"
              max="99"
              step="0.1"
              className="w-full px-3 py-2 bg-background-tertiary border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500 transition-colors"
            />
            {/* Probability Slider */}
            <div className="relative">
              <input
                type="range"
                min="1"
                max="99"
                step="0.1"
                value={bet.probability * 100} // Slider still reflects numeric prop
                onChange={(e) => {
                  const prob = parseFloat(e.target.value) / 100;
                  onUpdate(bet.id, { ...bet, probability: prob });
                }}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb-small"
                style={{
                  background: `linear-gradient(to right, #0066ff 0%, #0066ff ${bet.probability * 100}%, #374151 ${bet.probability * 100}%, #374151 100%)`
                }}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              Payout (x)
              <TooltipComponent {...tooltipContent.payout} position="top" />
            </label>
            <input
              type="number"
              value={displayPayout}
              onChange={handlePayoutChange}
              onBlur={handlePayoutBlur} // Validate on blur
              min="1.01"
              step="0.01"
              className="w-full px-3 py-2 bg-background-tertiary border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500 transition-colors"
            />
            {/* Payout Slider */}
            <div className="relative">
              <input
                type="range"
                min="1.01"
                max="20" // Max for slider, input can go higher
                step="0.01"
                value={bet.payout} // Slider still reflects numeric prop
                onChange={(e) => {
                  const payout = parseFloat(e.target.value);
                  onUpdate(bet.id, { ...bet, payout: payout });
                }}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb-small"
                style={{
                  background: `linear-gradient(to right, #0066ff 0%, #0066ff ${Math.min(100, ((bet.payout - 1.01) / (20 - 1.01)) * 100)}%, #374151 ${Math.min(100, ((bet.payout - 1.01) / (20 - 1.01)) * 100)}%, #374151 100%)`
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Calculated Values */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Implied Odds:</span>
            <span className="font-mono text-white">{(100.0 / bet.payout).toFixed(1)}%</span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400 flex items-center gap-1">
              Edge:
              <TooltipComponent {...tooltipContent.edge} position="right" />
            </span>
            <span className={cn(
              "font-mono font-semibold",
              edge > 0 ? "text-green-400" : "text-red-400"
            )}>
              {edge > 0 ? '+' : ''}{edgePercentage}%
            </span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400 flex items-center gap-1">
              Expected Value:
              <TooltipComponent {...calculatorTooltipContent.expectedValue} position="right" />
            </span>
            <span className={cn(
              "font-mono",
              parseFloat(expectedValue) > 0 ? "text-green-400" : "text-red-400"
            )}>
              {parseFloat(expectedValue) > 0 ? '+' : ''}{expectedValue}
            </span>
          </div>
        </div>
        
        {/* Kelly Results */}
        <div className="space-y-3 pt-3 border-t border-white/10">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-white">Optimal Kelly:</span>
              <span className={cn(
                "text-lg font-bold",
                hasHighKelly ? "text-yellow-400" : "text-primary-400"
              )}>
                {((bet.optimalSize || 0) * 100).toFixed(2)}%
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Half Kelly (Safer):</span>
              <span className="font-semibold text-white">
                {((bet.optimalSize || 0) * 50).toFixed(2)}%
              </span>
            </div>
          </div>
          
          {bankroll && bet.optimalSize && (
            <div className="pt-2 border-t border-white/5 space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Full Kelly:</span>
                <span className="font-mono text-gray-300">
                  ${(bankroll * bet.optimalSize).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Half Kelly:</span>
                <span className="font-mono text-gray-300">
                  ${(bankroll * bet.optimalSize * 0.5).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
        
        {/* Visual Bet Size Indicator */}
        <div className="pt-2">
          <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (bet.optimalSize || 0) * 100)}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={cn(
                "absolute left-0 top-0 h-full rounded-full",
                hasHighKelly ? "bg-gradient-to-r from-yellow-500 to-yellow-600" : "bg-gradient-to-r from-primary-500 to-primary-600"
              )}
            />
            {/* Half Kelly marker */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-white/50"
              style={{ left: `${Math.min(100, (bet.optimalSize || 0) * 50)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>0%</span>
            <span>Half Kelly</span>
            <span>Full Kelly</span>
          </div>
        </div>
        
        {/* Warnings */}
        {hasHighKelly && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
          >
            <p className="text-xs text-yellow-400">
              ⚠️ High Kelly percentage. Consider using Half Kelly for lower risk.
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default CalculatorBetCard; 
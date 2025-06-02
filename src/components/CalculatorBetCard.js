import React from 'react';
import { motion } from 'framer-motion';
import { X, DollarSign, Percent, TrendingUp, AlertCircle } from 'lucide-react';
import { cn } from '../utils/cn';
import TooltipComponent, { tooltipContent } from './Tooltip';
import { calculatorTooltipContent } from './CalculatorTooltips';

const CalculatorBetCard = ({ bet, onUpdate, onRemove, index, bankroll }) => {
  const edge = bet.probability - (1.0 / bet.payout);
  const edgePercentage = (edge * 100).toFixed(2);
  const expectedValue = (bet.probability * bet.payout - 1).toFixed(3);
  
  const handleProbabilityChange = (value) => {
    const prob = Math.min(99, Math.max(1, parseFloat(value) || 0)) / 100;
    onUpdate(bet.id, { ...bet, probability: prob });
  };
  
  const handlePayoutChange = (value) => {
    const payout = Math.max(1.01, parseFloat(value) || 1.01);
    onUpdate(bet.id, { ...bet, payout });
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
        {/* Header */}
        <div className="flex items-center justify-between pr-12">
          <h3 className="text-lg font-bold text-white">
            Bet #{bet.id + 1}
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
              value={(bet.probability * 100).toFixed(1)}
              onChange={(e) => handleProbabilityChange(e.target.value)}
              min="1"
              max="99"
              step="0.1"
              className="w-full px-3 py-2 bg-background-tertiary border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              Payout (x)
              <TooltipComponent {...tooltipContent.payout} position="top" />
            </label>
            <input
              type="number"
              value={bet.payout.toFixed(2)}
              onChange={(e) => handlePayoutChange(e.target.value)}
              min="1.01"
              step="0.01"
              className="w-full px-3 py-2 bg-background-tertiary border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500 transition-colors"
            />
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
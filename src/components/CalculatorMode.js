import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Percent,
  ChevronDown,
  ChevronUp,
  Info,
  Copy,
  CheckCircle
} from 'lucide-react';
import { cn } from '../utils/cn';
import CalculatorBetCard from './CalculatorBetCard';
import TooltipComponent, { tooltipContent } from './Tooltip';
import { calculatorTooltipContent } from './CalculatorTooltips';

const CalculatorMode = ({ multiKellyFunction }) => {
  const [bets, setBets] = useState([]);
  const [bankroll, setBankroll] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inputMethod, setInputMethod] = useState('probability-payout');
  
  // Example presets
  const presets = [
    { name: "Sports Underdog", probability: 0.30, payout: 4.0 },
    { name: "Heavy Favorite", probability: 0.80, payout: 1.25 },
    { name: "Coin Flip Plus", probability: 0.55, payout: 2.0 },
    { name: "Long Shot", probability: 0.15, payout: 8.0 }
  ];
  
  // Convert different odds formats
  const convertOdds = useCallback((value, fromFormat, toFormat) => {
    let probability, payout;
    
    switch (fromFormat) {
      case 'decimal':
        payout = parseFloat(value) || 2.0;
        probability = 0.5; // Default probability
        break;
      case 'american':
        const american = parseFloat(value) || 100;
        if (american > 0) {
          payout = 1 + (american / 100);
        } else {
          payout = 1 + (100 / Math.abs(american));
        }
        probability = 0.5; // Default probability
        break;
      default:
        probability = (parseFloat(value) || 50) / 100;
        payout = 2.0; // Default payout
    }
    
    return { probability, payout };
  }, []);
  
  // Add a new bet
  const addBet = useCallback((preset = null) => {
    const newBet = {
      id: Date.now(),
      probability: preset?.probability || 0.5,
      payout: preset?.payout || 2.0,
      optimalSize: 0
    };
    setBets(prev => [...prev, newBet]);
  }, []);
  
  // Update a bet
  const updateBet = useCallback((id, updatedBet) => {
    setBets(prev => prev.map(bet => 
      bet.id === id ? updatedBet : bet
    ));
  }, []);
  
  // Remove a bet
  const removeBet = useCallback((id) => {
    setBets(prev => prev.filter(bet => bet.id !== id));
  }, []);
  
  // Calculate Kelly for all bets
  useEffect(() => {
    if (bets.length === 0 || !multiKellyFunction) return;
    
    const forKelly = [];
    bets.forEach(bet => {
      forKelly.push(bet.probability);
      forKelly.push(bet.payout - 1);
    });
    
    const result = multiKellyFunction(forKelly);
    
    setBets(prev => prev.map((bet, index) => ({
      ...bet,
      optimalSize: result.proportions[index]
    })));
  }, [bets, multiKellyFunction]);
  
  // Copy results to clipboard
  const copyResults = useCallback(() => {
    const results = bets.map((bet, index) => {
      const edge = ((bet.probability - (1.0 / bet.payout)) * 100).toFixed(2);
      return `Bet ${index + 1}: ${(bet.probability * 100).toFixed(1)}% win @ ${bet.payout.toFixed(2)}x payout
  Edge: ${edge}%
  Kelly: ${(bet.optimalSize * 100).toFixed(2)}%
  Half Kelly: ${(bet.optimalSize * 50).toFixed(2)}%`;
    }).join('\n\n');
    
    navigator.clipboard.writeText(results);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [bets]);
  
  // Calculate summary stats
  const totalKelly = bets.reduce((sum, bet) => sum + bet.optimalSize, 0);
  const totalHalfKelly = totalKelly * 0.5;
  const hasPositiveEdgeBets = bets.some(bet => bet.probability > (1.0 / bet.payout));
  
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
          <Calculator className="w-8 h-8 text-primary-400" />
          Kelly Criterion Calculator
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Calculate optimal bet sizes for real betting opportunities using the Kelly Criterion
        </p>
      </motion.div>
      
      {/* Quick Presets */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-4"
      >
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Quick Examples:</h3>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <motion.button
              key={preset.name}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => addBet(preset)}
              className="px-4 py-2 bg-primary-500/20 hover:bg-primary-500/30 text-primary-300 rounded-lg text-sm font-medium transition-colors"
            >
              {preset.name}
            </motion.button>
          ))}
        </div>
      </motion.div>
      
      {/* Summary Card */}
      {bets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-6 border-primary-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-400" />
              Summary
            </h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={copyResults}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Results</span>
                </>
              )}
            </motion.button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-400">Total Kelly %</p>
              <p className={cn(
                "text-2xl font-bold",
                totalKelly > 1 ? "text-red-400" : "text-primary-400"
              )}>
                {(totalKelly * 100).toFixed(2)}%
              </p>
              {totalKelly > 1 && (
                <p className="text-xs text-red-400">⚠️ Over 100%!</p>
              )}
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-gray-400 flex items-center gap-1">
                Total Half Kelly %
                <TooltipComponent {...calculatorTooltipContent.halfKelly} position="top" />
              </p>
              <p className="text-2xl font-bold text-white">
                {(totalHalfKelly * 100).toFixed(2)}%
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-gray-400">Active Bets</p>
              <p className="text-2xl font-bold text-white">{bets.length}</p>
              <p className={cn(
                "text-xs",
                hasPositiveEdgeBets ? "text-green-400" : "text-gray-500"
              )}>
                {hasPositiveEdgeBets ? "✓ Has +EV bets" : "No +EV bets"}
              </p>
            </div>
          </div>
          
          {bankroll && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Full Kelly Amount</p>
                  <p className="text-xl font-semibold text-primary-400">
                    ${(parseFloat(bankroll) * totalKelly).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Half Kelly Amount</p>
                  <p className="text-xl font-semibold text-white">
                    ${(parseFloat(bankroll) * totalHalfKelly).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
      
      {/* Bets Grid */}
      <motion.div layout className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnimatePresence>
          {bets.map((bet, index) => (
            <CalculatorBetCard
              key={bet.id}
              bet={bet}
              index={index}
              onUpdate={updateBet}
              onRemove={removeBet}
              bankroll={bankroll ? parseFloat(bankroll) : null}
            />
          ))}
        </AnimatePresence>
        
        {/* Add Bet Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -5 }}
          onClick={() => addBet()}
          className="relative group overflow-hidden rounded-2xl glass-card border border-dashed border-white/20 hover:border-primary-500/50 transition-all duration-300 cursor-pointer min-h-[200px] flex items-center justify-center"
        >
          <div className="text-center space-y-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 90 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="inline-flex p-4 rounded-full bg-primary-500/20"
            >
              <Plus className="w-8 h-8 text-primary-400" />
            </motion.div>
            <p className="text-lg font-semibold text-gray-300">Add New Bet</p>
            <p className="text-sm text-gray-500">Click to add another betting opportunity</p>
          </div>
        </motion.div>
      </motion.div>
      
      {/* Advanced Options */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card overflow-hidden"
      >
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
        >
          <span className="text-lg font-semibold text-white">Advanced Options</span>
          {showAdvanced ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6 space-y-4 border-t border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Bankroll Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      Bankroll Size (Optional)
                      <TooltipComponent {...calculatorTooltipContent.bankrollOptional} position="top" />
                    </label>
                    <input
                      type="number"
                      value={bankroll}
                      onChange={(e) => setBankroll(e.target.value)}
                      placeholder="1000"
                      min="0"
                      step="100"
                      className="w-full px-4 py-2 bg-background-tertiary border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                    />
                  </div>
                  
                  {/* Kelly Safety Level */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Kelly Safety Guide
                      <TooltipComponent {...calculatorTooltipContent.kellySafety} position="top" />
                    </label>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between text-gray-400">
                        <span>Full Kelly:</span>
                        <span>Maximum growth, high volatility</span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>Half Kelly:</span>
                        <span>75% growth, 50% volatility</span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>Quarter Kelly:</span>
                        <span>Conservative, smooth growth</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Multiple Bets Explanation */}
                <div className="p-4 bg-primary-500/10 border border-primary-500/30 rounded-lg">
                  <div className="flex gap-3">
                    <Info className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-primary-300">
                        Multiple Simultaneous Bets
                      </p>
                      <p className="text-sm text-gray-300">
                        When you have multiple betting opportunities at the same time, the Kelly Criterion adjusts each bet size to optimize overall growth while managing total risk. The sum of all Kelly percentages might exceed 100% if all bets have strong positive edges.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default CalculatorMode; 
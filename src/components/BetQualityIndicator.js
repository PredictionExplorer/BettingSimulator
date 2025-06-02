import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

const BetQualityIndicator = ({ betPercentage, optimalSize }) => {
  if (!optimalSize) return null;

  // Calculate how close to optimal the bet size is
  const optimalPercentage = optimalSize * 100;
  const difference = betPercentage - optimalPercentage;
  const absoluteDifference = Math.abs(difference);
  
  // Calculate how "correct" the bet is (100% = perfect, 0% = very wrong)
  const correctnessScore = Math.max(0, 100 - absoluteDifference * 2);
  
  // Determine the label
  const getLabel = () => {
    if (absoluteDifference < 2) return '✨ Perfect Kelly Sizing!';
    if (absoluteDifference < 5) return '👍 Very Close to Optimal';
    if (absoluteDifference < 10) return '📊 Near Optimal';
    if (difference < 0) return `🛡️ Conservative (Under-betting by ${absoluteDifference.toFixed(1)}%)`;
    return `⚡ Aggressive (Over-betting by ${absoluteDifference.toFixed(1)}%)`;
  };

  // Determine the color based on correctness
  const getBarColor = () => {
    if (correctnessScore > 90) return 'bg-gradient-to-r from-green-500 to-green-400';
    if (correctnessScore > 70) return 'bg-gradient-to-r from-yellow-500 to-yellow-400';
    if (correctnessScore > 50) return 'bg-gradient-to-r from-orange-500 to-orange-400';
    return 'bg-gradient-to-r from-red-500 to-red-400';
  };

  const getTextColor = () => {
    if (absoluteDifference < 2) return 'text-green-400';
    if (absoluteDifference < 5) return 'text-blue-400';
    if (absoluteDifference < 10) return 'text-yellow-400';
    if (difference < 0) return 'text-gray-400';
    return 'text-orange-400';
  };

  return (
    <div className="space-y-2">
      {/* Kelly Comparison Label */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xs font-medium"
      >
        <span className={cn("flex items-center gap-1", getTextColor())}>
          {getLabel()}
        </span>
      </motion.div>

      {/* Kelly Accuracy Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-400">
          <span>Kelly Accuracy</span>
          <span>{correctnessScore.toFixed(0)}%</span>
        </div>
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${correctnessScore}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={cn("h-full rounded-full", getBarColor())}
          />
        </div>
      </div>
    </div>
  );
};

export default BetQualityIndicator; 
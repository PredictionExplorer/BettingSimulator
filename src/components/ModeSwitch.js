import React from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Calculator } from 'lucide-react';
import { cn } from '../utils/cn';

const ModeSwitch = ({ currentMode, onModeChange }) => {
  const modes = [
    {
      id: 'simulation',
      label: 'Simulation Mode',
      icon: Gamepad2,
      description: 'Practice betting with virtual money'
    },
    {
      id: 'calculator',
      label: 'Calculator Mode',
      icon: Calculator,
      description: 'Calculate optimal bets for real opportunities'
    }
  ];

  return (
    <div className="glass-card p-2 inline-flex rounded-2xl">
      <div className="flex gap-2">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isActive = currentMode === mode.id;
          
          return (
            <motion.button
              key={mode.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onModeChange(mode.id)}
              className={cn(
                "relative px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2",
                isActive 
                  ? "bg-primary-500 text-white shadow-lg shadow-primary-500/25" 
                  : "bg-transparent text-gray-400 hover:text-white hover:bg-white/10"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeMode"
                  className="absolute inset-0 bg-primary-500 rounded-xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div className="relative flex items-center gap-2">
                <Icon className="w-5 h-5" />
                <span className="font-medium">{mode.label}</span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default ModeSwitch; 
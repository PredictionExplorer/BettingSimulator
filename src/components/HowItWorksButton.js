import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, BookOpen } from 'lucide-react';

const HowItWorksButton = ({ onClick, variant = 'default' }) => {
  if (variant === 'floating') {
    return (
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
      >
        <HelpCircle className="w-5 h-5" />
        <span className="font-medium">How It Works</span>
      </motion.button>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-all"
    >
      <BookOpen className="w-4 h-4" />
      <span className="text-sm font-medium">How It Works</span>
    </motion.button>
  );
};

export default HowItWorksButton; 
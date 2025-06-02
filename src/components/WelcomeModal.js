import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Sparkles, TrendingUp, Brain, Target } from 'lucide-react';

const WelcomeModal = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: <Sparkles className="w-12 h-12 text-primary-400" />,
      title: "Welcome to Betting Intuition Trainer!",
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            Learn to make smarter betting decisions by developing your intuition for risk and reward.
          </p>
          <p className="text-gray-300">
            This simulator helps you understand when to bet big, when to bet small, and when not to bet at all!
          </p>
          <div className="bg-primary-500/10 border border-primary-500/30 rounded-lg p-4 mt-4">
            <p className="text-sm text-primary-300">
              💡 Compare your choices against mathematically optimal strategies in real-time
            </p>
          </div>
        </div>
      )
    },
    {
      icon: <Target className="w-12 h-12 text-green-400" />,
      title: "How Betting Works",
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            Every bet has two key components:
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-400 font-bold">1</span>
              </div>
              <div>
                <p className="font-semibold text-white">Probability of Winning</p>
                <p className="text-sm text-gray-400">How likely you are to win (e.g., 70% chance)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-green-400 font-bold">2</span>
              </div>
              <div>
                <p className="font-semibold text-white">Payout if You Win</p>
                <p className="text-sm text-gray-400">How much you get back (e.g., 2x means double your money)</p>
              </div>
            </div>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mt-4">
            <p className="text-sm text-amber-300">
              Example: Bet $10 with 2.5x payout → Win = Get $25 back ($15 profit) | Lose = Lose $10
            </p>
          </div>
        </div>
      )
    },
    {
      icon: <Brain className="w-12 h-12 text-purple-400" />,
      title: "Your Goal",
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            Start with <span className="text-white font-bold">$1,000</span> and grow it as much as possible!
          </p>
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg p-4">
              <p className="font-semibold text-white mb-2">🎯 Key Strategy Tips:</p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Look for positive "edge" (when odds are in your favor)</li>
                <li>• Don't bet everything on one opportunity</li>
                <li>• The optimal bet size depends on both probability AND payout</li>
              </ul>
            </div>
          </div>
          <p className="text-gray-300">
            The simulator shows the <span className="text-green-400 font-semibold">"Optimal Bankroll"</span> using the Kelly Criterion - a mathematical formula for perfect bet sizing.
          </p>
          <p className="text-sm text-gray-400 italic">
            Can you match or beat the optimal strategy? Let's find out! 🚀
          </p>
        </div>
      )
    },
    {
      icon: <TrendingUp className="w-12 h-12 text-primary-400" />,
      title: "Quick Start Guide",
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">Here's how to use the simulator:</p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-primary-500/30 flex items-center justify-center flex-shrink-0">
                <span className="text-primary-400 text-xs font-bold">1</span>
              </div>
              <p className="text-sm text-gray-300">Review each betting opportunity's probability and payout</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-primary-500/30 flex items-center justify-center flex-shrink-0">
                <span className="text-primary-400 text-xs font-bold">2</span>
              </div>
              <p className="text-sm text-gray-300">Adjust the slider to choose your bet amount (0-100% of bankroll)</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-primary-500/30 flex items-center justify-center flex-shrink-0">
                <span className="text-primary-400 text-xs font-bold">3</span>
              </div>
              <p className="text-sm text-gray-300">Click "Place Bets" to see the results</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-primary-500/30 flex items-center justify-center flex-shrink-0">
                <span className="text-primary-400 text-xs font-bold">4</span>
              </div>
              <p className="text-sm text-gray-300">Compare your performance to the optimal strategy</p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-primary-500/20 to-purple-500/20 rounded-lg p-4 border border-primary-500/30">
            <p className="text-sm text-white font-semibold">
              💪 Ready to train your betting intuition? Let's go!
            </p>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'ArrowRight') {
        nextStep();
      } else if (e.key === 'ArrowLeft') {
        prevStep();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, currentStep]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full max-w-2xl bg-gradient-to-br from-background-secondary to-background-tertiary rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors z-10"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>

              {/* Progress bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gray-700">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary-500 to-purple-500"
                  animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Content */}
              <div className="p-8 pt-12">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Icon */}
                    <div className="flex justify-center">
                      {steps[currentStep].icon}
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-white text-center">
                      {steps[currentStep].title}
                    </h2>

                    {/* Content */}
                    <div className="max-h-[50vh] overflow-y-auto">
                      {steps[currentStep].content}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between p-6 pt-0">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    currentStep === 0
                      ? 'opacity-50 cursor-not-allowed'
                      : 'bg-white/5 hover:bg-white/10 text-gray-300'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>

                {/* Step indicators */}
                <div className="flex gap-2">
                  {steps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentStep
                          ? 'w-8 bg-primary-500'
                          : 'bg-gray-600 hover:bg-gray-500'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextStep}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium transition-all"
                >
                  {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WelcomeModal; 
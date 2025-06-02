import React, { useState, useEffect, useCallback } from 'react';
import init, { multiple_kelly } from './pkg/kelly_sim';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  BarChart3,
  Plus,
  ChevronRight,
  Sparkles,
  Target,
  Percent,
  Award
} from 'lucide-react';
import CountUp from 'react-countup';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getRandomFloat } from './mathUtils';
import { cn } from './utils/cn';
import confetti from 'canvas-confetti';
import WelcomeModal from './components/WelcomeModal';
import TooltipComponent, { tooltipContent } from './components/Tooltip';
import HowItWorksButton from './components/HowItWorksButton';

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3">
        <p className="text-sm text-gray-300">{`Bet #${label}`}</p>
        <p className="text-sm font-semibold text-white">
          ${payload[0].value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
};

// helper to make one random bet
function generateOneBet(minProbability, maxProbability) {
  const p = getRandomFloat(minProbability / 100.0, maxProbability / 100.0);
  const implied = 1 / p;
  const b = getRandomFloat(implied, implied + (implied - 1) * 2);
  return {
    probability: p,
    payout: b,
    betPercentage: getRandomFloat(0, 70), // Random bet size between 0-70%
    id: null,
    optimalSize: null,
    state: "neutral",
    result: null,
  };
}

// Modern Bet Card Component
const BetCard = React.memo(({ bet, onSliderChange, index }) => {
  const stateColors = {
    win: 'from-green-500/20 to-green-600/20 border-green-500/50',
    lose: 'from-red-500/20 to-red-600/20 border-red-500/50',
    neutral: 'from-white/5 to-white/10 border-white/20'
  };

  const edge = bet.probability - (1.0 / bet.payout);
  const edgePercentage = (edge * 100).toFixed(2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      className={cn(
        "relative group overflow-hidden rounded-2xl bg-gradient-to-br backdrop-blur-xl border transition-all duration-300",
        stateColors[bet.state],
        "hover:shadow-2xl hover:shadow-primary-500/10"
      )}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 via-primary-500/5 to-primary-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Win/Loss indicator */}
      {bet.state !== 'neutral' && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={cn(
            "absolute top-3 right-3 w-3 h-3 rounded-full ring-4",
            bet.state === 'win' ? 'bg-green-400 ring-green-400/20' : 'bg-red-400 ring-red-400/20'
          )}
        >
          <TooltipComponent 
            {...tooltipContent.betState} 
            position="left"
          >
            <div className="w-full h-full" />
          </TooltipComponent>
        </motion.div>
      )}

      <div className="relative p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-primary-400" />
            Bet #{bet.id + 1}
          </h3>
          {bet.state !== 'neutral' && bet.optimalSize && (
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary-500/20 text-primary-300 flex items-center gap-1">
              Optimal: {(bet.optimalSize * 100).toFixed(2)}%
              <TooltipComponent {...tooltipContent.optimalSize} position="left" />
            </span>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-gray-400 text-xs">
              <Percent className="w-3 h-3" />
              <span>Win Probability</span>
              <TooltipComponent {...tooltipContent.probability} />
            </div>
            <p className="font-mono font-semibold text-white">
              {(bet.probability * 100).toFixed(1)}%
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-gray-400 text-xs">
              <DollarSign className="w-3 h-3" />
              <span>Payout</span>
              <TooltipComponent {...tooltipContent.payout} />
            </div>
            <p className="font-mono font-semibold text-white">
              {bet.payout.toFixed(2)}x
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-gray-400 text-xs">
              <Activity className="w-3 h-3" />
              <span>Implied Odds</span>
              <TooltipComponent {...tooltipContent.impliedOdds} />
            </div>
            <p className="font-mono font-semibold text-white">
              {(100.0 / bet.payout).toFixed(1)}%
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-gray-400 text-xs">
              <TrendingUp className="w-3 h-3" />
              <span>Edge</span>
              <TooltipComponent {...tooltipContent.edge} />
            </div>
            <p className={cn(
              "font-mono font-semibold",
              edge > 0 ? "text-green-400" : "text-red-400"
            )}>
              {edge > 0 ? '+' : ''}{edgePercentage}%
            </p>
          </div>
        </div>

        {/* Modern Slider */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-1">
              Bet Amount
              <TooltipComponent {...tooltipContent.betAmount} />
            </label>
            <span className="text-sm font-bold text-primary-400">{bet.betPercentage.toFixed(2)}%</span>
          </div>
          
          <div className="relative">
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={bet.betPercentage}
              onChange={(e) => onSliderChange(bet.id, parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
              style={{
                background: `linear-gradient(to right, #0066ff 0%, #0066ff ${bet.betPercentage}%, #374151 ${bet.betPercentage}%, #374151 100%)`
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
});

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, trend, color = "primary", tooltip }) => {
  const colorClasses = {
    primary: "from-primary-500/20 to-primary-600/20",
    success: "from-green-500/20 to-green-600/20",
    warning: "from-yellow-500/20 to-yellow-600/20"
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="relative overflow-hidden rounded-2xl glass-card glass-card-hover p-6"
    >
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-30",
        colorClasses[color]
      )} />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-300 flex items-center gap-1">
            {title}
            {tooltip && <TooltipComponent {...tooltip} />}
          </h3>
          <Icon className={cn(
            "w-5 h-5",
            color === "primary" ? "text-primary-400" : 
            color === "success" ? "text-green-400" : "text-yellow-400"
          )} />
        </div>
        
        <div className="flex items-end justify-between">
          <p className="text-2xl font-bold text-white">
            {typeof value === 'number' ? (
              <CountUp
                end={value}
                duration={0.5}
                prefix={title.includes('Bankroll') ? '$' : ''}
                decimals={title.includes('Bankroll') ? 2 : 0}
                separator=","
              />
            ) : value}
          </p>
          
          {trend !== undefined && (
            <div className="flex items-center gap-1">
              {trend > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
              <span className={cn(
                "text-sm font-semibold",
                trend > 0 ? "text-green-400" : "text-red-400"
              )}>
                {Math.abs(trend).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

function App() {
  const [bankroll, setBankroll] = useState(1000);
  const [opponentBankroll, setOpponentBankroll] = useState(1000);
  const [bankrollHistory, setBankrollHistory] = useState([{x: 0, y: 1000}]);
  const [optimalBankrollHistory, setOptimalBankrollHistory] = useState([{x: 0, y: 1000}]);
  const [previousBankroll, setPreviousBankroll] = useState(1000);
  const [previousOpponentBankroll, setPreviousOpponentBankroll] = useState(1000);

  const [growthUI, setGrowthUI] = useState(0);
  const [betCountUI, setBetCountUI] = useState(0);
  const [gameState, setGameState] = useState("showBet");

  const [minBets, setMinBets] = useState(1);
  const [maxBets, setMaxBets] = useState(2);

  const [minProbability, setMinProbability] = useState(5);
  const [maxProbability, setMaxProbability] = useState(95);
  const [isChartVisible, setIsChartVisible] = useState(false);

  const [isWasmReady, setWasmReady] = useState(false);
  const [bets, setBets] = useState([]);
  const [messageUI, setMessageUI] = useState("Good Luck!");
  
  // Add welcome modal state
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const bankrollTrend = ((bankroll - previousBankroll) / previousBankroll) * 100;
  const opponentTrend = ((opponentBankroll - previousOpponentBankroll) / previousOpponentBankroll) * 100;

  const handleSliderChange = useCallback((id, newPercentage) => {
    setBets(prevBets =>
      prevBets.map(bet =>
        bet.id === id ? { ...bet, betPercentage: newPercentage } : bet
      )
    );
  }, []);

  useEffect(() => {
    init()
      .then(() => {
        setWasmReady(true);
        generateBets();
      })
      .catch((err) => console.error("Error initializing Wasm module:", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Check if user has seen welcome modal
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome && isWasmReady) {
      setShowWelcomeModal(true);
    }
  }, [isWasmReady]);

  const multi_kelly = useCallback((input) => {
    const inputJson = JSON.stringify(input);
    const rustString = multiple_kelly(inputJson);
    let proportions = JSON.parse(rustString);
    let growth = proportions.pop();
    return {
        proportions: proportions,
        growth: growth
    }
  }, []);

  const resolveBets = useCallback(() => {
    setPreviousBankroll(bankroll);
    setPreviousOpponentBankroll(opponentBankroll);

    let total = 0.0;
    let opponentTotal = 0.0;

    const newBets = bets.map(bet => {
      const result = Math.random();
      const win = result < bet.probability;
      const state = win ? 'win' : 'lose';

      if (win) {
        total += (bet.betPercentage * (bet.payout - 1)) / 100.0;
        opponentTotal += bet.optimalSize * (bet.payout - 1);
      } else {
        total -= bet.betPercentage / 100.0;
        opponentTotal -= bet.optimalSize;
      }

      return { ...bet, result, state };
    });

    setBets(newBets);

    const userDelta = bankroll * total;
    const kellyDelta = opponentBankroll * opponentTotal;

    const newBankroll = bankroll + userDelta;
    const newOpponentBankroll = opponentBankroll + kellyDelta;

    setBankroll(newBankroll);
    setOpponentBankroll(newOpponentBankroll);

    setBankrollHistory(prev => [...prev, { x: prev.length, y: newBankroll }]);
    setOptimalBankrollHistory(prev => [...prev, { x: prev.length, y: newOpponentBankroll }]);

    // Celebrate big wins with confetti!
    const winPercentage = (userDelta / bankroll) * 100;
    if (winPercentage > 10) {
      // Big win - lots of confetti
      confetti({
        particleCount: 200,
        spread: 70,
        origin: { y: 0.6 }
      });
    } else if (winPercentage > 5) {
      // Medium win - some confetti
      confetti({
        particleCount: 100,
        spread: 50,
        origin: { y: 0.6 }
      });
    }
  }, [bets, bankroll, opponentBankroll]);

  const handleBet = useCallback(() => {
    if (gameState === "showBet") {
      let totalBetPercentage = bets.reduce((total, bet) => {
        return total + bet.betPercentage;
      }, 0);
      if (totalBetPercentage <= 100) {
        resolveBets();
        setGameState("showNextBet");
        setMessageUI("Results are in!");
      } else {
        setMessageUI("⚠️ Total bets exceed 100% of bankroll!");
      }
    } else {
      generateBets();
      setGameState("showBet");
      setMessageUI("Good luck!");
      setBetCountUI(betCountUI + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, bets, resolveBets, betCountUI]);

  const generateBets = useCallback(() => {
    let min = minBets;
    let max = maxBets;
    let N = Math.floor(Math.random() * (max - min + 1)) + min;
    let result = [];
    let forKelly = [];
    for (let i = 0; i < N; i++) {
      let bet = generateOneBet(minProbability, maxProbability);
      bet.id = i;
      result.push(bet);
      forKelly.push(bet.probability);
      forKelly.push(bet.payout - 1);
    }
    // calculate optimal
    let k = multi_kelly(forKelly);
    for (let i = 0; i < N; i++) {
      result[i].optimalSize = k.proportions[i];
    }
    result.sort((a, b) => b.probability - a.probability);
    setGrowthUI(k.growth);

    setBets(result);
  }, [minBets, maxBets, minProbability, maxProbability, multi_kelly]);

  const handleAddBet = useCallback(() => {
    let forKelly = [];
    let result = [];
    for (let i = 0; i < bets.length; i++) {
      result.push(bets[i]);
      forKelly.push(bets[i].probability);
      forKelly.push(bets[i].payout - 1);
    }
    let bet = generateOneBet(minProbability, maxProbability);
    bet.id = result.length;
    result.push(bet);
    forKelly.push(bet.probability);
    forKelly.push(bet.payout - 1);
    let k = multi_kelly(forKelly);
    for (let i = 0; i < result.length; i++) {
      result[i].optimalSize = k.proportions[i];
    }
    setGrowthUI(k.growth);
    setBets(result);
  }, [bets, minProbability, maxProbability, multi_kelly]);

  // Show loading state while WASM initializes
  if (!isWasmReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background-primary via-purple-900/20 to-background-primary flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="w-20 h-20 mx-auto mb-6 relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-4 border-primary-500/20 border-t-primary-500"
              />
              <BarChart3 className="w-10 h-10 text-primary-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Betting Simulator</h2>
          <p className="text-gray-400">Initializing WASM module...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-primary via-purple-900/20 to-background-primary">
      {/* Animated background patterns */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="backdrop-blur-xl bg-background-secondary/50 border-b border-white/10"
        >
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary-500/20">
                  <BarChart3 className="w-6 h-6 text-primary-400" />
                </div>
                <h1 className="text-2xl font-bold text-white">Betting Simulator</h1>
              </div>
              
              <div className="flex items-center gap-3">
                <HowItWorksButton onClick={() => setShowWelcomeModal(true)} />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsChartVisible(!isChartVisible)}
                  className="btn-secondary flex items-center gap-2 relative"
                >
                  <Activity className="w-4 h-4" />
                  {isChartVisible ? 'Hide' : 'Show'} Chart
                  <TooltipComponent {...tooltipContent.showChart} position="bottom" />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Container */}
        <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Your Bankroll"
              value={bankroll}
              icon={DollarSign}
              trend={bankrollTrend}
              color="primary"
              tooltip={tooltipContent.bankroll}
            />
            <StatCard
              title="Optimal Bankroll"
              value={opponentBankroll}
              icon={Award}
              trend={opponentTrend}
              color="success"
              tooltip={tooltipContent.optimalBankroll}
            />
            <StatCard
              title="Total Bets"
              value={betCountUI}
              icon={Activity}
              color="warning"
              tooltip={tooltipContent.totalBets}
            />
          </div>

          {/* Chart Section */}
          <AnimatePresence>
            {isChartVisible && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="glass-card p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary-400" />
                  Bankroll History
                  <TooltipComponent 
                    title="Performance Over Time"
                    content="Your bankroll (blue) vs the optimal Kelly strategy (green). The goal is to match or beat the green line!"
                    example="If your line is above the green line, you're outperforming the optimal strategy!"
                    position="right"
                  />
                </h3>
                <div className="mb-4 flex items-center gap-2">
                  <h4 className="text-md font-semibold text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary-400" />
                    Your Performance
                    <TooltipComponent 
                      title="Your Betting Strategy"
                      content="This shows how your bankroll has grown (or shrunk) based on your betting decisions."
                      example="The blue line tracks your actual performance - try to keep it growing steadily!"
                      position="right"
                    />
                  </h4>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={bankrollHistory}>
                    <defs>
                      <linearGradient id="colorUser" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0066ff" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#0066ff" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorOptimal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="x" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="y"
                      stroke="#0066ff"
                      fillOpacity={1}
                      fill="url(#colorUser)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
                
                <div className="mt-6 mb-4 flex items-center gap-2">
                  <h4 className="text-md font-semibold text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-green-400" />
                    Optimal Strategy Performance
                    <TooltipComponent 
                      title="Kelly Criterion Benchmark"
                      content="This shows how your bankroll would grow if you always bet the mathematically optimal amount using the Kelly Criterion formula."
                      example="The green line represents 'perfect play' - your goal is to match or beat this performance!"
                      position="right"
                    />
                  </h4>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={optimalBankrollHistory}>
                    <defs>
                      <linearGradient id="colorOptimal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="x" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="y"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#colorOptimal)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBet}
              className="btn-primary flex items-center gap-2 text-lg px-8 py-4 relative group"
            >
              {gameState === "showBet" ? (
                <>
                  <Sparkles className="w-5 h-5" />
                  Place Bets
                  <TooltipComponent {...tooltipContent.placeBets} position="bottom" />
                </>
              ) : (
                <>
                  <ChevronRight className="w-5 h-5" />
                  Next Round
                  <TooltipComponent {...tooltipContent.nextRound} position="bottom" />
                </>
              )}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddBet}
              className="btn-secondary flex items-center gap-2 relative"
            >
              <Plus className="w-5 h-5" />
              Add Bet
              <TooltipComponent {...tooltipContent.addBet} position="bottom" />
            </motion.button>
          </div>

          {/* Message */}
          <motion.div
            key={messageUI}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p className="text-lg font-medium text-gray-300">{messageUI}</p>
            {growthUI > 0 && (
              <p className="text-sm text-gray-400 mt-1 flex items-center justify-center gap-1">
                Expected Growth: 
                <span className="text-primary-400 font-semibold">{growthUI.toFixed(3)}</span>
                <TooltipComponent {...tooltipContent.expectedGrowth} />
              </p>
            )}
          </motion.div>

          {/* Bets Grid */}
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <AnimatePresence>
              {bets.map((bet, index) => (
                <BetCard
                  key={bet.id}
                  bet={bet}
                  index={index}
                  onSliderChange={handleSliderChange}
                />
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Settings Section */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-1">
                  Min Bets
                  <TooltipComponent {...tooltipContent.minBets} />
                </label>
                <input
                  type="number"
                  value={minBets}
                  onChange={(e) => setMinBets(Math.max(1, Math.min(parseInt(e.target.value) || 1, maxBets)))}
                  className="w-full px-4 py-2 bg-background-tertiary border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-1">
                  Max Bets
                  <TooltipComponent {...tooltipContent.maxBets} />
                </label>
                <input
                  type="number"
                  value={maxBets}
                  onChange={(e) => setMaxBets(Math.max(minBets, Math.min(parseInt(e.target.value) || 15, 15)))}
                  className="w-full px-4 py-2 bg-background-tertiary border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-1">
                  Min Probability %
                  <TooltipComponent {...tooltipContent.minProbability} />
                </label>
                <input
                  type="number"
                  value={minProbability}
                  onChange={(e) => setMinProbability(Math.max(1, Math.min(parseInt(e.target.value) || 1, maxProbability)))}
                  className="w-full px-4 py-2 bg-background-tertiary border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-1">
                  Max Probability %
                  <TooltipComponent {...tooltipContent.maxProbability} />
                </label>
                <input
                  type="number"
                  value={maxProbability}
                  onChange={(e) => setMaxProbability(Math.max(minProbability, Math.min(parseInt(e.target.value) || 100, 100)))}
                  className="w-full px-4 py-2 bg-background-tertiary border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Custom styles for range input */}
      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: #0066ff;
          cursor: pointer;
          border-radius: 50%;
          border: 2px solid #fff;
          box-shadow: 0 0 0 1px rgba(0, 102, 255, 0.5);
          transition: all 0.2s;
        }
        
        .slider-thumb::-webkit-slider-thumb:hover {
          box-shadow: 0 0 0 8px rgba(0, 102, 255, 0.1);
        }
        
        .slider-thumb::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #0066ff;
          cursor: pointer;
          border-radius: 50%;
          border: 2px solid #fff;
          box-shadow: 0 0 0 1px rgba(0, 102, 255, 0.5);
          transition: all 0.2s;
        }
        
        .slider-thumb::-moz-range-thumb:hover {
          box-shadow: 0 0 0 8px rgba(0, 102, 255, 0.1);
        }
      `}</style>
      
      {/* Welcome Modal */}
      <WelcomeModal 
        isOpen={showWelcomeModal} 
        onClose={() => setShowWelcomeModal(false)} 
      />
    </div>
  );
}

export default App;

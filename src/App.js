import React, { useState, useEffect } from 'react';
import './App.css';

function kelly(b, p) {
  const q = 1 - p;
  return (b * p - q) / b;
}

function growthRate(b, p) {
  const q = 1 - p;
  const f = kelly(b, p);
  try {
    return p * Math.log(1 + f * b) + q * Math.log(1 - f);
  } catch (error) {
    return Infinity;
  }
}

function binarySearchForB(p, G) {
  let g = Infinity;
  let mid = 0;
  let lowerBound = 1e-6;
  let upperBound = 1e6;
  let i=0;
  let diff = -1;
  while (Math.abs(g - G) > 1e-6) {
    i += 1;
    if (i > 100) break;
    diff = Math.abs(g - G);
    console.log(`Mid: ${mid}, Growth Rate: ${g}, Lower Bound: ${lowerBound}, Upper Bound: ${upperBound},  Diff: ${diff}`);
    mid = (lowerBound + upperBound) / 2;
    g = growthRate(mid, p);
    if (g < G) {
      lowerBound = mid;
    } else {
      upperBound = mid;
    }
  }
  return mid;
}

function calculateOptimalBankroll(initialBankroll, growthRate, numberOfBets) {
  // Convert the logarithmic growth rate to an effective growth rate for approximation
  // This is a direct use for simulation purposes and may not reflect exact outcomes.
  const effectiveGrowthRate = Math.exp(growthRate) - 1;
  return initialBankroll * Math.pow(1 + effectiveGrowthRate, numberOfBets);
}

function App() {
  const [bankroll, setBankroll] = useState(1000);
  const [probability, setProbability] = useState(0.5);
  const [payout, setPayout] = useState(2);
  const [userBet, setUserBet] = useState(0);
  const [betCount, setBetCount] = useState(0);
  const [message, setMessage] = useState('');
  const [kellyBet, setKellyBet] = useState(0); // Add state for Kelly bet
  const [roundFinished, setRoundFinished] = useState(false); // Add state to track if the round is finished
  const [growthRate, setGrowthRate] = useState(Math.random() * 0.05 + 0.05);

  useEffect(() => {
    generateRandomBetConditions();
  }, []);

  const generateRandomBetConditions = () => {
    const newProbability = Math.random() * 0.9 + 0.05; // Random probability between 5% and 95%
    const b = binarySearchForB(newProbability, growthRate); // Calculate payout targeting the growth rate
    setProbability(newProbability);
    setPayout(b + 1); // Adjust payout to match the betting interface expectations
    const kellyFraction = kelly(b, newProbability);
    setKellyBet(kellyFraction * bankroll); // Calculate and set the Kelly bet
    setRoundFinished(false); // Reset for the new round
  };

  const handleBet = () => {
    if (!roundFinished) {
        const win = Math.random() < probability;
        let newBankroll = bankroll - userBet + (win ? userBet * payout : 0);
        setBankroll(newBankroll);
        setBetCount(betCount + 1);
        setMessage(`You ${win ? "won" : "lost"}! New bankroll: $${newBankroll.toFixed(2)}. Correct Kelly Bet was: $${kellyBet.toFixed(2)}`);
        setRoundFinished(true); // Mark the current round as finished
    } else {
      startNewRound(); // If the round is finished, start a new round
    }

  };

  const startNewRound = () => {
    setUserBet(0);
    setMessage('Good Luck');
    generateRandomBetConditions(); // Start a new round with fresh conditions
  };

  const optimalBankroll = calculateOptimalBankroll(1000.0, growthRate, betCount);


  return (
    <div className="App">
      <header className="App-header">
        <h1>Betting Simulator</h1>
        <p>Your bankroll: ${bankroll.toFixed(2)}</p>
        <p>Optimal Bankroll after {betCount} bets: ${optimalBankroll.toFixed(2)}</p>
        <div>
          <p>Probability of winning: {(probability * 100).toFixed(2)}%</p>
        </div>
        <div>
          <p>Payout on win: {payout.toFixed(2)}x the bet (including your bet)</p>
        </div>
        <div>
          <label>Your bet: ${userBet.toFixed(2)} ({((userBet / bankroll) * 100).toFixed(2)}% of bankroll)</label>
          <input
            type="range"
            min="0"
            max={bankroll}
            value={userBet}
            onChange={(e) => setUserBet(parseFloat(e.target.value))}
            style={{ width: "80%" }} // Make the slider wider
          />
        </div>
        <button className="betButton" onClick={handleBet}>{roundFinished ? "Next Bet" : "Bet"}</button>
        <p>{message}</p>
      </header>
    </div>
  );
}

export default App;

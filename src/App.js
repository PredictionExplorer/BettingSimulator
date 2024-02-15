import React, { useState, useEffect, useRef } from 'react';
import init, { multiple_kelly } from './pkg/kelly_sim';
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

function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function binarySearchForB(p, G) {
  let g = Infinity;
  let mid = 0;
  let lowerBound = 1e-6;
  let upperBound = 1e6;
  let i=0;
  while (Math.abs(g - G) > 1e-6) {
    i += 1;
    if (i > 100) break;
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


function BetComponent({ bet, onSliderChange }) {
  console.log(bet.state);
  const className = `bet-component ${
    bet.state === 'win'
      ? 'win-background'
      : bet.state === 'lose'
      ? 'lose-background'
      : 'neutral-background'
  }`;
  return (
    <div className={className}>
      <h2>Bet Details</h2>
      <p>Probability of Winning: {(bet.probability * 100).toFixed(2)}%</p>
      <p>Implied odds: {(100.0 / bet.payout).toFixed(2)}% </p>
      <p>Payout: {bet.payout.toFixed(2)}x </p>
      <p>Optimal: {(bet.optimalSize * 100).toFixed(2)}%</p>

      <label>
        Bet Percentage of Bankroll:
        <input
          type="range"
          min="0"
          max="100"
          value={bet.betPercentage}
          onChange={(e) => onSliderChange(bet.id, parseInt(e.target.value, 10))}
        />
        {bet.betPercentage.toFixed(2)}%
      </label>
    </div>
  );
}

function App() {
  const bankroll = useRef(1000);
  const opponentBankroll = useRef(1000);

  const betCount = useRef(0);

  const [betCountUI, setBetCountUI] = useState(0);
  const [payoutUI, setPayoutUI] = useState(0);
  const [bankrollUI, setBankrollUI] = useState(1000);
  const [optimalBankrollUI, setOptimalBankrollUI] = useState(1000);
  const [messageUI, setMessageUI] = useState(1000);
  const [probabilityUI, setProbabilityUI] = useState(0.5);
  const [betResultUI, setBetResultUI] = useState("neutral");
  const [userBetUI, setUserBetUI] = useState(0);

  const [isWasmReady, setWasmReady] = useState(false);

  const [bets, setBets] = useState([]);

  const handleSliderChange = (id, newPercentage) => {
    setBets(bets.map(bet =>
      bet.id === id ? { ...bet, betPercentage: newPercentage / 100.0 } : bet
    ));
    console.log(bets);
  };

    /*
  useEffect(() => {
    startNewRound();
  }, []);
  */

  useEffect(() => {
    init().then(() => {
      setWasmReady(true);
    }).catch(err => console.error("Error initializing Wasm module:", err));
  }, []);

  const multi_kelly = (input) => {
    const inputJson = JSON.stringify(input);

    const rustString = multiple_kelly(inputJson);
    let proportions = JSON.parse(rustString);
    let growth = proportions.pop();
    return {
        proportions: proportions,
        growth: growth
    }
  };

  const resolveBets = () => {
      let total = 0.0
      let opponentTotal = 0.0
      for (let i = 0; i < bets.length; i++) {
          let result = Math.random();
          bets[i].result = result;
          if (result < bets[i].probability) {
              bets[i].state = 'win';
              total += bets[i].betPercentage * (bets[i].payout - 1);
              opponentTotal += bets[i].optimalSize * (bets[i].payout - 1);
          } else {
              bets[i].state = 'lose';
              total -= bets[i].betPercentage;
              opponentTotal -= bets[i].optimalSize;
          }
          console.log('total, opptotal', total, opponentTotal);
      }
      bankroll.current *= 1 + total;
      opponentBankroll.current *= 1 + opponentTotal;
  }

  const handleBet = () => {
      resolveBets();
      setBankrollUI(bankroll.current);
      setOptimalBankrollUI(opponentBankroll.current);
      /*
    const input = [0.8, 1.9, 0.2, 10.0];
    let m = multi_kelly(input);
    generateBets();

    if (betResultUI === "neutral") {
        let betResult;
        let bankrollTmp = bankroll.current;
        let kellyBet = kelly(payout.current, probability.current);
        if (Math.random() < probability.current) {
          betResult = 'win';
          bankroll.current += userBetUI * payout.current;
          console.log("kellyBet", kellyBet, "optimalBank", optimalBankroll.current, 'payout', payout.current);
          optimalBankroll.current += kellyBet * optimalBankroll.current * payout.current;
        } else {
          betResult = 'lose';
          bankroll.current -= userBetUI;
          console.log("kellyBet", kellyBet, "optimalBank", optimalBankroll.current);
          optimalBankroll.current -= kellyBet * optimalBankroll.current;
        }
        betCount.current += 1;
        setBetResultUI(betResult);
        setMessageUI(`You ${betResult === "win" ? "won" : "lost"}! New bankroll: $${bankroll.current.toFixed(2)}. Correct Kelly Bet was: $${(kellyBet * bankrollTmp).toFixed(2)} (${(kellyBet * 100).toFixed(2)}%)`);
    } else {
      startNewRound();
    }
    setMessageUI(m.growth);
    */
  };

  const generateOneBet = () => {
      //let p = getRandomFloat(0.05, 0.95);
      let p = getRandomFloat(0.05, 0.3);
      let implied = 1 / p;
      let b = getRandomFloat(implied, implied + (implied - 1) * 2);
      return {probability: p, payout: b, betPercentage: 0.0, id: null, optimalSize: null, state: "neutral", result: null}
  }

  const generateBets = () => {
      let N = 3;
      let result = [];
      let forKelly = [];
      for (let i = 0; i < N; i++) {
          let bet = generateOneBet();
          bet.id = i;
          result.push(bet)
          forKelly.push(bet.probability);
          forKelly.push(bet.payout - 1);
      }
      // calculate optimal
      let k = multi_kelly(forKelly);
      for (let i = 0; i < N; i++) {
          result[i].optimalSize = k.proportions[i];
      }
      console.log(k.growth);
      setBets(result);
  }

    /*
  const startNewRound = () => {
    probability.current = Math.random() * 0.9 + 0.05;
    let G = Math.random() * 0.02 + 0.0001;
    while(true) {
        payout.current = binarySearchForB(probability.current, G);
        if (payout.current > 0) break
    }
    console.log('G', G, 'payout', payout.current);
    setUserBetUI(0);
    setBankrollUI(bankroll.current);
    setOptimalBankrollUI(optimalBankroll.current);
    setProbabilityUI(probability.current);
    setPayoutUI(payout.current + 1);
    setBetResultUI('neutral');
    setMessageUI('Good Luck');
    setBetCountUI(betCount.current);
  };
  */

  const resultClass = betResultUI === 'win' ? 'backgroundWin' : betResultUI === 'lose' ? 'backgroundLose' : 'backgroundNeutral';

  const handleBetOutcome = (win, amount) => {
    console.log(`Bet Outcome: ${win ? 'Won' : 'Lost'}, Amount: ${amount}`);
    // Update bankroll or perform other actions based on the bet outcome
  };

  return (
    <div className={`BettingApp neutral-background`}>
      <header className="App-header">
        <h1>Betting Simulator</h1>
      <div>
      {bets.map(bet => (
        <BetComponent
          key={bet.id}
          bet={bet}
          onSliderChange={handleSliderChange}
        />
      ))}
      <button onClick={() => generateBets()}>Add Bet</button>
      {/* Implement UI for updating and deleting bets */}
    </div>


        <p>Your bankroll: ${bankrollUI.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        <p>Optimal bankroll: ${optimalBankrollUI.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        <p>Number of bets: {betCountUI}</p>
        <div>
          <p>Probability of winning: {(probabilityUI * 100).toFixed(2)}%</p>
        </div>
        <div>
          <p>Payout on win: {payoutUI.toFixed(2)}x the bet (${(payoutUI * userBetUI).toFixed(2)}) (including your bet) ({(100.0 / payoutUI).toFixed(2)}% implied odds)</p>
        </div>
        <div>
          <label>Your bet: ${userBetUI.toFixed(2)} ({((userBetUI / bankrollUI) * 100).toFixed(2)}% of bankroll)</label>
        </div>
        <button className="betButton" onClick={handleBet}>{betResultUI !== "neutral" ? "Next Bet" : "Bet"}</button>
        <p>{messageUI}</p>
      </header>
    </div>
  );
}

export default App;

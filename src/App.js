import React, { useState, useEffect, useRef } from 'react';
import init, { multiple_kelly } from './pkg/kelly_sim';
import './App.css';
import Box from '@mui/material/Box'; // Import Box from MUI

import Container from '@mui/material/Container';


import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#424242', // Lighter dark shade
    },
    primary: {
      main: '#bb86fc', // Customizable
    },
    secondary: {
      main: '#03dac6', // Customizable
    },
    // Adjust text colors if needed to improve readability
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  // You can also customize other theme aspects here
});

const PrettoSlider = styled(Slider)({
  color: '#52af77',
  height: 8,
  '& .MuiSlider-thumb': {
    height: 24,
    width: 24,
    backgroundColor: '#fff',
    border: '2px solid currentColor',
    '&:focus, &:hover, &.Mui-active': {
      boxShadow: 'inherit',
    },
  },
  '& .MuiSlider-valueLabel': {
    lineHeight: 1.2,
    fontSize: 12,
    background: 'unset',
    padding: 0,
    width: 32,
    height: 32,
    borderRadius: '50% 50% 50% 0',
    backgroundColor: '#52af77',
    transformOrigin: 'bottom left',
    transform: 'translate(50%, -100%) rotate(-45deg) scale(0)',
    '&:before': { display: 'none' },
    '&.MuiSlider-valueLabelOpen': {
      transform: 'translate(50%, -100%) rotate(-45deg) scale(1)',
    },
    '& > *': {
      transform: 'rotate(45deg)',
    },
  },
});




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
    <Box
      sx={{
        backgroundColor: bet.state === 'win' ? 'green' : (bet.state === 'lose' ? 'red' : 'gray'),
        color: 'white', // Example of additional styling
        padding: 2, // Theme-aware spacing
        borderRadius: 1, // Theme-aware border radius
      }}
    >
      <p>Probability of Winning: {(bet.probability * 100).toFixed(2)}%</p>
      <p>Implied odds: {(100.0 / bet.payout).toFixed(2)}% </p>
      <p>Payout: {bet.payout.toFixed(2)}x </p>
      <p>Optimal: {bet.state !== 'neutral' ? `${(bet.optimalSize * 100).toFixed(2)}%` : '?'}</p>

      <label>
        Bet Percentage of Bankroll:
        <input
          type="range"
          min="0"
          max="100"
          step="0.01"
          value={bet.betPercentage}
          onChange={(e) => onSliderChange(bet.id, parseFloat(e.target.value, 10))}
        />
        {bet.betPercentage.toFixed(2)}%
      </label>
    </Box>
  );
}

function App() {
  const bankroll = useRef(1000);
  const opponentBankroll = useRef(1000);

  const betCount = useRef(0);

  const [growthUI, setGrowthUI] = useState(0);
  const [betCountUI, setBetCountUI] = useState(0);
  const [payoutUI, setPayoutUI] = useState(0);
  const [bankrollUI, setBankrollUI] = useState(1000);
  const [optimalBankrollUI, setOptimalBankrollUI] = useState(1000);
  const [messageUI, setMessageUI] = useState("Good Luck!");
  const [probabilityUI, setProbabilityUI] = useState(0.5);
  const [gameState, setGameState] = useState("showBet");
  const [userBetUI, setUserBetUI] = useState(0);

  const [isWasmReady, setWasmReady] = useState(false);

  const [bets, setBets] = useState([]);

  const handleSliderChange = (id, newPercentage) => {
    setBets(bets.map(bet =>
      bet.id === id ? { ...bet, betPercentage: newPercentage } : bet
    ));
    console.log(bets);
  };

  useEffect(() => {
    init().then(() => {
      setWasmReady(true);
      generateBets();
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
              total += bets[i].betPercentage * (bets[i].payout - 1) / 100.0; // divide by 100 to be compatible with slider
              opponentTotal += bets[i].optimalSize * (bets[i].payout - 1);
          } else {
              bets[i].state = 'lose';
              total -= bets[i].betPercentage / 100.0; //divide by 100 to be compatible with slider
              opponentTotal -= bets[i].optimalSize;
          }
          console.log('total, opptotal', total, opponentTotal);
      }
      let msg = `Your Bankroll: ${(bankroll.current * total >= 0 ? "+" : "")}${(bankroll.current * total).toFixed(2)} `;
      msg += `Kelly Bankroll: ${(opponentBankroll.current * opponentTotal >= 0 ? "+" : "")}${(opponentBankroll.current * opponentTotal).toFixed(2)}`;
      setMessageUI(msg);
      bankroll.current *= 1 + total;
      opponentBankroll.current *= 1 + opponentTotal;
  }

  const handleBet = () => {
      if (gameState === "showBet") {
          let totalBetPercentage = bets.reduce((total, bet) => {
              return total + bet.betPercentage;
            }, 0);
          if (totalBetPercentage < 100) {
              resolveBets();
              setGameState("showNextBet");
          } else {
              setMessageUI("You bet more than your bankroll! Reduce your bets.");
          }
      } else {
          generateBets();
          setBankrollUI(bankroll.current);
          setOptimalBankrollUI(opponentBankroll.current);
          setGameState("showBet");
          setMessageUI("Good luck!");
          setBetCountUI(betCountUI + 1);
      }
  };

  const generateOneBet = () => {
      //let p = getRandomFloat(0.05, 0.95);
      let p = Math.min(getRandomFloat(0.05, 0.95), getRandomFloat(0.05, 0.95));
      let implied = 1 / p;
      let b = getRandomFloat(implied, implied + (implied - 1) * 2);
      return {probability: p, payout: b, betPercentage: 0.0, id: null, optimalSize: null, state: "neutral", result: null}
  }

  const generateBets = () => {
      let min = 1;
      let max = 5;
      let N = Math.floor(Math.random() * (max - min + 1)) + min;
      console.log(N);
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
      setGrowthUI(k.growth);
      setBets(result);
  }

  const handleBetOutcome = (win, amount) => {
    console.log(`Bet Outcome: ${win ? 'Won' : 'Lost'}, Amount: ${amount}`);
    // Update bankroll or perform other actions based on the bet outcome
  };

  return (
    <ThemeProvider theme={theme}>
    <CssBaseline />
    <Container maxWidth="lg" style={{ marginTop: '20px' }}>
      {/* Bankroll Information in Cards */}
      <Grid container spacing={2} justifyContent="center" style={{ marginBottom: '20px' }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2">
                Your Bankroll
              </Typography>
              <Typography variant="body1">
                ${bankrollUI.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2">
                Optimal Bankroll
              </Typography>
              <Typography variant="body1">
                ${optimalBankrollUI.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2">
                Number of Bets
              </Typography>
              <Typography variant="body1">
                {betCountUI}
              </Typography>
              <Button variant="contained" color="primary" onClick={handleBet} style={{ marginTop: '10px' }}>
                {gameState === "showBet" ? "Bet" : "Next Bet"}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h4" component="h1" gutterBottom style={{ textAlign: 'center', marginBottom: '20px' }}>
        Betting Simulator
      </Typography>

      {/* Grid container for bets */}
      <Grid container spacing={2}>
        {bets.map(bet => (
          <Grid item xs={12} sm={6} md={4} key={bet.id}>
            <BetComponent
              bet={bet}
              onSliderChange={handleSliderChange}
            />
          </Grid>
        ))}
      </Grid>
      <p>Expected Growth: {growthUI.toFixed(3)}</p>
      <p>{messageUI}</p>
    </Container>
    </ThemeProvider>
  );

}

export default App;

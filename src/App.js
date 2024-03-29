import React, { useState, useEffect, useRef } from 'react';
import init, { multiple_kelly } from './pkg/kelly_sim';
import './App.css';
import Box from '@mui/material/Box'; // Import Box from MUI

import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';


import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';

import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel'; // For labeling the switch

import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

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
    color: 'white',
    padding: 2,
    borderRadius: 1,
    display: 'flex',
    flexDirection: 'column',
  }}
>
  {/* Adjust the marginBottom on each paragraph to reduce spacing */}
  <p sx={{ marginBottom: '8px' }}>Probability of Winning: {(bet.probability * 100).toFixed(2)}%</p>
  <p sx={{ marginBottom: '8px' }}>Implied odds: {(100.0 / bet.payout).toFixed(2)}% </p>
  <p sx={{ marginBottom: '8px' }}>Edge (probability - implied): {(100 * (bet.probability - (1.0 / bet.payout))).toFixed(2)}% </p>
  <p sx={{ marginBottom: '8px' }}>Payout: {bet.payout.toFixed(2)}x </p>
  <p sx={{ marginBottom: '8px' }}>Optimal: {bet.state !== 'neutral' ? `${(bet.optimalSize * 100).toFixed(2)}%` : '?'}</p>

  {/* For the slider and its label, you might want to keep or adjust the spacing as needed */}
  <Box sx={{ width: '100%', mt: 2 }}>
    <label style={{ width: '100%', display: 'block', marginBottom: '8px' }}> {/* Adjusted marginBottom here */}
      Bet Percentage of Bankroll:
    </label>
    <input
      type="range"
      min="0"
      max="100"
      step="0.01"
      value={bet.betPercentage}
      onChange={(e) => onSliderChange(bet.id, parseFloat(e.target.value))}
      style={{ width: '100%', display: 'block' }}
    />
    <Box sx={{ textAlign: 'center', mt: 1 }}>{bet.betPercentage.toFixed(2)}%</Box>
  </Box>
</Box>

  );
}

const BankrollChart = ({ bankrollHistory, optimalBankrollHistory }) => {
  const data = {
    datasets: [
      {
        label: 'Bankroll',
        data: bankrollHistory,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: 'Optimal Bankroll',
        data: optimalBankrollHistory,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.4,
      }
    ],
  };

  const options = {
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        title: {
          display: true,
          text: 'Bet Number'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Bankroll'
        }
      }
    },
    elements: {
      line: {
        tension: 0.4 // This is to make the line a bit smoother
      }
    },
    responsive: true,
  };

  return <Line data={data} options={options} />;
};

function App() {
  const bankroll = useRef(1000);
  const opponentBankroll = useRef(1000);
  const [bankrollHistory, setBankrollHistory] = useState([{x: 0, y: 1000}]);
  const [optimalBankrollHistory, setOptimalBankrollHistory] = useState([{x: 0, y: 1000}]);


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

  const [minBets, setMinBets] = useState(1);
  const [maxBets, setMaxBets] = useState(2);

  const [minProbability, setMinProbability] = useState(5);
  const [maxProbability, setMaxProbability] = useState(95);
  const [isChartVisible, setIsChartVisible] = useState(false);

  const [isWasmReady, setWasmReady] = useState(false);

  const [bets, setBets] = useState([]);

  const handleSliderChange = (id, newPercentage) => {
    setBets(bets.map(bet =>
      bet.id === id ? { ...bet, betPercentage: newPercentage } : bet
    ));
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
      }
      let msg = `Your Bankroll: ${(bankroll.current * total >= 0 ? "+" : "")}${(bankroll.current * total).toFixed(2)} `;
      msg += `Kelly Bankroll: ${(opponentBankroll.current * opponentTotal >= 0 ? "+" : "")}${(opponentBankroll.current * opponentTotal).toFixed(2)}`;
      setMessageUI(msg);
      bankroll.current *= 1 + total;
      opponentBankroll.current *= 1 + opponentTotal;
      setBankrollHistory(prevHistory => [...prevHistory, {x: prevHistory.length, y: bankroll.current}]);
      setOptimalBankrollHistory(prevHistory => [...prevHistory, {x: prevHistory.length, y: opponentBankroll.current}]);
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
      let p = getRandomFloat(minProbability / 100.0, maxProbability / 100.0);
      let implied = 1 / p;
      let b = getRandomFloat(implied, implied + (implied - 1) * 2);
      return {probability: p, payout: b, betPercentage: 0.0, id: null, optimalSize: null, state: "neutral", result: null}
  }

  const generateBets = () => {
      let min = minBets;
      let max = maxBets;
      let N = Math.floor(Math.random() * (max - min + 1)) + min;
      let result = [];
      let forKelly = [];
      for (let i = 0; i < N; i++) {
          let bet = generateOneBet();
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
  }

  const handleAddBet = () => {
      let forKelly = [];
      let result = [];
      for (let i = 0; i < bets.length; i++) {
          result.push(bets[i]);
          forKelly.push(bets[i].probability);
          forKelly.push(bets[i].payout - 1);
      }
      let bet = generateOneBet();
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
  };

  const handleMinBetsChange = () => {
    if (minBets < 1) {
        setMinBets(1);
    } else if (minBets > maxBets) {
        setMinBets(maxBets);
    }
  };

  const handleMaxBetsChange = () => {
    if (maxBets > 15) {
        setMaxBets(15);
    } else if (maxBets < minBets) {
        setMaxBets(minBets);
    }
  };

  const handleMinProbabilityChange = () => {
    if (minProbability < 1) {
        setMinProbability(1);
    } else if (minProbability > maxProbability) {
        setMinProbability(maxProbability);
    }
  };

  const handleMaxProbabilityChange = () => {
    if (maxProbability > 100) {
        setMaxProbability(100);
    } else if (maxProbability < minProbability) {
        setMaxProbability(minProbability);
    }
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
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h4" component="h1" gutterBottom style={{ textAlign: 'center', marginBottom: '20px' }}>
        Betting Simulator
      </Typography>

      {isChartVisible && (
          <BankrollChart bankrollHistory={bankrollHistory} optimalBankrollHistory={optimalBankrollHistory} />
      )}

      <Grid container spacing={2} justify="center" style={{ marginBottom: '20px' }}>
      <Grid item>
        <Button variant="contained" color="primary" onClick={handleBet} style={{ margin: '10px' }}>
          {gameState === "showBet" ? "Bet" : "Next Bet"}
        </Button>
      </Grid>
      <Grid item>
        <Button variant="contained" color="primary" onClick={handleAddBet} style={{ margin: '10px' }}>
          Add Bet (experimental)
        </Button>
      </Grid>

      <Grid item>
      <FormControlLabel
          control={
            <Switch
              checked={isChartVisible}
              onChange={() => setIsChartVisible(!isChartVisible)}
              name="chartVisibilityToggle"
              color="primary"
            />
          }
          label={isChartVisible ? "Hide Chart" : "Show Chart"}
        />
      </Grid>

    </Grid>


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
      <Grid container spacing={2} justifyContent="center" style={{ marginTop: '20px' }}>
      <Grid item xs={12} sm={6} md={3}>
        <TextField
          label="Minimum Number of Bets"
          type="number"
          value={minBets}
          onChange={(e) => setMinBets(Number(e.target.value))}
          onBlur={handleMinBetsChange}
          variant="outlined"
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <TextField
          label="Maximum Number of Bets"
          type="number"
          value={maxBets}
          onChange={(e) => setMaxBets(Number(e.target.value))}
          onBlur={handleMaxBetsChange}
          variant="outlined"
          fullWidth
        />
      </Grid>
    </Grid>
      <Grid container spacing={2} justifyContent="center" style={{ marginTop: '20px' }}>
      <Grid item xs={12} sm={6} md={3}>
        <TextField
          label="Minimum Probability"
          type="number"
          value={minProbability}
          onChange={(e) => setMinProbability(Number(e.target.value))}
          onBlur={handleMinProbabilityChange} // Validate on blur
          variant="outlined"
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <TextField
          label="Maximum Probability"
          type="number"
          value={maxProbability}
          onChange={(e) => setMaxProbability(Number(e.target.value))}
          onBlur={handleMaxProbabilityChange} // Validate on blur
          variant="outlined"
          fullWidth
        />
      </Grid>
    </Grid>
      <p>Expected Growth: {growthUI.toFixed(3)}</p>
      <p>{messageUI}</p>
    </Container>
    </ThemeProvider>
  );

}

export default App;

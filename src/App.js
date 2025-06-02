import React, { useState, useEffect, useCallback } from 'react';
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

import { kelly, growthRate, getRandomFloat } from './mathUtils';

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

// helper to make one random bet
function generateOneBet(minProbability, maxProbability) {
  const p = getRandomFloat(minProbability / 100.0, maxProbability / 100.0);
  const implied = 1 / p;
  const b = getRandomFloat(implied, implied + (implied - 1) * 2);
  return {
    probability: p,
    payout: b,
    betPercentage: 0.0,
    id: null,
    optimalSize: null,
    state: "neutral",
    result: null,
  };
}

// Memorise each bet card so only the card whose data actually changes re-renders
const BetComponent = React.memo(({ bet, onSliderChange }) => {
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
        <Typography gutterBottom>Bet Percentage of Bankroll</Typography>
        <PrettoSlider
          aria-labelledby={`bet-slider-${bet.id}`}
          value={bet.betPercentage}
          min={0}
          max={100}
          step={0.01}
          valueLabelDisplay="auto"
          onChange={(e, val) => onSliderChange(bet.id, val)}
        />
        <Box sx={{ textAlign: 'center', mt: 1 }}>{bet.betPercentage.toFixed(2)}%</Box>
      </Box>
    </Box>
  );
});

// Memoised line chart to prevent re-render when parent renders but data unchanged
const BankrollChart = React.memo(({ bankrollHistory, optimalBankrollHistory }) => {
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
});

function App() {
  // Track bankrolls in state so the UI updates automatically
  const [bankroll, setBankroll] = useState(1000);
  const [opponentBankroll, setOpponentBankroll] = useState(1000);
  const [bankrollHistory, setBankrollHistory] = useState([{x: 0, y: 1000}]);
  const [optimalBankrollHistory, setOptimalBankrollHistory] = useState([{x: 0, y: 1000}]);

  const [growthUI, setGrowthUI] = useState(0);
  const [betCountUI, setBetCountUI] = useState(0);
  const [gameState, setGameState] = useState("showBet");

  const [minBets, setMinBets] = useState(1);
  const [maxBets, setMaxBets] = useState(2);

  const [minProbability, setMinProbability] = useState(5);
  const [maxProbability, setMaxProbability] = useState(95);
  const [isChartVisible, setIsChartVisible] = useState(false);

  const [isWasmReady, setWasmReady] = useState(false); // retained; could be used later

  const [bets, setBets] = useState([]);

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

    setBankroll(bankroll + userDelta);
    setOpponentBankroll(opponentBankroll + kellyDelta);

    setBankrollHistory(prev => [...prev, { x: prev.length, y: bankroll + userDelta }]);
    setOptimalBankrollHistory(prev => [...prev, { x: prev.length, y: opponentBankroll + kellyDelta }]);
  }, [bets, bankroll, opponentBankroll]);

  const handleBet = useCallback(() => {
    if (gameState === "showBet") {
      let totalBetPercentage = bets.reduce((total, bet) => {
        return total + bet.betPercentage;
      }, 0);
      if (totalBetPercentage <= 100) {
        resolveBets();
        setGameState("showNextBet");
      } else {
        setMessageUI("You bet more than your bankroll! Reduce your bets.");
      }
    } else {
      generateBets();
      setGameState("showBet");
      setMessageUI("Good luck!");
      setBetCountUI(betCountUI + 1);
    }
  }, [gameState, bets, resolveBets, bankroll, opponentBankroll, betCountUI]);

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
  }, [bets, generateOneBet, multi_kelly, minProbability, maxProbability]);

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

  const [messageUI, setMessageUI] = useState("Good Luck!");

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
                ${bankroll.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                ${opponentBankroll.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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

// Math utility functions for the Kelly Betting Simulator.
// Extracted to keep React components focused on UI/state logic and
// make numerical helpers easily unit-testable.

/**
 * Kelly criterion optimal fraction for a single bet.
 *   f* = (bp − q) / b
 * where b = payout − 1 (decimal odds minus one), p = win probability, q = 1 − p.
 * Returns negative values when the edge is negative.
 */
export function kelly(b, p) {
  const q = 1 - p;
  return (b * p - q) / b;
}

/**
 * Expected per-bet log-growth when betting the optimal Kelly fraction.
 * Returns Infinity if parameters fall outside the valid domain.
 */
export function growthRate(b, p) {
  const q = 1 - p;
  const f = kelly(b, p);
  try {
    return p * Math.log(1 + f * b) + q * Math.log(1 - f);
  } catch {
    return Infinity;
  }
}

/**
 * Uniform random float helper in [min, max).
 */
export function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

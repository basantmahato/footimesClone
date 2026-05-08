# Tournament Standings Logic & Calculation

This document explains how the standings (points table) are calculated in the Footimes application, specifically focusing on the resilient frontend fallback mechanism.

## 🏆 Overview
The application uses a dual-layer approach to display standings:
1. **Primary**: Fetches pre-calculated standings from the backend API (`/api/livescore/standings/:name`).
2. **Secondary (Fallback)**: If the API fails (e.g., 500 error), the frontend automatically calculates the standings in real-time using the live match data.

## 🧮 Calculation Logic

The standings are calculated based on finished matches (`status: 'ended'`) for a specific tournament.

### 1. Data Aggregation
The system iterates through every match in the tournament and maintains a record for each team. For every match, the following metrics are updated:

| Metric | logic |
| :--- | :--- |
| **Played (P)** | Incremented by 1 for both teams. |
| **Wins (W)** | Incremented for the team with the higher score. |
| **Draws (D)** | Incremented for both teams if scores are equal. |
| **Losses (L)** | Incremented for the team with the lower score. |
| **Goals For (GF)** | Added the goals scored by the team in that match. |
| **Goals Against (GA)** | Added the goals conceded by the team in that match. |
| **Goal Difference (GD)** | Calculated as `GF - GA`. |
| **Points (Pts)** | **Win**: +3 points \| **Draw**: +1 point \| **Loss**: 0 points. |

### 2. The Algorithm (Pseudo-code)
```typescript
matches.forEach(match => {
  const home = standings[match.homeTeam];
  const away = standings[match.awayTeam];

  home.played++;
  away.played++;
  home.gf += match.homeScore;
  home.ga += match.awayScore;
  away.gf += match.awayScore;
  away.ga += match.homeScore;

  if (match.homeScore > match.awayScore) {
    home.wins++; home.pts += 3;
    away.losses++;
  } else if (match.homeScore < match.awayScore) {
    away.wins++; away.pts += 3;
    home.losses++;
  } else {
    home.draws++; home.pts += 1;
    away.draws++; away.pts += 1;
  }
});
```

### 3. Ranking & Sorting
Once all matches are processed, the teams are ranked using the following tie-breaker hierarchy (standard FIFA/UEFA rules):
1. **Total Points** (Highest first)
2. **Goal Difference** (Highest first)
3. **Goals Scored** (Highest first)

## 🛠 Implementation Details
The logic is implemented within the `fetchTournamentData` function in:
`client2/app/tournament/[...slug]/TournamentDetailsClient.tsx`

It uses `Promise.allSettled` to ensure that even if the standings API fails, the match data (`livescore/all`) is still available to perform this calculation.

export const defaultTournamentConfig = {
  name: "G-SITE Invitational",
  game: "Call of Duty",
  format: "Trios Custom",
  totalMatches: 15,
  date: "April 12, 2026 — 8:00 PM GST",
  prizePool: "$500 USD",
  scoringType: "points", // "points" | "multiplier"
  killPoints: 1,
  placementPoints: {
    1: 10,
    2: 7,
    3: 5,
    4: 3,
    5: 1
  },
  placementMultipliers: {
    1: 1.6,
    2: 1.4,
    3: 1.2,
    4: 1.1,
    5: 1.0
  }
};

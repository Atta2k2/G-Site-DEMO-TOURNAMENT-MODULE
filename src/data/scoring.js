export function getPlacementMultiplier(placement, config) {
  if (placement == null || placement < 1) return 1.0;
  return config?.placementMultipliers?.[placement] || config?.placementMultipliers?.[5] || 1.0; 
}

export function getPlacementPoints(placement, config) {
  if (placement == null || placement < 1) return 0;
  return config?.placementPoints?.[placement] || config?.placementPoints?.[5] || 1; 
}

/**
 * Build leaderboard from results and teams.
 * results shape: { [matchId]: { [teamId]: { placement, kills, warnings[] } } }
 */
export function buildLeaderboard(teams, results, config) {
  const isMultiplier = config?.scoringType === "multiplier";

  const board = teams.map((team) => {
    let totalKills = 0;
    let totalScore = 0;
    let totalPenalty = 0;
    let matchesPlayed = 0;

    for (let m = 1; m <= config.totalMatches; m++) {
      const matchResults = results[m];
      if (!matchResults || !matchResults[team.id]) continue;
      const { placement, kills, status, penalty } = matchResults[team.id];
      
      // ONLY compute scores for finalized/approved results
      if (status !== "approved") continue;

      const safeKills = typeof kills === "number" && !isNaN(kills) ? kills : 0;
      const safePenalty = typeof penalty === "number" && !isNaN(penalty) ? Math.abs(penalty) : 0;
      
      let matchScore = 0;
      if (isMultiplier) {
        const multiplier = getPlacementMultiplier(placement, config);
        matchScore = safeKills * multiplier;
      } else {
        const killPoints = config?.killPoints || 1;
        matchScore = (safeKills * killPoints) + getPlacementPoints(placement, config);
      }

      totalKills += safeKills;
      totalScore += matchScore;
      totalPenalty += safePenalty;
      matchesPlayed++;
    }

    return {
      teamId: team.id,
      teamName: team.name,
      avatarUrl: team.avatarUrl,
      players: team.players,
      totalKills,
      totalPenalty,
      totalScore: Number((totalScore - totalPenalty).toFixed(2)),
      matchesPlayed,
    };
  });

  // Sort: total score desc → total kills desc → alphabetical asc
  board.sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    if (b.totalKills !== a.totalKills) return b.totalKills - a.totalKills;
    return a.teamName.localeCompare(b.teamName);
  });

  return board;
}

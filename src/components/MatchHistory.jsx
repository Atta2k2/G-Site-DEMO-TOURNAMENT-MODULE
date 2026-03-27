import { getPlacementMultiplier, getPlacementPoints } from "../data/scoring";

function MatchHistory({ results, teams, totalMatches, lockedMatches, config }) {
  const isMultiplier = config?.scoringType === "multiplier";

  return (
    <section className="section">
      <h2>Match History</h2>
      {Array.from({ length: totalMatches }, (_, i) => i + 1).map((matchId) => {
        const matchResults = results[matchId];
        const isLocked = lockedMatches.includes(matchId);

        return (
          <div key={matchId} className="match-history-block">
            <h3>
              Match {matchId} {isLocked ? "🔒" : ""}
            </h3>
            {!matchResults || Object.keys(matchResults).length === 0 ? (
              <p className="no-data">No results submitted.</p>
            ) : (
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Team</th>
                    <th>Placement</th>
                    <th>Kills</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team) => {
                    const r = matchResults[team.id];
                    if (!r) return null;
                    
                    let points = 0;
                    if (r.placement) {
                      const kills = typeof r.kills === "number" ? r.kills : 0;
                      const penalty = typeof r.penalty === "number" ? Math.abs(r.penalty) : 0;
                      if (isMultiplier) {
                        const multiplier = getPlacementMultiplier(r.placement, config);
                        points = (kills * multiplier) - penalty;
                      } else {
                        const killPoints = config?.killPoints || 1;
                        points = (kills * killPoints) + getPlacementPoints(r.placement, config) - penalty;
                      }
                    }

                    return (
                      <tr key={team.id}>
                        <td>{team.name}</td>
                        <td>{r.placement ?? "—"}</td>
                        <td>{r.kills ?? 0}</td>
                        <td className="score-cell">{r.placement ? Number(points.toFixed(2)) : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        );
      })}
    </section>
  );
}

export default MatchHistory;

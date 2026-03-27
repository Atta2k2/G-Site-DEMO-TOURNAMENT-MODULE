import { buildLeaderboard } from "../data/scoring";

function Leaderboard({ teams, results, config }) {
  const board = buildLeaderboard(teams, results, config);

  return (
    <section className="section">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ margin: 0 }}>Leaderboard</h2>
      </div>
      {board.length === 0 ? (
        <p>No results submitted yet.</p>
      ) : (
        <div className="leaderboard-grid">
          {board.map((entry, idx) => {
            const rank = idx + 1;
            let rankClass = "lb-rank-default";
            if (rank === 1) rankClass = "lb-rank-gold";
            else if (rank === 2) rankClass = "lb-rank-silver";
            else if (rank === 3) rankClass = "lb-rank-bronze";

            const playerNames = entry.players && entry.players.length 
              ? entry.players.join(" | ").toUpperCase()
              : "NO PLAYERS REGISTERED";

            return (
              <div key={entry.teamId} className="lb-card">
                <div className={`lb-card-rank ${rankClass}`}>#{rank}</div>
                {entry.avatarUrl && (
                  <img 
                    src={entry.avatarUrl} 
                    alt="avatar" 
                    style={{ width: 44, height: 44, borderRadius: "50%", background: "#1a1a2e", marginRight: "1rem", border: "1px solid #2a2a3e" }} 
                  />
                )}
                <div className="lb-card-main">
                  <div className="lb-team-name">{entry.teamName.toUpperCase()}</div>
                  <div className="lb-team-players">{playerNames}</div>
                </div>
                <div className="lb-card-stats">
                  <div className="lb-points">Points: {entry.totalScore}</div>
                  <div className="lb-kills">Kills: {entry.totalKills}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default Leaderboard;

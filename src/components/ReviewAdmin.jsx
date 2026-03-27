import WarningBadge from "./WarningBadge";

function ReviewAdmin({ teams, results, onApprove, onReject }) {
  // Extract all pending submissions across all matches
  const pendingMap = {};

  Object.entries(results).forEach(([matchIdStr, teamScores]) => {
    const matchId = Number(matchIdStr);
    Object.entries(teamScores).forEach(([teamIdStr, data]) => {
      const teamId = Number(teamIdStr);
      if (data.status === "pending" && data.placement) {
        if (!pendingMap[matchId]) pendingMap[matchId] = [];
        pendingMap[matchId].push({
          teamId,
          teamName: teams.find(t => t.id === teamId)?.name || "Unknown",
          placement: data.placement,
          kills: data.kills,
        });
      }
    });
  });

  const pendingMatches = Object.keys(pendingMap).map(Number).sort((a,b)=>a-b);

  return (
    <section className="section">
      <h2>Review Pending Scores</h2>
      <p style={{marginBottom: "1rem", color: "#b0b0b0"}}>
        Approve scores to finalize them and update the Leaderboard.
      </p>
      
      {pendingMatches.length === 0 ? (
        <p>No pending scores to review.</p>
      ) : (
        pendingMatches.map(matchId => {
          const matchPendings = pendingMap[matchId];
          const placements = matchPendings.map(p => p.placement);
          const duplicatePlacements = placements.filter((p, i) => placements.indexOf(p) !== i);
          
          return (
            <div key={matchId} className="match-history-block" style={{border: "1px solid #2a2a3e", padding: "1rem", borderRadius: "6px"}}>
              <h3>Match {matchId}</h3>
              {duplicatePlacements.length > 0 && (
                <div className="lock-notice" style={{marginTop: "0.5rem", background: "#3a1a1a"}}>
                  <WarningBadge message="Duplicate Placements Detected" />
                  <strong> WARNING:</strong> Multiple teams reported the same placement ({[...new Set(duplicatePlacements)].join(", ")}). Resolve this before approving!
                </div>
              )}
              
              <table className="results-table mt-1">
                <thead>
                  <tr>
                    <th>Team</th>
                    <th>Placement</th>
                    <th>Kills</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {matchPendings.map(entry => {
                    const isDup = duplicatePlacements.includes(entry.placement);
                    return (
                      <tr key={entry.teamId} style={isDup ? {backgroundColor: "rgba(233, 69, 96, 0.15)"} : {}}>
                        <td>{entry.teamName}</td>
                        <td>{entry.placement} {isDup && "⚠️"}</td>
                        <td>{entry.kills ?? 0}</td>
                        <td>
                          <div className="admin-actions">
                            <button 
                              className="btn-save" 
                              onClick={() => {
                                if (duplicatePlacements.length === 0) onApprove(matchId, entry.teamId)
                              }}
                              disabled={duplicatePlacements.length > 0}
                              title={duplicatePlacements.length > 0 ? `⚠️ WARNING: Multiple teams reported the same placement (${[...new Set(duplicatePlacements)].join(", ")}). Resolve this before approving!` : ""}
                              style={duplicatePlacements.length > 0 ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                            >
                              Approve
                            </button>
                            <button className="btn-delete" onClick={() => onReject(matchId, entry.teamId)}>Reject</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div style={{marginTop: "0.5rem", display: "flex", justifyContent: "flex-end"}}>
                <button 
                  className="btn-save" 
                  style={{
                    padding: "0.5rem 1rem",
                    ...(duplicatePlacements.length > 0 ? { opacity: 0.5, cursor: "not-allowed" } : {})
                  }}
                  disabled={duplicatePlacements.length > 0}
                  title={duplicatePlacements.length > 0 ? `⚠️ WARNING: Multiple teams reported the same placement (${[...new Set(duplicatePlacements)].join(", ")}). Resolve this before approving!` : ""}
                  onClick={() => {
                    if (duplicatePlacements.length === 0) {
                      matchPendings.forEach(entry => onApprove(matchId, entry.teamId))
                    }
                  }}
                >
                  Bulk Approve Match {matchId}
                </button>
              </div>
            </div>
          );
        })
      )}
    </section>
  );
}

export default ReviewAdmin;

import { useState } from "react";
import WarningBadge from "./WarningBadge";

function MatchResultForm({ teams, results, lockedMatches, totalMatches, onSubmitResult, onToggleLock, onResetScores, isAdminLoggedIn }) {
  const [selectedMatch, setSelectedMatch] = useState(1);

  const isLocked = lockedMatches.includes(selectedMatch);
  const matchResults = results[selectedMatch] || {};

  // Detect duplicate placements in this match
  const placements = Object.values(matchResults).map((r) => r.placement).filter(Boolean);
  const duplicatePlacements = placements.filter((p, i) => placements.indexOf(p) !== i);

  function handleChange(teamId, field, rawValue) {
    if (isLocked) return;
    const existing = matchResults[teamId] || { placement: null, kills: null, warnings: [] };
    
    // Players cannot edit approved scores
    if (!isAdminLoggedIn && existing.status === "approved") {
      return;
    }

    const value = rawValue === "" ? null : Number(rawValue);
    const updated = { ...existing, [field]: value, warnings: [] };

    // Build warnings
    if (field === "kills" && (value === null || isNaN(value))) {
      updated.kills = null;
      updated.warnings.push("Missing kills — will default to 0");
    }

    onSubmitResult(selectedMatch, teamId, updated);
  }

  return (
    <section className="section">
      <h2>Match Results</h2>

      <div className="match-controls">
        <label>
          Match:&nbsp;
          <select value={selectedMatch} onChange={(e) => setSelectedMatch(Number(e.target.value))}>
            {Array.from({ length: totalMatches }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                Match {m} {lockedMatches.includes(m) ? "🔒" : ""}
              </option>
            ))}
          </select>
        </label>

        {isAdminLoggedIn && (
          <>
            <button
              className={isLocked ? "btn-unlock" : "btn-lock"}
              onClick={() => onToggleLock(selectedMatch)}
            >
              {isLocked ? "🔓 Unlock Match" : "🔒 Lock Match"}
            </button>
            <button
              className="btn-delete"
              style={{ marginLeft: "1rem" }}
              onClick={onResetScores}
            >
              🔄 Reset All Scores
            </button>
          </>
        )}
      </div>

      {isLocked && <p className="lock-notice">This match is locked. Results cannot be edited.</p>}

      <table className="results-table">
        <thead>
          <tr>
            <th>Team</th>
            <th>Placement</th>
            <th>Kills</th>
            {isAdminLoggedIn && <th>Penalty 🔒 (Admin Only)</th>}
            <th>Status/Warnings</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => {
            const r = matchResults[team.id] || { placement: null, kills: null, warnings: [] };
            const hasDupPlacement = r.placement && duplicatePlacements.includes(r.placement);
            const missingKills = r.kills === null || r.kills === undefined;

            return (
              <tr key={team.id}>
                <td>{team.name}</td>
                <td>
                  <input
                    type="number"
                    min="1"
                    placeholder="-"
                    value={r.placement ?? ""}
                    disabled={!isAdminLoggedIn && (isLocked || r.status === "approved")}
                    onChange={(e) => handleChange(team.id, "placement", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={r.kills ?? ""}
                    disabled={!isAdminLoggedIn && (isLocked || r.status === "approved")}
                    onChange={(e) => handleChange(team.id, "kills", e.target.value)}
                  />
                </td>
                {isAdminLoggedIn && (
                  <td>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={r.penalty ?? ""}
                      disabled={false}
                      onChange={(e) => handleChange(team.id, "penalty", e.target.value)}
                    />
                  </td>
                )}
                <td>
                  {r.status === "approved" && <span className="status-badge approved">Approved</span>}
                  {r.status === "pending" && <span className="status-badge pending">Pending...</span>}
                  {hasDupPlacement && <WarningBadge message="Duplicate placement" />}
                  {missingKills && r.placement && <WarningBadge message="Missing kills — defaults to 0" />}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

export default MatchResultForm;

import { useState } from "react";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { Routes, Route, useNavigate } from "react-router-dom";
import HeroBanner from "./components/HeroBanner";
import TeamList from "./components/TeamList";
import MatchResultForm from "./components/MatchResultForm";
import Leaderboard from "./components/Leaderboard";
import MatchHistory from "./components/MatchHistory";
import ReviewAdmin from "./components/ReviewAdmin";
import Login from "./components/Login";
import toast, { Toaster } from "react-hot-toast";
import { defaultTeams } from "./data/teams";
import { defaultTournamentConfig } from "./data/tournament";
import "./App.css";

const TABS = ["Overview", "Teams", "Match Results", "Review", "Leaderboard", "Match History"];

function App() {
  const [activeTab, setActiveTab] = useLocalStorage("gsite-activeTab", "Overview");
  const [teams, setTeams] = useLocalStorage("gsite-teams", defaultTeams);
  // results shape: { [matchId]: { [teamId]: { placement, kills, warnings[] } } }
  const [results, setResults] = useLocalStorage("gsite-results", {});
  const [lockedMatches, setLockedMatches] = useLocalStorage("gsite-locked", []);
  
  const [tourneyConfig, setTourneyConfig] = useLocalStorage("gsite-tourney-config", defaultTournamentConfig);
  const [isEditingConfig, setIsEditingConfig] = useState(false);
  const [tempConfig, setTempConfig] = useState(null);

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useLocalStorage("gsite-admin", false);
  const navigate = useNavigate();

  function startConfigEdit() {
    // Stringify deep clone to prevent direct state mutation of placementPoints
    setTempConfig(JSON.parse(JSON.stringify(tourneyConfig)));
    setIsEditingConfig(true);
  }

  function saveConfigEdit(e) {
    e.preventDefault();
    setTourneyConfig(tempConfig);
    setIsEditingConfig(false);
    toast.success("Tournament Configuration Updated!", { icon: '⚙️' });
  }

  function handleRegisterTeam(newTeam) {
    setTeams((prev) => [...prev, newTeam]);
    toast.success(`Team "${newTeam.name}" has been registered!`, { icon: '🎉' });
  }

  function handleDeleteTeam(teamId) {
    if (window.confirm("Are you sure you want to delete this team?")) {
      setTeams((prev) => prev.filter((t) => t.id !== teamId));
      toast.success("Team has been deleted.", { icon: '🗑️' });
    }
  }

  function handleEditTeam(updatedTeam) {
    setTeams((prev) => prev.map((t) => t.id === updatedTeam.id ? updatedTeam : t));
    toast.success(`Team "${updatedTeam.name}" has been updated.`);
  }

  function handleSubmitResult(matchId, teamId, data) {
    // Force status to pending unless already approved
    const previousStatus = results?.[matchId]?.[teamId]?.status;
    const isApproved = previousStatus === "approved";
    
    setResults((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [teamId]: {
          ...data,
          status: isApproved ? "approved" : "pending"
        },
      },
    }));
  }

  function handleApproveMatch(matchId, teamId) {
    setResults((prev) => {
      const teamData = prev[matchId][teamId];
      return {
        ...prev,
        [matchId]: {
          ...prev[matchId],
          [teamId]: { ...teamData, status: "approved" },
        },
      };
    });
    // Find team name for better UX
    const teamName = teams.find(t => t.id === teamId)?.name || "Unknown Team";
    toast.success(`Score approved for ${teamName} (Match ${matchId})!`, { icon: '✅' });
  }

  function handleRejectMatch(matchId, teamId) {
    setResults((prev) => {
      const matchData = { ...prev[matchId] };
      delete matchData[teamId];
      return { ...prev, [matchId]: matchData };
    });
    toast.error(`Score rejected for Match ${matchId}.`);
  }

  function handleToggleLock(matchId) {
    setLockedMatches((prev) =>
      prev.includes(matchId)
        ? prev.filter((id) => id !== matchId)
        : [...prev, matchId]
    );
  }

  function handleResetScores() {
    if (window.confirm("Are you sure you want to reset ALL tournament scores? This will delete all Match Results and cannot be undone.")) {
      setResults({});
      setLockedMatches([]);
      toast.success("Tournament scores have been completely reset.", { icon: '🔄' });
    }
  }

  const visibleTabs = isAdminLoggedIn ? TABS : TABS.filter(t => t !== "Review");

  return (
    <>
    <Toaster 
      position="bottom-right" 
      toastOptions={{
        style: {
          background: '#1e1e2f',
          color: '#fff',
          border: '1px solid #2a2a3e',
        },
      }} 
    />
    <Routes>
      <Route path="/login" element={<Login onLogin={() => setIsAdminLoggedIn(true)} />} />
      <Route path="/" element={
        <div className="app">
          <HeroBanner config={tourneyConfig} onRegisterClick={() => setActiveTab("Teams")} />

          <nav className="tab-nav">
            {visibleTabs.map((tab) => {
              let label = tab;
              if (tab === "Review") {
                label = `${tab} 🔒 (Admin)`;
              }
              return (
                <button
                  key={tab}
                  className={activeTab === tab ? "tab active" : "tab"}
                  onClick={() => setActiveTab(tab)}
                >
                  {label}
                </button>
              );
            })}
            
            <div className="admin-toggle" style={{ marginLeft: "auto" }}>
              {isAdminLoggedIn ? (
                <button className="tab" onClick={() => { setIsAdminLoggedIn(false); setActiveTab("Overview"); }}>Logout</button>
              ) : (
                <button className="tab" onClick={() => navigate("/login")}>Admin Login</button>
              )}
            </div>
          </nav>

          <main className="main-content">
            {activeTab === "Overview" && (
              <section className="section">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                  <h2 style={{ margin: 0 }}>Tournament Overview</h2>
                  {isAdminLoggedIn && !isEditingConfig && (
                    <button onClick={startConfigEdit} className="btn-edit" style={{ padding: "0.5rem 1.2rem", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                      ⚙️ Edit Config (Admin Only)
                    </button>
                  )}
                </div>

                {isEditingConfig ? (
                  <form onSubmit={saveConfigEdit} className="admin-config-container">
                    
                    {/* General Settings Card */}
                    <div className="admin-card">
                      <h3>General Settings</h3>
                      <div className="admin-form-grid">
                        <div className="admin-input-group">
                          <label>Tournament Name</label>
                          <input className="admin-input" type="text" value={tempConfig.name} onChange={(e) => setTempConfig({...tempConfig, name: e.target.value})} required />
                        </div>
                        <div className="admin-input-group">
                          <label>Game</label>
                          <input className="admin-input" type="text" value={tempConfig.game} onChange={(e) => setTempConfig({...tempConfig, game: e.target.value})} required />
                        </div>
                        <div className="admin-input-group">
                          <label>Format</label>
                          <input className="admin-input" type="text" value={tempConfig.format} onChange={(e) => setTempConfig({...tempConfig, format: e.target.value})} required />
                        </div>
                        <div className="admin-input-group">
                          <label>Date/Time</label>
                          <input className="admin-input" type="text" value={tempConfig.date} onChange={(e) => setTempConfig({...tempConfig, date: e.target.value})} required />
                        </div>
                        <div className="admin-input-group">
                          <label>Prize Pool</label>
                          <input className="admin-input" type="text" value={tempConfig.prizePool} onChange={(e) => setTempConfig({...tempConfig, prizePool: e.target.value})} required />
                        </div>
                        <div className="admin-input-group">
                          <label>Total Matches</label>
                          <input className="admin-input" type="number" min="1" value={tempConfig.totalMatches} onChange={(e) => setTempConfig({...tempConfig, totalMatches: Number(e.target.value)})} required />
                        </div>
                      </div>
                    </div>

                    {/* Scoring Settings Card */}
                    <div className="admin-card">
                      <h3>Scoring Configuration</h3>
                      
                      <div className="mode-toggle-container">
                        <button 
                          type="button" 
                          className={`mode-btn ${tempConfig.scoringType === 'points' ? 'active' : ''}`}
                          onClick={() => setTempConfig({...tempConfig, scoringType: 'points'})}
                        >
                          Traditional Points
                        </button>
                        <button 
                          type="button" 
                          className={`mode-btn ${tempConfig.scoringType === 'multiplier' ? 'active' : ''}`}
                          onClick={() => setTempConfig({...tempConfig, scoringType: 'multiplier'})}
                        >
                          Placement Multiplier
                        </button>
                      </div>

                      {tempConfig.scoringType === 'points' ? (
                        <>
                          <div className="admin-input-group" style={{ marginBottom: "1rem" }}>
                            <label>Points Per Kill</label>
                            <input className="admin-input" type="number" step="1" value={tempConfig.killPoints} onChange={(e) => setTempConfig({...tempConfig, killPoints: Number(e.target.value)})} required />
                          </div>
                          <div className="admin-form-grid">
                            {[1, 2, 3, 4, 5].map(place => (
                              <div className="admin-input-group" key={place}>
                                <label>{place === 5 ? "5th+" : place + (place===1?"st":place===2?"nd":place===3?"rd":"th")} Place Points</label>
                                <input className="admin-input" type="number" step="1" value={tempConfig.placementPoints?.[place] || 0} onChange={(e) => setTempConfig({...tempConfig, placementPoints: {...tempConfig.placementPoints, [place]: Number(e.target.value)}})} required />
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="admin-form-grid">
                          {[1, 2, 3, 4, 5].map(place => (
                            <div className="admin-input-group" key={place}>
                              <label>{place === 5 ? "5th+" : place + (place===1?"st":place===2?"nd":place===3?"rd":"th")} Multiplier (x)</label>
                              <input className="admin-input" type="number" step="0.1" value={tempConfig.placementMultipliers?.[place] || 1.0} onChange={(e) => setTempConfig({...tempConfig, placementMultipliers: {...tempConfig.placementMultipliers, [place]: Number(e.target.value)}})} required />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                      <button type="submit" className="btn-save" style={{ flex: 1, padding: "0.8rem", fontSize: "1rem" }}>Save Configuration</button>
                      <button type="button" className="btn-danger" style={{ flex: 1, padding: "0.8rem", fontSize: "1rem" }} onClick={() => setIsEditingConfig(false)}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <div style={{ display: "flex", gap: "2rem", marginTop: "1rem", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: "300px" }}>
                      <h3 style={{ fontSize: "1.4rem", color: "#4da6ff", marginBottom: "1rem" }}>{tourneyConfig.name}</h3>
                      <p><strong>Game:</strong> {tourneyConfig.game}</p>
                      <p><strong>Format:</strong> {tourneyConfig.format}</p>
                      <p><strong>Matches:</strong> {tourneyConfig.totalMatches}</p>
                      <p><strong>Date:</strong> {tourneyConfig.date}</p>
                      <p><strong>Prize Pool:</strong> {tourneyConfig.prizePool}</p>
                    </div>
                    <div style={{ flex: 1, minWidth: "300px", background: "#1a1a2e", padding: "1.5rem", borderRadius: "8px", border: "1px solid #2a2a3e" }}>
                      <h3 style={{ marginTop: 0 }}>Scoring Rules: {tourneyConfig.scoringType === 'multiplier' ? 'Kill Multipliers' : 'Traditional Points'}</h3>
                      
                      {tourneyConfig.scoringType === 'multiplier' ? (
                        <>
                          <p style={{color: "#a4969e", fontSize: "0.85rem"}}>Total Points = [Kills × Placement Multiplier] - Penalty</p>
                          <table className="results-table" style={{ marginTop: "1rem" }}>
                            <thead>
                              <tr><th>Placement</th><th>Multiplier</th></tr>
                            </thead>
                            <tbody>
                              {[1, 2, 3, 4, 5].map(p => (
                                <tr key={p}><td>{p === 5 ? "5th+" : p + (p===1?"st":p===2?"nd":p===3?"rd":"th")}</td><td>{tourneyConfig.placementMultipliers?.[p] || 1.0}x</td></tr>
                              ))}
                            </tbody>
                          </table>
                        </>
                      ) : (
                        <>
                          <p style={{color: "#a4969e", fontSize: "0.85rem"}}>Total Points = (Kills × {tourneyConfig.killPoints}) + Placement Points - Penalty</p>
                          <table className="results-table" style={{ marginTop: "1rem" }}>
                            <thead>
                              <tr><th>Placement</th><th>Points</th></tr>
                            </thead>
                            <tbody>
                              {[1, 2, 3, 4, 5].map(p => (
                                <tr key={p}><td>{p === 5 ? "5th+" : p + (p===1?"st":p===2?"nd":p===3?"rd":"th")}</td><td>{tourneyConfig.placementPoints?.[p] || 0}</td></tr>
                              ))}
                            </tbody>
                          </table>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </section>
            )}

            {activeTab === "Teams" && (
              <TeamList 
                teams={teams} 
                onRegister={handleRegisterTeam} 
                isAdminLoggedIn={isAdminLoggedIn}
                onDelete={handleDeleteTeam}
                onEdit={handleEditTeam}
              />
            )}

            {activeTab === "Match Results" && (
              <MatchResultForm
                teams={teams}
                results={results}
                lockedMatches={lockedMatches}
                totalMatches={tourneyConfig.totalMatches}
                onSubmitResult={handleSubmitResult}
                onToggleLock={handleToggleLock}
                onResetScores={handleResetScores}
                isAdminLoggedIn={isAdminLoggedIn}
              />
            )}

            {activeTab === "Review" && isAdminLoggedIn && (
              <ReviewAdmin 
                teams={teams} 
                results={results} 
                onApprove={handleApproveMatch} 
                onReject={handleRejectMatch}
              />
            )}

            {activeTab === "Leaderboard" && (
              <Leaderboard
                teams={teams}
                results={results}
                config={tourneyConfig}
              />
            )}

            {activeTab === "Match History" && (
              <MatchHistory
                results={results}
                teams={teams}
                totalMatches={tourneyConfig.totalMatches}
                lockedMatches={lockedMatches}
                config={tourneyConfig}
              />
            )}
          </main>
        </div>
      } />
    </Routes>
    </>
  );
}

export default App;

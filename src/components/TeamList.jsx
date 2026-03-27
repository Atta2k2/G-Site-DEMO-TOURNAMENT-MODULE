import { useState } from "react";

function TeamList({ teams, onRegister, isAdminLoggedIn, onDelete, onEdit }) {
  const [teamName, setTeamName] = useState("");
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [player3, setPlayer3] = useState("");

  const [editingTeamId, setEditingTeamId] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: "", p1: "", p2: "", p3: "" });

  function handleSubmit(e) {
    e.preventDefault();
    if (!teamName || !player1 || !player2 || !player3) {
      alert("Please fill in all fields.");
      return;
    }
    const newTeam = {
      id: Date.now(),
      name: teamName,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(teamName)}`,
      players: [player1, player2, player3],
    };
    onRegister(newTeam);
    setTeamName("");
    setPlayer1("");
    setPlayer2("");
    setPlayer3("");
  }

  function startEdit(team) {
    setEditingTeamId(team.id);
    setEditFormData({
      name: team.name,
      p1: team.players[0] || "",
      p2: team.players[1] || "",
      p3: team.players[2] || "",
    });
  }

  function saveEdit(teamId) {
    onEdit({
      id: teamId,
      name: editFormData.name,
      players: [editFormData.p1, editFormData.p2, editFormData.p3],
    });
    setEditingTeamId(null);
  }

  return (
    <section className="section">
      <div className="registration-container">
        <h2>Register a Team</h2>
        <form onSubmit={handleSubmit} className="registration-form">
          <input type="text" placeholder="Team Name" value={teamName} onChange={e => setTeamName(e.target.value)} required />
          <div className="player-inputs">
            <input type="text" placeholder="Player 1" value={player1} onChange={e => setPlayer1(e.target.value)} required />
            <input type="text" placeholder="Player 2" value={player2} onChange={e => setPlayer2(e.target.value)} required />
            <input type="text" placeholder="Player 3" value={player3} onChange={e => setPlayer3(e.target.value)} required />
          </div>
          <button type="submit" className="btn-register">Submit Registration</button>
        </form>
      </div>

      <h2 style={{marginTop: "2rem", marginBottom: "1rem", color: "#e94560"}}>Registered Teams</h2>
      <div className="team-grid">
        {teams.map((team) => (
          <div key={team.id} className="team-card">
            {editingTeamId === team.id ? (
              <div className="edit-form-inline">
                <input type="text" value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} placeholder="Team Name" />
                <input type="text" value={editFormData.p1} onChange={e => setEditFormData({...editFormData, p1: e.target.value})} placeholder="Player 1" />
                <input type="text" value={editFormData.p2} onChange={e => setEditFormData({...editFormData, p2: e.target.value})} placeholder="Player 2" />
                <input type="text" value={editFormData.p3} onChange={e => setEditFormData({...editFormData, p3: e.target.value})} placeholder="Player 3" />
                <div className="admin-actions mt-1">
                  <button onClick={() => saveEdit(team.id)} className="btn-save">Save</button>
                  <button onClick={() => setEditingTeamId(null)} className="btn-cancel">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  {team.avatarUrl && (
                    <img 
                      src={team.avatarUrl} 
                      alt="avatar" 
                      style={{ width: 44, height: 44, borderRadius: "50%", background: "#1a1a2e", border: "1px solid #2a2a3e" }} 
                    />
                  )}
                  <h3 style={{ margin: 0 }}>{team.name}</h3>
                </div>
                <ul style={{ marginTop: "1rem" }}>
                  {team.players.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
                {isAdminLoggedIn && (
                  <div className="admin-actions mt-1">
                    <button onClick={() => startEdit(team)} className="btn-edit">Edit (Admin Only)</button>
                    <button onClick={() => onDelete(team.id)} className="btn-delete">Delete (Admin Only)</button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default TeamList;

import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Generic simple authentication check
    if (username === "admin" && password === "admin") {
      onLogin();
      navigate("/");
    } else {
      setError("Invalid credentials. Try admin:admin");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Admin Login</h2>
        <form onSubmit={handleLogin} className="login-form">
          <input
            type="text"
            placeholder="Username (admin)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password (admin)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="login-btn">
            Login
          </button>
        </form>
        <button className="back-btn" onClick={() => navigate("/")}>
          Back to Tournament
        </button>
      </div>
    </div>
  );
}

export default Login;

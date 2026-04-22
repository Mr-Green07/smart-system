import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import "../styles/auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const res = await API.post("/auth/login", {
      email,
      password,
    });

    // 🔥 SAVE TOKEN
    localStorage.setItem("token", res.data.token);

    alert("Login successful ✅");

    navigate("/dashboard");
  } catch (err) {
    console.log(err.response);
    alert(err.response?.data?.msg || "Login failed ❌");
  }
};

  return (
    <div className="auth-container">
      
      {/* LEFT PANEL */}
      <div className="auth-left">
        <h1>SDIP</h1>
        <h2>Welcome Back!</h2>
        <p>Sign in to continue your data-driven journey</p>

        <ul>
          <li>AI-powered insights</li>
          <li>Real-time analytics</li>
          <li>Smart recommendations</li>
        </ul>

        <div className="stats">
          <div><h3>10K+</h3><p>Users</p></div>
          <div><h3>250K+</h3><p>Data</p></div>
          <div><h3>99.9%</h3><p>Uptime</p></div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="auth-right">
        <form onSubmit={handleLogin} className="auth-form">
          <h2>Sign In</h2>

          <input
            type="email"
            placeholder="Enter email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Enter password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Sign In</button>

          <p>
            Don’t have account? <Link to="/signup">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
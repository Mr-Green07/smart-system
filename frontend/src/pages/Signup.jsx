import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import "../styles/auth.css";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      alert("All fields are required");
      return;
    }

    try {
      const res = await API.post("/auth/signup", form);

      console.log("Signup success:", res.data);
      alert("Signup successful ✅");
      navigate("/");

    } catch (err) {
      console.log("FULL ERROR:", err);
      console.log("ERROR RESPONSE:", err.response);
      console.log("ERROR DATA:", err.response?.data);

      alert(
        err.response?.data?.message || "Signup failed ❌"
      );
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <h1>SDIP</h1>
        <h2>Create Account</h2>
        <p>Join intelligent analytics platform</p>
      </div>

      <div className="auth-right">
        <form onSubmit={handleSignup} className="auth-form">
          <h2>Sign Up</h2>

          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />

          <button type="submit">Create Account</button>

          <p>
            Already have account? <Link to="/">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
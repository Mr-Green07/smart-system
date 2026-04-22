import { Link, Outlet, useNavigate } from "react-router-dom";
import "../styles/layout.css";

export default function MainLayout() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>SDIP</h2>

        <nav>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/sales">Sales</Link>
          <Link to="/insights">Insights</Link>
          <Link to="/recommendations">Recommendations</Link>
          <Link to="/regions">Regions</Link>
          <Link to="/customers">Customers</Link>
          <Link to="/settings">Settings</Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="topbar">
          <h2>Dashboard</h2>
          <button onClick={logout}>Logout</button>
        </div>

        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
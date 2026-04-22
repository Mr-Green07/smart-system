import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="w-64 bg-white shadow p-4">
      <h1 className="text-xl font-bold mb-6">SDIP</h1>

      <nav className="flex flex-col gap-3">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/sales">Sales</Link>
        <Link to="/insights">Insights</Link>
        <Link to="/recommendations">Recommendations</Link>
        <Link to="/regions">Regions</Link>
        <Link to="/customers">Customers</Link>
        <Link to="/settings">Settings</Link>
      </nav>
    </div>
  );
};

export default Sidebar;
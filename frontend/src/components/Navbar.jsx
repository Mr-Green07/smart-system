export default function Navbar() {
  return (
    <div style={{
      height: "60px",
      background: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 20px",
      borderBottom: "1px solid #ddd"
    }}>
      <h3>Dashboard</h3>

      <button
        onClick={() => {
          localStorage.removeItem("token");
          window.location.href = "/";
        }}
      >
        Logout
      </button>
    </div>
  );
}
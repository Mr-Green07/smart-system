import { useEffect, useState } from "react";
import API from "../api/axios";

export default function Dashboard() {
  const [report, setReport] = useState([]);
  const [top, setTop] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    API.get("/sales/report").then(res => setReport(res.data));
    API.get("/sales/top").then(res => setTop(res.data));
    API.get("/products").then(res => setProducts(res.data));
  }, []);

  return (
    <div>
      <h2>Dashboard Overview</h2>

      <div className="card">
        <h3>Sales Report</h3>
        <pre>{JSON.stringify(report, null, 2)}</pre>
      </div>

      <div className="card">
        <h3>Top Products</h3>
        <pre>{JSON.stringify(top, null, 2)}</pre>
      </div>

      <div className="card">
        <h3>All Products</h3>
        <pre>{JSON.stringify(products, null, 2)}</pre>
      </div>
    </div>
  );
}
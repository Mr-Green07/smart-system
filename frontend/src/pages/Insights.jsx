import { useEffect, useState } from "react";
import API from "../api/axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export default function Insights() {
  const [data, setData] = useState([]);

  useEffect(() => {
    API.get("/sales/top")
      .then(res => setData(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Top Products</h2>

      <BarChart width={600} height={300} data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="total_sold" />
      </BarChart>
    </div>
  );
}
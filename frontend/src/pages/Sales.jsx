import { useEffect, useState } from "react";
import API from "../api/axios";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";

export default function Sales() {
  const [data, setData] = useState([]);

  useEffect(() => {
    API.get("/sales/report")
      .then(res => setData(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Sales Analytics</h2>

      <LineChart width={600} height={300} data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <CartesianGrid strokeDasharray="3 3" />
        <Line type="monotone" dataKey="revenue" />
      </LineChart>
    </div>
  );
}
const pool = require("../config/db");

exports.addProduct = async (req, res) => {
  const { name, price, stock } = req.body;

  const result = await pool.query(
    "INSERT INTO products (name,price,stock) VALUES ($1,$2,$3) RETURNING *",
    [name, price, stock]
  );

  res.json(result.rows[0]);
};

exports.getProducts = async (req, res) => {
  const result = await pool.query("SELECT * FROM products");
  res.json(result.rows);
};
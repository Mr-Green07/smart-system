const pool = require("../config/db");

// ADD SALE
exports.addSale = async (req, res) => {
  try {
    const { product_id, quantity, total } = req.body;

    await pool.query(
      "INSERT INTO sales (product_id, quantity, total) VALUES ($1, $2, $3)",
      [product_id, quantity, total]
    );

    res.json({ message: "Sale added" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding sale" });
  }
};

// REPORT
exports.getReport = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        SUM(total_amount) as revenue
      FROM sales
      GROUP BY DATE(created_at)
      ORDER BY date
    `);

    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.topProducts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.name, SUM(s.quantity) as total_sold
      FROM sales s
      JOIN products p ON s.product_id = p.id
      GROUP BY p.name
      ORDER BY total_sold DESC
      LIMIT 5
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching top products" });
  }
};
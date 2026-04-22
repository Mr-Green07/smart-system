const router = require("express").Router();
const auth = require("../middlewares/authMiddleware");

const {
  addSale,
  getReport,
  topProducts,
} = require("../controllers/salesController");

router.post("/", auth, addSale);
router.get("/report", auth, getReport);
router.get("/top", topProducts);

module.exports = router;
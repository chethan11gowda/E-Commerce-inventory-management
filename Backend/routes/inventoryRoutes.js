const express = require("express");
const router = express.Router();
const {
  addProduct,
  getAllProducts,
  updateProduct,
  getProductById,
  deleteProduct,
  getLowStockProducts
} = require("../controllers/inventoryController");

const upload = require("../middleware/upload");

// 👇 Apply multer middleware to handle file upload
router.post("/", upload.single("image"), addProduct);

router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.put("/:id", upload.single("image"), updateProduct);
router.delete("/:id", deleteProduct);
router.get("/low-stock", getLowStockProducts);

module.exports = router;

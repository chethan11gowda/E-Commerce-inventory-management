//const mongoose = require('mongoose');
const mongoose = require("mongoose");   // ✅ needed for ObjectId validation
const Inventory = require("../models/inventoryModel");

// ------------------ Add new product ------------------
exports.addProduct = async (req, res) => {
  try {
    const { name, quantity, price, description,category } = req.body;

    // 🖼️ Retrieve uploaded file info from multer
    const image = req.file ? req.file.filename : null;

    const newProduct = new Inventory({
      name,
      quantity,
      price,
      description,
      image,
      category, // ✅ Save image filename in DB
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------ Get all products ------------------
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Inventory.find();

    // ✅ Add lowStock flag dynamically (without changing DB schema)
    const updatedProducts = products.map((p) => ({
      ...p._doc,
      lowStock: p.quantity < 10, // 👈 condition for alert
    }));

    res.status(200).json(updatedProducts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------ Get a product by ID ------------------
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if the provided ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const product = await Inventory.findById(id); // Find product by ID

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json(product); // Return the product if found
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ error: err.message });
  }
};

// ------------------ Update product ------------------
exports.updateProduct = async (req, res) => {
  try {
    const { name, quantity, price, description } = req.body;
    const updateFields = { name, quantity, price, description };

    if (req.file) {
      updateFields.image = req.file.filename;
    }

    const updated = await Inventory.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    );

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ------------------ Delete product by ID ------------------
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params; // Get the product ID from the URL params
    const deletedProduct = await Inventory.findByIdAndDelete(id); // Delete product from database
    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found" }); // Product not found in DB
    }
    res.status(200).json({ message: "Product deleted successfully" }); // Success message
  } catch (err) {
    res.status(500).json({ error: err.message }); // Internal Server Error
  }
};

// ------------------ Extra: Low Stock API ------------------
exports.getLowStockProducts = async (req, res) => {
  try {
    const lowStockProducts = await Inventory.find({ quantity: { $lt: 10 } });
    res.status(200).json({
      count: lowStockProducts.length,
      products: lowStockProducts,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

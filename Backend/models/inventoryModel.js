const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  name: { type: String, required: true },         // Product Name
  quantity: { type: Number, required: true },     // Stock Quantity
  price: { type: Number, required: true },        // Product Price
  description: { type: String },                  // Product Description
  image: { type: String },                        // Product Image Filename or URL
  category: { type: String, required: true },     // ✅ New field for Category
}, 
{ timestamps: true } // ✅ Automatically adds createdAt & updatedAt
);

module.exports = mongoose.model("Inventory", inventorySchema);

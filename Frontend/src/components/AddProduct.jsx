// src/pages/AddProduct.jsx
import './AddProduct.css'; // ✅ Import the CSS file
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; // ✅ Import toast

function AddProduct() {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  const [image, setImage] = useState(null);
  const [category, setCategory] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("quantity", quantity);
    formData.append("price", price);
    formData.append("description", description);
    if (image) formData.append("image", image);
    formData.append("category", category);

    axios
      .post("http://localhost:5000/api/inventory", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => {
        toast.success("✅ Product added successfully!", { position: "top-right" });
        navigate("/admin/dashboard/view-products");
      })
      .catch((error) => {
        console.error("Error adding product", error);
        toast.error("❌ Failed to add product!", { position: "top-right" });
      });
  };

  return (
    <div className="add-product-container">
      <div className="form-card">
        <h2>Add Product</h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter product name"
            required
          />

          <label>Quantity:</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Enter quantity"
            required
          />

          <label>Price:</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter price"
            required
          />

          <label>Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description"
          ></textarea>

          <label>Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
<label>Category:</label>
<select onChange={(e) => setCategory(e.target.value)} required>
  <option value="">-- Select Category --</option>
  <option value="Electronics">Electronics</option>
  <option value="Fashion">Fashion</option>
  <option value="Groceries">Groceries</option>
  <option value="Furniture">Furniture</option>
  <option value="Books">Books</option>
  <option value="Beauty">Beauty</option>
  <option value="Sports">Sports</option>
  <option value="Toys">Toys</option>
  <option value="Health">Health</option>
  <option value="Automobile">Automobile</option>
</select>

          <button type="submit">Add Product</button>
        </form>
      </div>
    </div>
  );
}

export default AddProduct;

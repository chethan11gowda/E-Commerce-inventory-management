import './UpdateProduct.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';   // ✅ import toast
import 'react-toastify/dist/ReactToastify.css';

function UpdateProduct() {
  const { id } = useParams();
  const [product, setProduct] = useState({
    name: "",
    quantity: "",
    price: "",
    description: "",
    image: "",
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/inventory/${id}`)
      .then((res) => setProduct(res.data))
      .catch((err) => console.error("Error fetching product", err));
  }, [id]);

  const handleInputChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setSelectedImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("quantity", product.quantity);
    formData.append("price", product.price);
    formData.append("description", product.description);
    if (selectedImage) {
      formData.append("image", selectedImage);
    }

    try {
      await axios.put(`http://localhost:5000/api/inventory/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("✅ Product updated successfully!", { position: "top-right" }); // ✅ show toast
      navigate("/admin/dashboard/view-products");
    } catch (error) {
      console.error("Error updating product", error);
      toast.error("❌ Failed to update product!", { position: "top-right" }); // ✅ error toast
    }
  };

  return (
    <div className="update-product-container">
      <div className="form-card">
        <h2>Update Product</h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleInputChange}
            placeholder="Enter product name"
          />

          <label>Quantity:</label>
          <input
            type="number"
            name="quantity"
            value={product.quantity}
            onChange={handleInputChange}
            placeholder="Enter product quantity"
          />

          <label>Price:</label>
          <input
            type="number"
            name="price"
            value={product.price}
            onChange={handleInputChange}
            placeholder="Enter product price"
          />

          <label>Description:</label>
          <textarea
            name="description"
            value={product.description}
            onChange={handleInputChange}
            placeholder="Enter product description"
          ></textarea>

          <label>Update Image:</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />

          {product.image && (
            <div className="current-image">
              <p>Current Image:</p>
              <img
                src={`http://localhost:5000/uploads/${product.image}`}
                alt="Current"
              />
              
            </div>
          )}

          <button type="submit">Update Product</button>
        </form>
      </div>
    </div>
  );
}

export default UpdateProduct;

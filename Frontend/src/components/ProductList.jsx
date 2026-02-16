import './ProductList.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ProductList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/inventory")
      .then((response) => {
        setProducts(response.data);
      })
      .catch((error) => {
        console.error("Error fetching products", error);
        toast.error("❌ Failed to fetch products!");
      });
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("⚠️ Are you sure you want to delete this product?")) {
      axios
        .delete(`http://localhost:5000/api/inventory/${id}`)
        .then(() => {
          setProducts(products.filter((product) => product._id !== id));
          toast.success("🗑️ Product deleted successfully!", { position: "top-right" });
        })
        .catch((error) => {
          console.error("Error deleting product", error);
          toast.error("❌ Error deleting product!", { position: "top-right" });
        });
    }
  };

  return (
    <div className="product-list-container">
      <h2>Product List</h2>

      <table className="product-list-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr key={product._id} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
              <td>
                {product.image ? (
                  <img
                    src={`http://localhost:5000/uploads/${product.image}`}
                    alt={product.name}
                    className="product-image"
                  />
                ) : (
                  "No Image"
                )}
              </td>
              <td>{product.name}</td>
              <td>{product.quantity}</td>
              <td>{product.price}</td>
              <td>{product.description}</td>
              <td>
                <Link to={`/admin/dashboard/update/${product._id}`} className="action-link update-link">
                  Update
                </Link>
                <span
                  onClick={() => handleDelete(product._id)}
                  className="action-link delete-link"
                  style={{ cursor: "pointer" }}
                >
                  Delete
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProductList;

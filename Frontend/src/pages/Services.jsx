import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Services = ({ cart, setCart }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const token = localStorage.getItem("userToken") || null;
  const navigate = useNavigate();

  useEffect(() => {
    const getProducts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/inventory");
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.products || [];
        setProducts(data);
        setFilteredProducts(data);
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    };
    getProducts();
  }, []);

  // Apply filters
  useEffect(() => {
    let temp = [...products];
    if (selectedCategory) {
      temp = temp.filter((p) => p.category === selectedCategory);
    }
    if (maxPrice) {
      temp = temp.filter((p) => p.price <= parseInt(maxPrice));
    }
    setFilteredProducts(temp);
  }, [selectedCategory, maxPrice, products]);

  const addToCart = async (product) => {
    try {
      if (!token) {
        toast.warn("Please sign in to add items to your cart.", {
          position: "top-right",
        });
        navigate("/signin");
        return;
      }

      let updatedCart = [...cart];
      const existingIndex = updatedCart.findIndex(
        (item) => item._id === product._id
      );

      if (existingIndex >= 0) {
        updatedCart[existingIndex].quantity =
          (updatedCart[existingIndex].quantity || 1) + 1;
      } else {
        updatedCart.push({ ...product, quantity: 1 });
      }

      const itemsToSave = updatedCart.map((item) => ({
        productId: item._id || item.productId || null,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || "",
      }));

      await axios.post(
        "http://localhost:5000/api/cart",
        { items: itemsToSave },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCart(updatedCart);

      toast.success(`${product.name} added to cart!`, {
        position: "top-right",
      });
    } catch (err) {
      console.error("Failed to add to cart:", err);
      toast.error("Failed to add item to cart.", { position: "top-right" });
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Our Products</h2>

      {/* ✅ Filter Bar */}
      <div style={styles.filterBar}>
        <div style={styles.filterItem}>
          <label style={styles.filterLabel}>Category</label>
          <select
            style={styles.select}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All</option>
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
        </div>

        <div style={styles.filterItem}>
          <label style={styles.filterLabel}>Max Price</label>
          <input
            type="number"
            placeholder="e.g. 5000"
            style={styles.input}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p style={styles.loading}>Loading products...</p>
      ) : (
        <div style={styles.grid}>
          {filteredProducts.map((product) => (
            <div key={product._id} style={styles.card} className="product-card">
              {/* ✅ Category Tag */}
              <div style={styles.categoryTag}>{product.category}</div>

              {product.image && (
                <div style={styles.imageContainer}>
                  <img
                    src={`http://localhost:5000/uploads/${product.image}`}
                    alt={product.name}
                    style={styles.image}
                    className="product-img"
                  />
                </div>
              )}
              <h3 style={styles.name}>{product.name}</h3>
              <p style={styles.price}>₹{product.price}</p>
              <p style={styles.desc}>{product.description}</p>
              <button onClick={() => addToCart(product)} style={styles.button}>
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Hover CSS */}
      <style>
        {`
          .product-card {
            position: relative;
            transition: all 0.3s ease-in-out;
          }
          .product-card:hover {
            border: 2px solid #2874f0;
            box-shadow: 0 6px 20px rgba(0,0,0,0.15);
            transform: translateY(-5px);
          }
          .product-img {
            transition: transform 0.3s ease-in-out;
          }
          .product-card:hover .product-img {
            transform: scale(1.08);
          }
        `}
      </style>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "1300px",
    margin: "0 auto",
    padding: "30px 20px",
    backgroundColor: "#f1f3f6",
  },
  title: {
    fontSize: "30px",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: "20px",
    color: "#2874f0",
  },
  loading: {
    textAlign: "center",
    fontSize: "18px",
  },
  filterBar: {
    display: "flex",
    justifyContent: "center",
    gap: "25px",
    marginBottom: "25px",
    padding: "15px",
    backgroundColor: "#fff8e1", // light yellow background
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  filterItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  filterLabel: {
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "5px",
    color: "#333",
  },
  select: {
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #ff9800",
    fontSize: "14px",
    outline: "none",
    backgroundColor: "#fff",
  },
  input: {
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #4caf50",
    fontSize: "14px",
    outline: "none",
    backgroundColor: "#fff",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "25px",
  },
  card: {
    padding: "15px",
    borderRadius: "12px",
    backgroundColor: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    textAlign: "center",
    cursor: "pointer",
    position: "relative",
  },
  categoryTag: {
    position: "absolute",
    top: "12px",
    left: "12px",
    backgroundColor: "#2874f0",
    color: "#fff",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  imageContainer: {
    height: "200px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "12px",
  },
  image: {
    maxWidth: "100%",
    maxHeight: "200px",
    objectFit: "contain",
  },
  name: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "6px",
    color: "#111",
    minHeight: "40px",
  },
  price: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#b12704",
    margin: "5px 0",
  },
  desc: {
    fontSize: "14px",
    color: "#555",
    marginBottom: "12px",
    minHeight: "40px",
  },
  button: {
    padding: "10px 15px",
    backgroundColor: "#fb641b",
    color: "#fff",
    fontWeight: "600",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
};

export default Services;

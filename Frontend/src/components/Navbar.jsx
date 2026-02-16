import './Navbar.css';

import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

const Navbar = ({ cartCount, user: userProp, onLogout }) => {
  const navigate = useNavigate();

  // If parent passes user, use it; otherwise read from localStorage
  const storedUser = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); }
    catch { return null; }
  }, []);

  const [user, setUser] = useState(userProp || storedUser);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setUser(userProp || storedUser);
  }, [userProp, storedUser]);

  const handleLogout = () => {
    // Call parent handler if provided
    if (onLogout) onLogout();
    // Clear browser storage fallback
    localStorage.removeItem('user');
    localStorage.removeItem('userToken');
    setUser(null);
    setOpen(false);
    navigate('/signin');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo */}
       <div className="logo">
  <h5 className="logo-text">StockFlow</h5>
</div>


        {/* Navigation Links (left) */}
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/services">Services</Link>
          <Link to="/contact">Contact</Link>
        

          {/* Cart */}
          <Link to="/cart" className="cart-link">
            🛒 {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </Link>

          {/* Auth area (right) */}
          {!user ? (
            <>
              <Link to="/signup" className="auth-link">Signup</Link>
              <Link to="/signin" className="auth-link">Signin</Link>
            </>
          ) : (
         <div className="user-menu">
  <button
    type="button"
    className={`user-btn ${open ? 'open' : ''}`}
    onClick={() => setOpen(!open)}  
  >
    {user.username || user.name || 'Account'} ▾
  </button>

  {open && (
    <ul className="user-dropdown">
      <li>
        <Link to="/my-orders" onClick={() => setOpen(false)}>My Orders</Link>
      </li>
      <li>
        <button type="button" onClick={handleLogout}>Logout</button>
      </li>
    </ul>
  )}
</div>


          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

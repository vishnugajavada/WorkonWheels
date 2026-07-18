// src/components/NavBar/NavBar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css';

const NavBar = () => {
  return (
    <nav className="navbar">
      <ul>
        <li><Link to="/user/home">Home</Link></li>
        <li><Link to="/user/bookings">Bookings</Link></li>
        <li><Link to="/user/store">Store</Link></li>
        <li><Link to="/user/contact">Contact Us</Link></li>
        <li><Link to="/user/profile">Profile</Link></li>
        <li><Link to="/user/cart">Cart</Link></li>
        <li><Link to="/">Logout</Link></li>
      </ul>
    </nav>
  );
};

export default NavBar;

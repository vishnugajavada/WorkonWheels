// src/components/WorkerDashboard/NavBarWorker.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './NavBarWorker.css';

const NavBarWorker = () => {
  return (
    <nav className="navbar-worker">
      <ul>
        <li><Link to="/workerdashboard">Home</Link></li>
        <li><Link to="/worker/bookings">Booking History</Link></li>
        <li><Link to="/worker/sell">Sell</Link></li>
        <li><Link to="/worker/orders">Orders</Link></li>
        <li><Link to="/worker/profile">Profile</Link></li>
        <li><Link to="/">Logout</Link></li>
      </ul>
    </nav>
  );
};

export default NavBarWorker;

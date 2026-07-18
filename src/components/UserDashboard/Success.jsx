import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Success.css';

const Success = () => {
    const navigate = useNavigate();

  const continueShopping = () => {
    navigate('/user/store');
  };

  return (
    <div className="success-page">
      <h1>Order Placed Successfully!</h1>
      <button onClick={continueShopping}>Continue Shopping</button>
    </div>
  );
};

export default Success;

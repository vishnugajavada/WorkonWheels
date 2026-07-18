// src/components/SiteHeader.jsx
import React from 'react';
import './SiteHeader.css';

const SiteHeader = () => {
  return (
    <header className="site-header">
      <img src="/images/logo.jpeg" alt="WoW - Work on Wheels" className="logo" />
      <h1 className="site-name">WoW - Work on Wheels</h1>
    </header>
  );
};

export default SiteHeader;

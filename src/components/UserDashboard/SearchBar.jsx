// src/components/SearchBar.jsx
import React from 'react';
import style from  './SearchBar.module.css';

const SearchBar = ({ placeholder, value, onChange }) => {
  return (
    <div className={style.searchBar}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default SearchBar;

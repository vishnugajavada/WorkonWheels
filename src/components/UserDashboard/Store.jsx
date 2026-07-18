import React, { useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import { db } from '../../firebaseConfig';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import NavBar from './NavBar';
import SiteHeader from '../SiteHeader';
import './Store.css';
import SearchBar from './SearchBar';

const Store = () => {
  const [products, setProducts] = useState([]);
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    if (!currentUser) {
      console.error('User is not defined');
      return;
    }
    if (!currentUser.location) {
      console.error('User location is not defined');
      return;
    }

    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'products'), where('location', '==', currentUser.location));
        const querySnapshot = await getDocs(q);
        const productList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productList);
        setFilteredProducts(productList);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, [currentUser]);

  const addToCart = async (product) => {
    try {
      await addDoc(collection(db, 'cart'), {
        user_email: currentUser.email,
        product_id: product.id,
        quantity: 1
      });

      alert('Product added to cart');
    } catch (error) {
      console.error('Error adding product to cart:', error);
      alert('Error adding product to cart');
    }
  };

  const handleBooking = async (product) => {
    try {
      await addDoc(collection(db, 'orders'), {
        user_email: currentUser.email,
        seller_email: product.seller_email,
        product_id: product.id,
        status: 'pending',
        timestamp: new Date(),
        quantity: 1,
        address: currentUser.location // Adding user location as address
      });

      alert('Product booked successfully');
    } catch (error) {
      console.error('Error booking product:', error);
      alert('Error booking product');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    const term = e.target.value.toLowerCase();
    const filtered = products.filter(product =>
      product.title.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term) ||
      product.price.toString().includes(term)
    );
    setFilteredProducts(filtered);
  };

  return (
    <div>
      <SiteHeader />
      <NavBar />
      <center>
      <SearchBar 
          placeholder="Search products by name, description, or cost" 
          value={searchTerm}
          onChange={handleSearch}
      /></center>
      <div className="store">
        <div className="product-list">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div key={product.id} className="product-card">
                <img src={product.imageUrl} alt={product.title} className="product-image" />
                <h2 className="product-title">{product.title}</h2>
                <p className="product-description">{product.description}</p>
                <p className="product-price">${product.price}</p>
                <div className="product-buttons">
                  <button className="cart-button" onClick={() => addToCart(product)}>Add to Cart</button>
                  <button className="book-button" onClick={() => handleBooking(product)}>Book</button>
                </div>
              </div>
            ))
          ) : (
            <p>No products found in your location.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Store;

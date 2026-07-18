// src/components/WorkerDashboard/Sell.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import { db, storage } from '../../firebaseConfig';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import NavBarWorker from './NavBarWorker';
import './Sell.css';

const Sell = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [products, setProducts] = useState([]);
  const { currentUser } = useAuth();
  const [isSeller, setIsSeller] = useState(false);
  const [workerLocation, setWorkerLocation] = useState('');

  useEffect(() => {
    const checkIfSeller = async () => {
      const q = query(collection(db, 'workers'), where('email', '==', currentUser.email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const workerData = querySnapshot.docs[0].data();
        if (workerData.roles.includes('seller')) {
          setIsSeller(true);
          setWorkerLocation(workerData.location);  // Store worker's location
        }
      }
    };

    const fetchProducts = async () => {
      const q = query(collection(db, 'products'), where('seller_email', '==', currentUser.email));
      const querySnapshot = await getDocs(q);
      const productList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productList);
    };

    checkIfSeller();
    fetchProducts();
  }, [currentUser.email]);

  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (!title || !description || !price || !image) {
      alert('Please fill all fields and upload an image.');
      return;
    }

    try {
      // Upload image to Firebase Storage
      const imageRef = ref(storage, `products/${image.name}`);
      await uploadBytes(imageRef, image);
      const imageUrl = await getDownloadURL(imageRef);

      // Add product to Firestore
      await addDoc(collection(db, 'products'), {
        seller_email: currentUser.email,
        title,
        description,
        price,
        imageUrl,
        location: workerLocation  // Add location field
      });

      alert('Product added successfully');
      setTitle('');
      setDescription('');
      setPrice('');
      setImage(null);

      // Fetch updated products list
      const updatedProducts = await getDocs(query(collection(db, 'products'), where('seller_email', '==', currentUser.email)));
      const productList = updatedProducts.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productList);
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product');
    }
  };

  return (
    <div>
      <NavBarWorker />
      <div className="sell">
       <center><h1>Sell Items</h1></center>
        {isSeller ? (
          <>
            <form className="sell-form" onSubmit={handleAddProduct}>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" required></textarea>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" required />
              <input type="file" onChange={(e) => setImage(e.target.files[0])} required />
              <button type="submit">Sell</button>
            </form>
            <div className="product-list">
              {products.map((product) => (
                <div key={product.id} className="product-card">
                  <img src={product.imageUrl} alt={product.title} />
                  <h2>{product.title}</h2>
                  <p>{product.description}</p>
                  <p>${product.price}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p>You do not have permission to sell items.</p>
        )}
      </div>
    </div>
  );
};

export default Sell;

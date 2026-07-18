import React, { useEffect, useState } from 'react';
import { useAuth } from '../../AuthContext';
import { db } from '../../firebaseConfig';
import { collection, query, where, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import NavBarWorker from './NavBarWorker';
import style from './Orders.module.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      const q = query(collection(db, 'orders'), where('seller_email', '==', currentUser.email));
      const querySnapshot = await getDocs(q);
      const ordersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch additional user and product details
      const detailedOrders = await Promise.all(ordersList.map(async (order) => {
        const userRef = query(collection(db, 'users'), where('email', '==', order.user_email));
        const userSnap = await getDocs(userRef);
        const userData = userSnap.docs[0]?.data();

        const productRef = doc(db, 'products', order.product_id);
        const productSnap = await getDoc(productRef);
        const productData = productSnap.data();

        return { ...order, user: userData, product: productData };
      }));

      detailedOrders.sort((a, b) => a.status === 'Pending' ? -1 : 1);
      setOrders(detailedOrders);
    };

    fetchOrders();
  }, [currentUser.email]);

  const handleStatusChange = async (orderId, status) => {
    try {
      const docRef = doc(db, 'orders', orderId);
      await updateDoc(docRef, { status });
      alert('Order status updated successfully');

      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status } : order
        )
      );
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating order status');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredOrders = orders.filter(order => 
    (order.user?.username && order.user.username.toLowerCase().includes(searchTerm)) ||
    (order.user?.phone && order.user.phone.includes(searchTerm)) ||
    (order.product?.title && order.product.title.toLowerCase().includes(searchTerm)) ||
    (order.status && order.status.toLowerCase().includes(searchTerm))
  );

  return (
    <div>
      <NavBarWorker />
      <div className={style.orders}>
        <h1>Orders</h1>
        <input 
          type="text" 
          placeholder="Search orders..." 
          value={searchTerm} 
          onChange={handleSearch} 
          className={style.searchBar}
        />
        <div className={style.orderList}>
          {filteredOrders.map((order) => (
            <div key={order.id} className={`${style['orderCard']} ${style[order.status.toLowerCase()]}`}>
              {order.product?.imageUrl && <img src={order.product.imageUrl} alt={order.product.title} className={style.productImage} />}
              <h2>{order.user?.username}</h2>
              <p>Phone: {order.user?.phone}</p>
              <p>Product: {order.product?.title}</p>
              <p>Quantity: {order.quantity}</p>
              <p>Status: {order.status}</p>
              <div className={style.statusButtons}>
                <button onClick={() => handleStatusChange(order.id, 'Approved')} className={style.approved}>Approved</button>
                <button onClick={() => handleStatusChange(order.id, 'Delivered')} className={style.delivered}>Delivered</button>
                <button onClick={() => handleStatusChange(order.id, 'Rejected')} className={style.rejected}>Rejected</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orders;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import { db } from '../../firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import style from './Profile.module.css';
import NavBar from './NavBar';
import SiteHeader from '../SiteHeader';

const Profile = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState({});
  const [orders, setOrders] = useState([]);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;

      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserData(userSnap.data());
      }
    };

    const fetchOrders = async () => {
      if (!currentUser) return;

      const q = query(collection(db, 'orders'), where('user_email', '==', currentUser.email));
      const querySnapshot = await getDocs(q);
      const ordersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const detailedOrders = await Promise.all(ordersList.map(async (order) => {
        const productRef = doc(db, 'products', order.product_id);
        const productSnap = await getDoc(productRef);
        const productData = productSnap.exists() ? productSnap.data() : null;

        return { ...order, product: productData };
      }));

      // Sort orders by timestamp in descending order (latest first)
      detailedOrders.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds);
      setOrders(detailedOrders);
    };

    fetchUserData();
    fetchOrders();
  }, [currentUser]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const user = currentUser;
    const credential = EmailAuthProvider.credential(user.email, currentPassword);

    try {
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setPasswordMessage({ type: 'success', text: 'Password updated successfully' });
      setCurrentPassword('');
      setNewPassword('');
      setShowChangePassword(false);
    } catch (error) {
      console.error('Error updating password:', error);
      let errorMessage = 'Error updating password. Please try again.';
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'The current password is incorrect.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'The new password is too weak. Please choose a stronger password.';
      }
      setPasswordMessage({ type: 'error', text: errorMessage });
    }
  };

  return (
    <div>
      <SiteHeader />
      <NavBar />
      <div className={style.profileContainer}>
        <div className={style.personalDetails}>
          <h2>Personal Details</h2>
          <div className={style.detailsGrid}>
            <div><strong>Username:</strong> {userData.username}</div>
            <div><strong>Email:</strong> {currentUser.email}</div>
            <div><strong>Phone:</strong> {userData.phone}</div>
            <div><strong>Location:</strong> {userData.location}</div>
          </div>
          <button onClick={() => setShowChangePassword(!showChangePassword)}>
            {showChangePassword ? 'Cancel' : 'Change Password'}
          </button>
          {showChangePassword && (
            <form onSubmit={handlePasswordChange} className={`${style.passwordForm} ${style.animateForm}`}>
              <input
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button className={style.submit} type="submit">Update Password</button>
            </form>
          )}
          {passwordMessage.text && (
            <p className={`${style.passwordMessage} ${passwordMessage.type === 'success' ? style.success : style.error}`}>
              {passwordMessage.text}
            </p>
          )}
        </div>

        <div className={style.ordersSection}>
          <h2>My Orders</h2>
          <div className={style.ordersList}>
            {orders.length === 0 ? (
              <p>No orders found</p>
            ) : (
              orders.map((order) => (
                <center key={order.id}>
                  <div className={`${style.orderCard} ${style[order.status.toLowerCase()]}`}>
                    {order.product?.imageUrl && <img src={order.product.imageUrl} alt={order.product.title} className={style.productImage} />}
                    <div className={style.orderDetails}>
                      <h3>{order.product?.title}</h3>
                      <p><strong>Date:</strong> {order.timestamp ? new Date(order.timestamp.seconds * 1000).toLocaleString() : 'N/A'}</p>
                      <p><strong>Status:</strong> {order.status}</p>
                    </div>
                  </div>
                </center>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

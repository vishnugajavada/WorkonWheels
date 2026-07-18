// src/components/WorkerDashboard/WorkerHome.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../AuthContext';
import { db } from '../../firebaseConfig';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import NavBarWorker from './NavBarWorker';
import SearchBar from './SearchBar';
import style from './WorkerHome.module.css';

const WorkerHome = () => {
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchBookings = async () => {
      const q = query(collection(db, 'bookings'), where('worker_email', '==', currentUser.email), where('status', '==', 'pending'));
      const querySnapshot = await getDocs(q);
      const bookingsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const detailedBookings = await Promise.all(bookingsList.map(async (booking) => {
        const userRef = query(collection(db, 'users'), where('email', '==', booking.user_email));
        const userSnap = await getDocs(userRef);
        const userData = userSnap.docs[0]?.data();
        return { ...booking, user: userData };
      }));

      setBookings(detailedBookings);
    };

    fetchBookings();
  }, [currentUser.email]);

  const filteredBookings = bookings.filter(booking => {
    const user = booking.user;
    if (!user) return false; // If user is undefined or null, filter out this booking
  
    const { username, phone, email } = user;
    const { location, role } = booking;
  
    return (
      (username && username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (phone && phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (email && booking.user_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (location && location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (role && role.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const handleStatusChange = async (bookingId, status) => {
    try {
      const docRef = doc(db, 'bookings', bookingId);
      await updateDoc(docRef, { status });
      const updatedBookings = await getDocs(query(collection(db, 'bookings'), where('worker_email', '==', currentUser.email), where('status', '==', 'pending')));
      const bookingsList = updatedBookings.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      


      const detailedBookings = await Promise.all(bookingsList.map(async (booking) => {
        const userRef = query(collection(db, 'users'), where('email', '==', booking.user_email));
        const userSnap = await getDocs(userRef);
        const userData = userSnap.docs[0]?.data();
        return { ...booking, user: userData };
      }));

      setBookings(detailedBookings);
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Error updating booking status');
    }
  };

  return (
    <div>
      <NavBarWorker />
      <div className={style.workerHome}>
       <center> <h1>Current Bookings</h1>
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} /></center>
        <div className={style.bookingList}>
          {filteredBookings.map((booking) => (
            <div key={booking.id} className={style.bookingCard}>
              <h2>{booking.user?.username}</h2>
              <p>Phone: {booking.user?.phone}</p>
              <p>Email: {booking.user_email}</p>
              <p>Location: {booking.location}</p>
              <p>Role: {booking.role}</p>
              <div className={style.statusButtons}>
                <button onClick={() => handleStatusChange(booking.id, 'Executed')} className={style.executed}>Executed</button>
                <button onClick={() => handleStatusChange(booking.id, 'Rejected')} className={style.rejected}>Rejected</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkerHome;

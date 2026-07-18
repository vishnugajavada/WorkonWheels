import React, { useEffect, useState } from 'react';
import { useAuth } from '../../AuthContext';
import { db } from '../../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import NavBarWorker from './NavBarWorker';
import SearchBar from './SearchBar';
import style from './BookingHistory.module.css';

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchBookingHistory = async () => {
      try {
        const q = query(collection(db, 'bookings'), where('worker_email', '==', currentUser.email), where('status', '!=', 'pending'));
        const querySnapshot = await getDocs(q);
        const bookingsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const detailedBookings = await Promise.all(bookingsList.map(async (booking) => {
          const userRef = query(collection(db, 'users'), where('email', '==', booking.user_email));
          const userSnap = await getDocs(userRef);
          const userData = userSnap.docs[0]?.data();
          return { ...booking, user: userData };
        }));

        setBookings(detailedBookings);
      } catch (error) {
        console.error('Error fetching booking history:', error);
      }
    };

    if (currentUser && currentUser.email) {
      fetchBookingHistory();
    }
  }, [currentUser]);

  const filteredBookings = bookings.filter(booking => {
    const user = booking.user;
    if (!user) return false; // Filter out bookings without user data

    // Extracting values safely
    const username = user.username || '';
    const phone = user.phone || '';
    const email = booking.user_email || '';
    const location = booking.location || '';
    const role = booking.role || '';
    const status = booking.status || '';

    // Perform filtering with lowercase comparison
    return (
      username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      status.toLowerCase().includes(searchTerm.toLowerCase()) // Search by status
    );
  });

  return (
    <div>
      <NavBarWorker />
      <div className={style.bookingHistory}>
       <center> <h1>Booking History</h1>
       <div className={style.searchBar}>
        <SearchBar  searchTerm={searchTerm} setSearchTerm={setSearchTerm} /></div></center>
        <div className={style.bookingHistoryList}>
          {filteredBookings.map((booking) => (
            <div key={booking.id} className={`${style['bookingHistoryCard']} ${style[booking.status === 'Executed' ? 'executed' : 'Rejected']}`}>
              <h2>{booking.user?.username}</h2>
              <p>Email: {booking.user_email}</p>
              <p>Role: {booking.role}</p>
              <p>Status: {booking.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookingHistory;

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../AuthContext';
import { db } from '../../firebaseConfig';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import './Bookings.css';
import NavBar from './NavBar';
import SiteHeader from '../SiteHeader';
import SearchBar from './SearchBar';

const UserBookings = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const q = query(collection(db, 'bookings'), where('user_email', '==', currentUser.email));
        const querySnapshot = await getDocs(q);
        const bookingsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBookings(bookingsList);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    };

    if (currentUser) {
      fetchBookings();
    }
  }, [currentUser]);

  const handleRating = async (bookingId, workerEmail, rating) => {
    try {
      // Update rating in the bookings collection
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, { rating });

      // Update rating in the workers collection
      const workerQuery = query(collection(db, 'workers'), where('email', '==', workerEmail));
      const workerSnapshot = await getDocs(workerQuery);
      if (!workerSnapshot.empty) {
        const workerRef = workerSnapshot.docs[0].ref;
        const workerData = workerSnapshot.docs[0].data();
        
        // Ensure rating and ratingCount are numeric
        const currentRating = workerData.rating ? parseFloat(workerData.rating) : 0;
        const currentRatingCount = workerData.ratingCount ? parseInt(workerData.ratingCount, 10) : 0;
        
        const newRating = (currentRating * currentRatingCount + rating) / (currentRatingCount + 1);
        
        await updateDoc(workerRef, { 
          rating: newRating,
          ratingCount: currentRatingCount + 1
        });
      }
      
      // Update local state
      setBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.id === bookingId ? { ...booking, rating } : booking
        )
      );
      
      alert('Rating submitted successfully');
    } catch (error) {
      console.error('Error updating rating:', error);
      alert('Error submitting rating');
    }
  };
  

  return (
    <div>
      <SiteHeader />
      <NavBar />
    
    <div className="bookings">
      
      <center><SearchBar
         placeholder="Search workers by name, phone, role, or status" 
         value={searchTerm}
         onChange={(e) => setSearchTerm(e.target.value)}
      /></center>
      <div className="booking-list">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className={`booking-card ${booking.status}`}
          >
            <h3>Worker: {booking.worker_email}</h3>
            <p>Phone: {booking.worker_phone}</p>
            <p>Email: {booking.worker_email}</p>
            <p>Role: {booking.role}</p>
            <p>Status: {booking.status}</p>
            <p>Booked On: {new Date(booking.timestamp?.seconds * 1000).toLocaleString()}</p>
            {booking.status === 'Executed' && (
              <div className="rating">
                <p>Rate the service:</p>
               <center> {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star ${booking.rating >= star ? 'selected' : ''}`}
                    onClick={() => handleRating(booking.id, booking.worker_email, star)}
                  >
                    ★
                  </span>
                ))}</center>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
    </div>
  );
};

export default UserBookings;

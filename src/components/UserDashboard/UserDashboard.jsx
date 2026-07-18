import React, { useEffect, useState } from 'react';
import { db } from '../../firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc, addDoc } from 'firebase/firestore';
import { useAuth } from '../../AuthContext';
import NavBar from './NavBar';
import SiteHeader from '../SiteHeader';
import SearchBar from './SearchBar';
import './UserDashboard.css';

const UserDashboard = () => {
  const [workers, setWorkers] = useState([]);
  const { currentUser } = useAuth();
  const [userLocation, setUserLocation] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoles, setSelectedRoles] = useState({});

  useEffect(() => {
    const fetchUserLocation = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUserLocation(userDoc.data().location);
          } else {
            console.error('No such user document!');
          }
        } catch (error) {
          console.error('Error fetching user location:', error);
        }
      }
    };

    fetchUserLocation();
  }, [currentUser]);

  useEffect(() => {
    const fetchWorkers = async () => {
      if (userLocation) {
        try {
          const q = query(collection(db, 'workers'), where('location', '==', userLocation));
          const querySnapshot = await getDocs(q);
          const workersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setWorkers(workersList);
        } catch (error) {
          console.error('Error fetching workers:', error);
        }
      }
    };

    fetchWorkers();
  }, [userLocation]);

  const handleBooking = async (worker) => {
    const selectedRole = selectedRoles[worker.id];
    if (!selectedRole) {
      alert('Please select a role before booking.');
      return;
    }

    try {
      const q = query(
        collection(db, 'bookings'),
        where('user_email', '==', currentUser.email),
        where('worker_email', '==', worker.email),
        where('role', '==', selectedRole),
        where('status', '==', 'pending')
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        alert('You have already booked this worker for the selected role.');
        return;
      }

      await addDoc(collection(db, 'bookings'), {
        user_email: currentUser.email,
        worker_email: worker.email,
        role: selectedRole,
        status: 'pending',
        timestamp: new Date()
      });

      alert('Booking confirmed');
    } catch (error) {
      console.error('Error booking worker:', error);
      alert('Error booking worker');
    }
  };

  const filteredWorkers = workers.filter(worker =>
    (worker.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.roles?.some(role => role.toLowerCase().includes(searchTerm.toLowerCase())) ||
    worker.rating?.toString().includes(searchTerm))
  );

  return (
    <div>
      <SiteHeader />
      <NavBar />
      <center><SearchBar 
        placeholder="Search workers by name, phone, role, or rating" 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      /></center>
      <div className="home">
        <h1>Available Workers in Your Location</h1>
        <div className="worker-list">
          {filteredWorkers.map((worker) => (
            <div key={worker.id} className="worker-card">
              <h2>{worker.username}</h2>
              <p>Phone: {worker.phone}</p>
              <p>Email: {worker.email}</p>
              <p>Location: {worker.location}</p>
              <p>Rating: {worker.rating}</p>
              <div className="roles">
                {worker.roles.map((role, index) => (
                  <button
                    key={index}
                    className={`role-button ${selectedRoles[worker.id] === role ? 'selected' : ''}`}
                    onClick={() => setSelectedRoles({ ...selectedRoles, [worker.id]: role })}
                  >
                    {role}
                  </button>
                ))}
              </div>
              <button className="book-button" onClick={() => handleBooking(worker)}>Book</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

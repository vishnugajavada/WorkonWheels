// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import UserSignup from './components/Auth/UserSignup';
import WorkerSignup from './components/Auth/WorkerSignup';
import UserLogin from './components/Auth/UserLogin';
import WorkerLogin from './components/Auth/WorkerLogin';
import UserDashboard from './components/UserDashboard/UserDashboard';
import WorkerHome from './components/WorkerDashboard/WorkerHome';
//import WorkerDetails from './components/UserDashboard/WorkerDetails';
import UserProfile from './components/UserDashboard/UserProfile';
import UserBookings from './components/UserDashboard/UserBookings';
import { AuthProvider } from './AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Store from './components/UserDashboard/Store';
import Cart from './components/UserDashboard/Cart';
import ContactUs from './components/UserDashboard/ContactUs';
import Success from './components/UserDashboard/Success';

// Worker Dashboard imports
import BookingHistory from './components/WorkerDashboard/BookingHistory';
import Sell from './components/WorkerDashboard/Sell';
import Orders from './components/WorkerDashboard/Orders';
import WorkerProfile from './components/WorkerDashboard/WorkerProfile';
//import BookingDetails from './components/WorkerDashboard/BookingDetails';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/usersignup" element={<UserSignup />} />
          <Route path="/workersignup" element={<WorkerSignup />} />
          <Route path="/login" element={<UserLogin />} />
          <Route path="/workerlogin" element={<WorkerLogin />} />
          <Route
            path="/user/home"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/contact"
            element={
              <ProtectedRoute>
                <ContactUs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/success"
            element={
                <Success />
            }
          />
          <Route
            path="/workerdashboard"
            element={
              <ProtectedRoute>
                <WorkerHome />
              </ProtectedRoute>
            }
          />
          <Route
           path="/user/store"
           element={
            <ProtectedRoute>
               <Store />
            </ProtectedRoute>
            }
          />
          <Route
            path="/user/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/bookings"
            element={
              <ProtectedRoute>
                <UserBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/worker/bookings"
            element={
              <ProtectedRoute>
                <BookingHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/worker/sell"
            element={
              <ProtectedRoute>
                <Sell />
              </ProtectedRoute>
            }
          />
          <Route
            path="/worker/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/worker/profile"
            element={
              <ProtectedRoute>
                <WorkerProfile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;

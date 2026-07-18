import React, { useEffect, useState } from 'react';
import { useAuth } from '../../AuthContext';
import { db } from '../../firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import NavBar from './NavBarWorker';
import './WorkerProfile.css';

// Register necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const WorkerProfile = () => {
  const { currentUser } = useAuth();
  const [workerDetails, setWorkerDetails] = useState({});
  const [bookingData, setBookingData] = useState([]);
  const [orderData, setOrderData] = useState([]);
  const [view, setView] = useState('daily'); // 'monthly', 'daily', 'hourly'
  const [chartType, setChartType] = useState('bar'); // 'bar', 'line'
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    const fetchWorkerDetails = async () => {
      try {
        const workerRef = doc(db, 'workers', currentUser.uid);
        const workerSnap = await getDoc(workerRef);
        if (workerSnap.exists()) {
          setWorkerDetails(workerSnap.data());
        }
      } catch (error) {
        console.error("Error fetching worker details:", error);
      }
    };

    const fetchBookingData = async () => {
      try {
        const q = query(collection(db, 'bookings'), where('worker_email', '==', currentUser.email));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => doc.data());
        setBookingData(data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };

    const fetchOrderData = async () => {
      try {
        const q = query(collection(db, 'orders'), where('seller_email', '==', currentUser.email));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => doc.data());
        setOrderData(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchWorkerDetails();
    fetchBookingData();
    fetchOrderData();
  }, [currentUser]);

  const processData = (data, granularity) => {
    const formatDate = (date, granularity) => {
      const d = new Date(date.seconds * 1000);
      if (granularity === 'monthly') {
        return `${d.getFullYear()}-${d.getMonth() + 1}`;
      } else if (granularity === 'daily') {
        return d.toLocaleDateString();
      } else if (granularity === 'hourly') {
        return `${d.toLocaleDateString()} ${d.getHours()}:00`;
      }
    };

    const counts = data.reduce((acc, item) => {
      const date = formatDate(item.timestamp, granularity);
      if (!acc[date]) acc[date] = 0;
      acc[date]++;
      return acc;
    }, {});

    const sortedLabels = Object.keys(counts).sort((a, b) => new Date(a) - new Date(b));
    const sortedData = sortedLabels.map(label => counts[label]);

    return {
      labels: sortedLabels,
      datasets: [{
        label: granularity.charAt(0).toUpperCase() + granularity.slice(1),
        data: sortedData,
        backgroundColor: granularity === 'monthly' ? 'rgba(75,192,192,0.6)' : granularity === 'daily' ? 'rgba(153,102,255,0.6)' : 'rgba(255,159,64,0.6)',
      }],
    };
  };

  const filteredBookingData = bookingData.filter(booking => {
    const date = new Date(booking.timestamp.seconds * 1000);
    return date >= startDate && date <= endDate;
  });

  const filteredOrderData = orderData.filter(order => {
    const date = new Date(order.timestamp.seconds * 1000);
    return date >= startDate && date <= endDate;
  });

  const bookingChartData = processData(filteredBookingData, view);
  const orderChartData = processData(filteredOrderData, view);

  const ChartComponent = chartType === 'bar' ? Bar : Line;

  return (
    <div>
      <NavBar />
      <div className="worker-profile">
        <h1>Profile</h1>
        <div className="personal-details">
          <h2>Personal Details</h2>
          <p><strong>Name:</strong> {workerDetails.name}</p>
          <p><strong>Email:</strong> {workerDetails.email}</p>
          <p><strong>Phone:</strong> {workerDetails.phone}</p>
          <p><strong>Location:</strong> {workerDetails.location}</p>
        </div>
        <div className="charts">
          <h2>Interactions</h2>
          <div className="view-toggle">
            <button onClick={() => setView('monthly')}>Monthly</button>
            <button onClick={() => setView('daily')}>Daily</button>
            <button onClick={() => setView('hourly')}>Hourly</button>
            <select onChange={(e) => setChartType(e.target.value)} value={chartType}>
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
            </select>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
            />
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
            />
          </div>
          <div className="chart-container">
            <h3>Bookings</h3>
            <ChartComponent data={bookingChartData} />
          </div>
          <div className="chart-container">
            <h3>Orders</h3>
            <ChartComponent data={orderChartData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerProfile;

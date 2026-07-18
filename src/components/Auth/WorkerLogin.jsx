import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import styles from './AuthForm.module.css';

const WorkerLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const { email, password } = formData;
  const navigate = useNavigate();

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const q = query(collection(db, 'workers'), where('uid', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.log('No worker found with this uid:', user.uid); // Debug log
        throw new Error('Not a worker');
      }

      alert('Successfully Logged In');
      navigate('/workerdashboard');
    } catch (err) {
      console.error('Invalid Credentials:', err);
      alert('Invalid Credentials');
    }
  };

  return (
    <div class={styles.body}>
    <div className={styles.container}>
      <form onSubmit={onSubmit}>
        <h2>Worker Login</h2>
        <input type="email" name="email" value={email} onChange={onChange} required placeholder="Email" />
        <input type="password" name="password" value={password} onChange={onChange} required placeholder="Password" />
        <button type="submit" className={styles.submitButton}>Login</button>
        <p>New Worker? <a href="/workersignup">Sign Up</a></p>
      </form>
</div>    </div>
  );
};

export default WorkerLogin;

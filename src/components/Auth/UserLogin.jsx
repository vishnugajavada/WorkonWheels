import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebaseConfig';
import styles from './AuthForm.module.css';

const UserLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const { email, password } = formData;
  const navigate = useNavigate();

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Successfully Logged In:', user);
      alert('Successfully Logged In');
      // Navigate to user dashboard
      navigate('/user/home');
    } catch (err) {
      console.error('Invalid Credentials:', err);
      alert('Invalid Credentials');
    }
  };

  return (
    <div class={styles.body}>
    <div className={styles.container}>
      <form onSubmit={onSubmit}>
        <h2>User Login</h2>
        <input
          type="email"
          name="email"
          value={email}
          onChange={onChange}
          required
          placeholder="Email"
          //className={email === '' ? styles.invalid : ''}
        />
        <input
          type="password"
          name="password"
          value={password}
          onChange={onChange}
          required
          placeholder="Password"
          //className={password === '' ? styles.invalid : ''}
        />
        <button type="submit">Login</button>
        <p>New User? <a href="/usersignup">Sign Up</a></p>
      </form>
</div>    </div>
  );
};

export default UserLogin;

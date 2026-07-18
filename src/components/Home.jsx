import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.module.css';
import styles2 from './Auth/AuthForm.module.css';

const Home = () => {
  return (
    <div class={styles2.body}>
    <div className={styles.homeContainer}>
      <div className={styles.roleSelection}>
        <div className={styles.login}>
          <Link to="/login" className={styles.roleButton}>Login as User</Link>
          <Link to="/workerlogin" className={styles.roleButton}>Login as Worker</Link>
        </div>
        <div className={styles.signup}>
          <Link to="/usersignup" className={styles.roleButton}>Sign Up as User</Link>
          <Link to="/workersignup" className={styles.roleButton}>Sign Up as Worker</Link>
        </div>
      </div>
    </div></div>
  );
};

export default Home;

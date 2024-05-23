import React, { useState, useEffect } from 'react';
import'./css/notifications.css';
import './css/nav.css';
import ProfileCard from './ProfileCard'; 
import Navbar from './navbar'
const Profile = () => {   

  const [isDark, setIsDark] = useState(false);
  return (
    <div className='body'>
      <div className='container'>
        <Navbar></Navbar>
        <ProfileCard></ProfileCard>
      </div>
    </div>
  );
};

export default Profile;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import'./css/notifications.css';
import './css/nav.css';
import profileIcon from './images/profile.webp';
import ProfileCard from './ProfileCard'; 
import settingsIcon from './images/settings-icon.png';
import { ThemeSelectorModal } from './ThemeSelectorModal';
const Profile = () => {   

    const navigate = useNavigate();
    const username = localStorage.getItem('user');
    const [clicked, setClicked] = useState(false);
    const [isDark, setIsDark] = useState(false);

 
    const handleSettingsClick = () => {
      setClicked(true);
    };

    
  return (
    <div className='body'>
      <div className='container'style={{ backgroundColor: isDark ? "#859ab9" : "#eff7f9"}}>
      <nav id="sidebar" className={`navsidebar ${isDark === true ? 'dark' : ''}`}>
                    <ul class="dots">
                        <li>
                        <a href="/profile">
                            <span class="glyphicon glyphicon-user"></span>
                        </a>  
                        </li>
                        <li>
                                <div className="tooltip" style={{ fontWeight: 'bold', color: 'white' }}>
                                    {username}
                                </div>
                            </li>
                        <li>
                        <a href="/notifications"> 
                        <span class="glyphicon glyphicon-envelope"><mark class="big swing">!</mark></span>
                        </a>  
                        </li>
                        
                        <li>

                        <a href="/add">
                        <span class="glyphicon glyphicon-list-alt"><mark class="green wobble">+</mark></span>
                        </a>
                        </li>    
                        <li>
                        <a href="/homepage">
                        <span class="glyphicon glyphicon-calendar"></span>
                        </a>
                        </li>   
                        <li>
                          <img src={settingsIcon} alt="settings" className="image" onClick={() => {handleSettingsClick();}}/>
                            
                            
                            {clicked && <ThemeSelectorModal clicked = {clicked} setClicked = {setClicked} isDark = {isDark} setIsDark = {setIsDark}></ThemeSelectorModal>}
                         
                        </li>    
                            
                    </ul> 
                </nav>


                
                        

                        <ProfileCard></ProfileCard>
                        
                    
                   
                
                
                
        </div>
    </div>
  );
};

export default Profile;

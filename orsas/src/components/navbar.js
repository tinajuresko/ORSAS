import { useNavigate } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import React, { useState } from 'react';
import './css/nav.css';

import settingsIcon from './images/settings-icon.png';
import { ThemeSelectorModal } from './ThemeSelectorModal';
import { useThemeContext } from '../context/ThemeContext';

const Navbar = () => {
    const [events, setEvents] = useState([]);
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();
    const username = localStorage.getItem('user');
    const [clicked, setClicked] = useState(false);
    const [isDark, setIsDark] = useState(false);
    

    const handleSettingsClick = () => {
        setClicked(true);
    };
    
    
  
    return (
        <>
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
        </>
        
      );
};
  
  export default Navbar;

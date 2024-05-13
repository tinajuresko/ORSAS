import React, { useState, useEffect } from 'react';

import moment from 'moment';
import'./css/profileCard.css';
import './css/nav.css';
import profileIcon from './images/profile.webp';
import { useNavigate } from 'react-router-dom';
const ProfileCard = () => {   

    const navigate = useNavigate();
    const username = localStorage.getItem('user');
    const [prezime, setPrezime] = useState('');
    const [email, setEmail] = useState('');
    const [organizacija, setOrganizacija] = useState('');
    const handleLogout = () => {
        // Briše token iz lokalne pohrane
        localStorage.removeItem('token');
        // Preusmjerava korisnika na početnu stranicu ili stranicu za prijavu
        navigate('/');
    };

    useEffect(() => {
        const getUserData = async () => {
            try {
                const username = localStorage.getItem('user');
                const token = localStorage.getItem('token');
                console.log(token);
                // Dohvati korisničke podatke putem API poziva
                const response = await fetch(`http://localhost:5000/api/user/${username}`, {
                    method: 'GET',
                    headers: {
                    'Authorization': `Bearer ${token}`
                    },
                });
                const userData = await response.json();

                // Ako su korisnički podaci uspješno dohvaćeni
                if (userData.success) {
                    const orgId = userData.data.orgid;
                    setEmail(userData.data.korisnikemail);
                    setPrezime(userData.data.korisnikprezime);

                    // Dohvati naziv organizacije putem API poziva
                    const orgResponse = await fetch(`http://localhost:5000/api/organization/${orgId}`);
                    const orgData = await orgResponse.json();

                    // Ako je naziv organizacije uspješno dohvaćen
                    if (orgData.success) {
                        const organizationName = orgData.data.name;
                        console.log('Organization Name:', organizationName);
                        setOrganizacija(organizationName);
                    } else {
                        console.error('Failed to fetch organization name:', orgData.error);
                    }
                } else {
                    console.error('Failed to fetch user data:', userData.error);
                }
            }catch (error) {
                console.error('Error fetching user data:', error.message);
            }
            
        };
        getUserData();
    }, []);

    //treba dodat jos edit funkciju
    

  return (
<div class="center">
    <div class="card">
        <div class="additional">
            <div class="user-card">
                <img src={profileIcon} alt="Profile" className="image" width="150px" height="150px" />
            </div>
            <div class="more-info">
                <h1>{username}</h1>
                <button className='edit' >Edit</button>
                <button className='logout' onClick={handleLogout}>Log out</button>
            </div>
        </div>
        <div class="general">
            <div class="coords"><h1>{username}</h1></div>
            <div class="coords">
                <span><b>Organization:</b> {organizacija}</span>
            </div>
            <br></br>
            <div class="coords">
                <div><span><b>Surname:</b> {prezime}</span></div>
                <br></br>
                <div><span><b>Email:</b> {email}</span></div>
            </div>
        </div>
    </div>
</div>
  )
};

export default ProfileCard;

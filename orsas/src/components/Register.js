import { useNavigate } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import React, { useState } from 'react';
import './css/register.css';
import calendarIcon from './images/meeting3.png';
import { Link } from 'react-router-dom'; 

const Login = () => {
    const [korisnikemail, setEmail] = useState('');
    const [korisniksifra, setPass] = useState('');
    const [korisnikime, setUsername] = useState('');
    const [korisnikprezime, setSurname] = useState('');
    const [organization, setOrganization] = useState('');
    const navigate = useNavigate();
    const [error, setError] = useState('');
  
    const handleEmailChange = (e) => {
      setEmail(e.target.value);
    };

    const handleOrganizationChange = (e) => {
        setOrganization(e.target.value);
      };
  
    const handlePassChange = (e) => {
      setPass(e.target.value);
    };

    const handleUsernameChange = (e) => {
      setUsername(e.target.value);
    };

    const handleSurnameChange = (e) => {
        setSurname(e.target.value);
    };
  
    const handleSubmit = async (e) => {
        console.log(korisnikemail);
        console.log(korisnikime);
        console.log(korisnikprezime);
        console.log(korisniksifra);
      e.preventDefault();
      try {
          const response = await fetch('http://localhost:5000/api/register', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ korisnikime, korisnikemail, korisniksifra, korisnikprezime, organization })
          });

          if (response.ok) {
              console.log('User registered successfully');
              navigate('/');
          } else {
              console.log('Registration failed');
              setError('Username already exists');
          }
      } catch (err) {
          console.error('Error during registration:', err.message);
          setError('Error during registration. Please try again');
      }
    };
  
    return (
        <div className='body'>
            <div className="container-register">
                <img src={calendarIcon} alt="Calendar" className="image" />
                <div className="container2">
                    <div className="main">
                        <p className="login" align="center">Sign in</p>
                        <form className="form1" onSubmit={handleSubmit}>
                            <input className="un" type="text" align="center" placeholder="Username" onChange={handleUsernameChange} value={korisnikime} />
                            <input className="su" type="text" align="center" placeholder="Surname" onChange={handleSurnameChange} value={korisnikprezime} />
                            <input className="em" type="text" align="center" placeholder="Email" onChange={handleEmailChange} value={korisnikemail} />
                            <input className="em" type="text" align="center" placeholder="Organization" onChange={handleOrganizationChange} value={organization} />
                            <input className="pass" type="password" align="center" placeholder="Password" onChange={handlePassChange} value={korisniksifra} />
                            {/*<input className="pass2" type="password" align="center" placeholder="Repeat Password" onChange={handlePasswordChange} value={password} />*/}
                            
                            <button type="submit" className="submit" align="center">Sign in</button>
                            <p className="error">{error}</p>
                            <Link to="/">
                            <p className="register" align="center"><a href="#">Already have an account?</a></p>
                            </Link>
                            
                        </form>
                    </div>
                    
                </div>
                
            </div>
        </div>
        
      );
  };
  
  export default Login;

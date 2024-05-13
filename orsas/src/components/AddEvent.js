import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import settingsIcon from './images/settings-icon.png';
import { ThemeSelectorModal } from './ThemeSelectorModal';

import './css/addevent.css';
import './css/nav.css';
 
import { useNavigate } from 'react-router-dom';

const AddEvent = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateofevent, setDateOfEvent] = useState(new Date().toISOString().slice(0, 10));
  const [timeofevent, setTimeOfEvent] = useState('');
  const [people, setPeople] = useState('');
  const [room, setRoom] = useState('');
  const username = localStorage.getItem('user');
  const [clicked, setClicked] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const navigate = useNavigate();
  
  const handleSettingsClick = () => {
    setClicked(true);
  };
  
  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleDatOfEventeChange = (event) => {
    setDateOfEvent(event.toISOString().slice(0, 10));
  };

  const handleTimeOfEventChange = (event) => {
    setTimeOfEvent(event.target.value);
  };
  const handlePeopleChange = (event) =>{
    setPeople(event.target.value);
  }

  const handleRoomChange = (event) => {
    setRoom(event.target.value);
  }

  const handleSubmit = async (event) => {
    
    event.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/event', {
        credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          dateofevent,
          timeofevent,
          room,
          people
        })
      });
      if (response.ok) {
        console.log('Event added successfully');
        
        navigate('/homepage');
      } else {
        console.error('Failed to add event');
        
      }
    } catch (error) {
      console.error('Error adding event:', error.message);
      
    }
    
    setTitle('');
    setDescription('');
    setDateOfEvent(new Date().toISOString().slice(0, 10));
    setTimeOfEvent('');
    setRoom('');
    setPeople('');
   
  };





  return (
    <div className = 'body' style={{ backgroundColor: isDark ? "#859ab9" : "#eff7f9"}}>
      
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
            <span class="glyphicon glyphicon-list-alt"></span>
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



    <div className='content'>
        <div className='main'style={{ backgroundColor: isDark ? "#576390" : "white"}}>
            <h2 className='addEvent' style={{ color: isDark ? "gainsboro" : "#3558d9"}}>Add Event</h2>
            <form onSubmit={handleSubmit}>
                <div>
                <label style={{ color: isDark ? "gainsboro" : "#3558d9"}}>Title:</label>
                <input className='title' type="text" value={title} onChange={handleTitleChange} required style={{ backgroundColor: isDark ? "#859ab9" : ""}}/>
                </div>
                <div>
                <label style={{ color: isDark ? "gainsboro" : "#3558d9"}}>Description:</label>
                <textarea className='description' value={description} onChange={handleDescriptionChange} style={{ backgroundColor: isDark ? "#859ab9" : ""}}/>
                </div>
                <div>
                <label style={{ color: isDark ? "gainsboro" : "#3558d9"}}>Date:</label>
                <DatePicker className='date' selected={dateofevent} onChange={handleDatOfEventeChange} dateFormat="MM/dd/yyyy" required style={{ backgroundColor: isDark ? "#859ab9" : ""}} />
                </div>
                <div>
                <label style={{ color: isDark ? "gainsboro" : "#3558d9"}}>Time:</label>
                <input className='time' type="time" value={timeofevent} onChange={handleTimeOfEventChange} required style={{ backgroundColor: isDark ? "#859ab9" : ""}}/>
                </div>
                <div>
                <label style={{ color: isDark ? "gainsboro" : "#3558d9"}}>Room:</label>
                <input className='room' type="text" value={room} onChange={handleRoomChange} required style={{ backgroundColor: isDark ? "#859ab9" : ""}}/>
                </div>
                <div>
                <label style={{ color: isDark ? "gainsboro" : "#3558d9"}}>Add people:</label>
                <input className={`people ${isDark === true ? 'dark' : ''}`} type="text" value={people} placeholder='Separate with ","' onChange={handlePeopleChange} style={{ backgroundColor: isDark ? "#859ab9" : ""}} />
                </div>

                

                <button className='submit' type="submit">Add Event</button>
            </form>
        </div>


        
      </div>
    </div>
</div>
  );
};

export default AddEvent;

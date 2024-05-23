import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import settingsIcon from './images/settings-icon.png';
import { ThemeSelectorModal } from './ThemeSelectorModal';

import './css/addevent.css';
import './css/nav.css';

import Navbar from './navbar'
 
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
    <div className = 'body' >
      
      <div className='container'>
      <Navbar></Navbar>



    <div className='content'>
        <div className='main'>
            <h2 className='addEvent' >Add Event</h2>
            <form onSubmit={handleSubmit}>
                <div>
                <label >Title:</label>
                <input className='title' type="text" value={title} onChange={handleTitleChange} required />
                </div>
                <div>
                <label >Description:</label>
                <textarea className='description' value={description} onChange={handleDescriptionChange} />
                </div>
                <div>
                <label >Date:</label>
                <DatePicker className='date' selected={dateofevent} onChange={handleDatOfEventeChange} dateFormat="MM/dd/yyyy" required  />
                </div>
                <div>
                <label >Time:</label>
                <input className='time' type="time" value={timeofevent} onChange={handleTimeOfEventChange} required />
                </div>
                <div>
                <label>Room:</label>
                <input className='room' type="text" value={room} onChange={handleRoomChange} required />
                </div>
                <div>
                <label >Add people:</label>
                <input className={`people ${isDark === true ? 'dark' : ''}`} type="text" value={people} placeholder='Separate with ","' onChange={handlePeopleChange}  />
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

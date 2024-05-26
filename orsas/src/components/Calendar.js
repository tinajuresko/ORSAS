import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import './css/calendar.css';
// import './css/eventComponent.css'; 

const localizer = momentLocalizer(moment);

const CalendarComponent = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Fetch events from the backend when the component mounts
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await fetch('http://localhost:5000/api/events', {
        credentials: 'include',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      } else {
        const eventData = await response.json();
        console.log(eventData)
        const formattedEvents = eventData.map(event => ({
          title: event.naslov,
          description: event.opis,
          start: moment(event.datumvrijeme).toDate(),
          end: moment(event.datumvrijeme).add(1, 'hour').toDate()
        }));
        console.log(formattedEvents)
        setEvents(formattedEvents);
      }
    } catch (error) {
      console.error('Error fetching events:', error.message);
    }
  }

  return (
    <div style={{ height: '800px' }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        components={{
          event: EventComponent
        }}
      />
    </div>
  );
};

const EventComponent = ({ event }) => {
  const [showDescription, setShowDescription] = useState(false);

  const handleMouseEnter = () => {
    setShowDescription(true);
  };

  const handleMouseLeave = () => {
    setShowDescription(false);
  };

  return (
    <div 
      className='event-container' 
      onMouseEnter={handleMouseEnter} 
      onMouseLeave={handleMouseLeave}
    >
      <div className='event-title'>
        <strong>{event.title}</strong>
        {showDescription && (
        <div className='event-description'>
          <p>{event.description}</p>
        </div>
      )}
      </div>
      
    </div>
  );
};

export default CalendarComponent;
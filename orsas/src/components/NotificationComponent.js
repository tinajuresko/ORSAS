import React, { useState, useEffect } from 'react';
import moment from 'moment';
import'./css/notifications.css';
import './css/nav.css';
import Navbar from './navbar'

const NotificationComponent = () => {   

    const [notifications, setNotifications] = useState([]);
    const [deletedNotifications, setDeletedNotifications] = useState([]);
    const [startIndex, setStartIndex] = useState(0);

    /*useEffect(() => {
        fetchNotifications(); // Dohvaćanje notifikacija kada se komponenta montira
    }, []);*/

    async function fetchNotifications() { //mislim da je ovo dobro samo trebam serverski dio dodat
        try {
        const token = localStorage.getItem('token');
          const response = await fetch('http://localhost:5000/api/notifications', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            },
          });
          if (response.ok) {
            const data = await response.json();
            setNotifications(data); // Postavljanje dohvaćenih notifikacija u stanje komponente
            console.log(data);
          } else {
            console.error('Failed to fetch notifications');
          }
        } catch (error) {
          console.error('Error fetching notifications:', error.message);
        }
      }

    function handleNextPage() {
      setStartIndex(prevIndex => prevIndex + 4); // Povećanje indeksa početka za 4
    }

    function handlePrevPage() {
        setStartIndex(prevIndex => Math.max(0, prevIndex - 4)); // Smanjivanje indeksa početka za 4, ali minimalno 0
    }
    const handleDelete = async (eventId) => {
      try {
          const token = localStorage.getItem('token');
          const confirmDelete = window.confirm('Jeste li sigurni da želite obrisati ovu notifikaciju?');
  
          if (confirmDelete) {
              const response = await fetch(`http://localhost:5000/api/notifications/${eventId}`, {
                  method: 'DELETE',
                  headers: {
                      'Authorization': `Bearer ${token}`
                  },
              });
  
              if (response.ok) {
                  // Ako je brisanje uspješno, ažurirajte stanje notifikacija
                  const updatedNotifications = notifications.filter(notification => notification.event_id !== eventId);
                  setNotifications(updatedNotifications);
                  setDeletedNotifications([...deletedNotifications, eventId]);
                  console.log('Notification deleted successfully');
              } else {
                  console.error('Failed to delete notification');
              }
          }
      } catch (error) {
          console.error('Error deleting notification:', error.message);
      }
  };
  


  return (
    <div className='body'>
            <div className='container'>
                <Navbar></Navbar>
                <div className="notification-list" >
                    <h2>Notifications</h2>
                    <div className="notification-container">
                      {notifications.slice(startIndex, startIndex + 4).map(notification => (
                      <div className="notification-card" key={notification.event_id}>
                          <div>
                              <h3>{notification.title}</h3>
                              <p>Date: {(moment(notification.dateofevent).format('YYYY-MM-DD')).toString()}</p>
                              <p>Time: {notification.timeofevent}</p>
                          </div>
                          <div><button className="delete-button" onClick={() => handleDelete(notification.event_id)}>Delete</button></div>
                      </div>
                       ))}
                    </div>
                    <div className="pagination">
                <button className='pagination' onClick={handlePrevPage} disabled={startIndex === 0}>Prev</button>
                <button className='pagination' onClick={handleNextPage} disabled={startIndex + 4 >= notifications.length}>Next</button>
            </div>
                </div>     
        </div>
    </div>
  );
};

export default NotificationComponent;

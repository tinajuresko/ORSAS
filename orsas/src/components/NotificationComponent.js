import React, { useState, useEffect } from 'react';
import moment from 'moment';
import './css/notifications.css';
import './css/nav.css';
import Navbar from './navbar';

const NotificationComponent = () => {
    const [notifications, setNotifications] = useState([]);
    const [startIndex, setStartIndex] = useState(0);

    useEffect(() => {
        fetchNotifications(); // Fetch notifications when the component mounts
    }, []);

    async function fetchNotifications() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                return;
            }

            const response = await fetch('http://localhost:5000/api/notifications', {
                credentials: 'include',
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            if (response.ok) {
                const data = await response.json();
                setNotifications(data); // Update the state with fetched notifications
                console.log(data);
            } else {
                console.error('Failed to fetch notifications');
            }
        } catch (error) {
            console.error('Error fetching notifications:', error.message);
        }
    }

    function handleNextPage() {
        setStartIndex(prevIndex => prevIndex + 4); // Increase the start index by 4
    }

    function handlePrevPage() {
        setStartIndex(prevIndex => Math.max(0, prevIndex - 4)); // Decrease the start index by 4, but not below 0
    }

    const handleDelete = async (eventId) => {
      try {
          const token = localStorage.getItem('token');
          const confirmDelete = window.confirm('Jeste li sigurni da želite obrisati ovu notifikaciju?');
  
          if (confirmDelete) {
              const response = await fetch(`http://localhost:5000/api/notifications/${eventId}`, {
                  credentials: 'include',
                  method: 'DELETE',
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                  },
              });
  
              if (response.ok) {
                  // If deletion is successful, update the state  
                  const updatedNotifications = notifications.filter(notification => notification.obavijestid !== eventId);
                  setNotifications(updatedNotifications);
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
                <Navbar />
                <div className="notification-list">
                    <h2>Notifications</h2>
                    <div className="notification-container">
                        {notifications.length === 0 ? (
                            <p>No notifications to display</p>
                        ) : (
                            notifications.slice(startIndex, startIndex + 4).map(notification => (
                                <div className="notification-card" key={notification.obavijestid}>
                                    <div>
                                        <h3>{notification.naslov}</h3>
                                        <p>Date: {moment(notification.dateofevent).format('YYYY-MM-DD')}</p>
                                        <p>Time: {notification.timeofevent}</p>
                                    </div>
                                    <div>
                                        <button className="delete-button" onClick={() => handleDelete(notification.obavijestid)}>Delete</button>
                                    </div>
                                </div>
                            ))
                        )}
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
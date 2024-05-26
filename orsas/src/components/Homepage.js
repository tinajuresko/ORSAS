import React from 'react';
import moment from 'moment';
import { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import CalendarComponent from './Calendar';
import Navbar from './navbar'

import './css/homepage.css';
import './css/nav.css';


const Homepage = () => {
    const [events, setEvents] = useState([]);
    
    
    /*useEffect(() => {
        const fetchEvents = async () => {
            try {
                const token = localStorage.getItem('token');
                const requestOptions = {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}` // Dodavanje tokena u zaglavlje
                    }
                };
    
                const response = await fetch('http://localhost:5000/api/events', requestOptions);
            
                if (response.ok) { 
                    const data = await response.json(); //u data ce biti podaci sa servera slicno ovom mom kodu
                    // Pretvori podatke u format događaja
                    //console.log(data);
                    const formattedEvents = data.map(event => {
                        //console.log('Date:', event.dateofevent);
                        //console.log('Time:', event.timeofevent);
                        const dateString = moment(event.dateofevent).format('YYYY-MM-DD');
                        const datetimeString = dateString + 'T' + event.timeofevent;
                        //console.log('DateTime String:', datetimeString);
                        const startDateTime = moment(datetimeString);
                        const endDateTime = startDateTime.clone().add(1, 'hour');
                        //console.log('Start DateTime:', startDateTime);
                        //console.log('End DateTime:', endDateTime);
                        return {
                            title: event.title,
                            start: startDateTime.toDate(),
                            end: endDateTime.toDate(),
                            description: event.description
                        };
                    });
                    
                    setEvents(formattedEvents);
                    checkNotificationSettings(data);
                } else {
                    console.error('Failed to fetch events');
                }
            } catch (error) {
                console.error('Error fetching events:', error.message);
            }
        };

        fetchEvents();
        //showNotification();
    }, []);*/

   

   
    const checkNotificationSettings = async (events) => { //za te evente u kalendaru na serveru kreiramo obavijesti samo su drugi atributi
        const eventIds = events.map(event => event.event_id);
        console.log(eventIds);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/notificationsettings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(eventIds)
            });
    
            if (response.ok) {
                const notificationSettings = await response.json();
                /*console.log("notificationSettings:")
                console.log(notificationSettings);*/
                // Ovdje možete dodati logiku za prikazivanje notifikacija prema postavkama

                notificationSettings.forEach(setting => {
                    const { event_id, repeatcount, notificationinterval, dateofevent, timeofevent, title } = setting;
                    //console.log("setting: ", setting.repeatcount);
                    // Provjeri je li repeatCount i notificationInterval definirani
                    if (repeatcount !== null && notificationinterval !== null) {
                        // Pretvori notificationInterval u milisekunde (1 minuta = 60000 ms)
                        const intervalInMs = notificationinterval * 60000;
                
                        // Dohvati trenutno vrijeme
                        const currentTime = new Date().getTime();
                        console.log("current time:", currentTime);
                
                        const dateString = moment(dateofevent).format('YYYY-MM-DD');
                        const datetimeString = dateString + 'T' + timeofevent;
                        console.log("new date time: ", datetimeString);
                        console.log("date time:", dateofevent);
                        console.log("time time:", timeofevent);
                        const dateTimeString = `${datetimeString.substring(0, 10)} ${timeofevent}`;
                        const eventDateTime = moment(dateTimeString);
                        console.log("eventdatetimemoment: ", eventDateTime);
                        const eventTime = eventDateTime.isValid() ? eventDateTime.valueOf() : NaN;


                        console.log("event time: ", eventTime);
                
                        // Izračunaj razliku između trenutnog vremena i vremena događaja
                        const timeDiff = eventTime - currentTime;

                        console.log("timediff: ", timeDiff);
                
                        // Izračunaj broj notifikacija koje treba poslati
                        const numNotifications = Math.ceil(timeDiff / intervalInMs);
                
                        // Provjeri je li događaj u budućnosti
                        if (timeDiff > 0) {
                            // Iteriraj kroz broj notifikacija i stvori ih
                            //console.log("timediff > 0");
                            //console.log("repeatcount: ", repeatcount);
                            for (let i = 1; i <= repeatcount; i++) {
                                let notificationTime = eventTime - Math.ceil(intervalInMs / i);
                                console.log("notificationTime: ", notificationTime);
                                let notificationDate = new Date(notificationTime);
                                console.log('Notification should be sent at:', notificationDate);
                
                                const currentTime = new Date().getTime();
                                if (currentTime < notificationTime && currentTime < eventTime) {
                                    const timeDiff = notificationTime - currentTime;
                                
                                    // Postavite setTimeout za prikazivanje notifikacije nakon određenog vremena
                                    setTimeout(() => {
                                        const notificationOptions = {
                                            body: `Notification for ${title}`
                                        };
                                
                                        if (!("Notification" in window)) {
                                            console.error("This browser does not support desktop notification");
                                        } else if (Notification.permission === "granted") {
                                            new Notification('Event Notification', notificationOptions);
                                        } else if (Notification.permission !== "denied") {
                                            // Ako dozvola još nije zatražena, zatražite je
                                            Notification.requestPermission().then(function (permission) {
                                                if (permission === "granted") {
                                                    // Ako je korisnik odobrio, stvori notifikaciju
                                                    new Notification('Event Notification', notificationOptions);
                                                }
                                            });
                                        }
                                    }, timeDiff);
                                }

                                   
                                    
                                
                            }
                        }
                    }
                });
            } else {
                console.error('Failed to fetch notification settings');
            }
        } catch (error) {
            console.error('Error fetching notification settings:', error.message);
        }
    };

    return (
        <div className='body'>
            <div className='container'>
                <Navbar></Navbar>
                
                <div className='calendar-container'>
                    <CalendarComponent events={events} />
                </div>
            </div>
        </div>
    );
};

export default Homepage;

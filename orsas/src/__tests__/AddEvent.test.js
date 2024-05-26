import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import AddEvent from '../components/AddEvent'; 
import { BrowserRouter as Router } from 'react-router-dom';

Storage.prototype.getItem = jest.fn(() => 'mockedToken');

describe('AddEvent component', () => {
  test('renders AddEvent component', () => {
    render(<Router><AddEvent /></Router>);
    expect(document.querySelector('.addEvent')).toBeInTheDocument();
  });

  test('submits form with correct data', async () => {
    const mockedFetch = jest.fn(() => Promise.resolve({ ok: true }));
    global.fetch = mockedFetch;

    const { getByLabelText, getByText } = render(<Router><AddEvent /></Router>);

    // Fill in form fields
    fireEvent.change(getByLabelText('Title:'), { target: { value: 'Test Event' } });
    fireEvent.change(getByLabelText('Description:'), { target: { value: 'Test Description' } });
    fireEvent.change(getByLabelText('Time:'), { target: { value: '12:00' } });
    fireEvent.change(getByLabelText('Room:'), { target: { value: 'Test Room' } });
    fireEvent.change(getByLabelText('Add people:'), { target: { value: 'Person 1, Person 2' } });

    fireEvent.submit(getByText('Add Event'));

    await waitFor(() => {
      expect(mockedFetch).toHaveBeenCalledTimes(1);
      expect(mockedFetch).toHaveBeenCalledWith('http://localhost:5000/api/event', {
        credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mockedToken' 
        },
        body: JSON.stringify({
          title: 'Test Event',
          description: 'Test Description',
          dateofevent: expect.any(String), 
          timeofevent: '12:00',
          room: 'Test Room',
          people: 'Person 1, Person 2'
        })
      });
    });
  });
});

import React from 'react';
import { render, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import CalendarComponent from '../components/CalendarComponent';

const mockToken = 'fake-token';
const mockEventData = [
  { naslov: 'Event 1', opis: 'Description 1', datumvrijeme: '2024-05-26T10:00:00' },
  { naslov: 'Event 2', opis: 'Description 2', datumvrijeme: '2024-05-27T12:00:00' }
];
global.localStorage.getItem = jest.fn(() => mockToken);

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockEventData)
  })
);

describe('CalendarComponent', () => {
  test('renders events with descriptions', async () => {
    await act(async () => {
      const { getByText } = render(<CalendarComponent />);
      await waitFor(() => {
        expect(getByText('Event 1')).toBeInTheDocument();
        expect(getByText('Description 1')).toBeInTheDocument();
        expect(getByText('Event 2')).toBeInTheDocument();
        expect(getByText('Description 2')).toBeInTheDocument();
      });
    });
  });

  test('handles error when fetching events', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('Failed to fetch events')));

    await act(async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      render(<CalendarComponent />);
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching events:', 'Failed to fetch events');
      });
      consoleErrorSpy.mockRestore();
    });
  });
});

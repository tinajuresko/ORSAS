import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ProfileCard from '../components/ProfileCard';
import { useNavigate } from 'react-router-dom';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('ProfileCard Component', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    useNavigate.mockReturnValue(mockNavigate);
    localStorage.setItem('user', 'testuser');
    localStorage.setItem('token', 'fake-token');
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('renders user information and logout button', async () => {
    const mockFetch = jest.fn((url) => {
      if (url.includes('/api/user/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: {
              orgid: 'org123',
              korisnikemail: 'testuser@example.com',
              korisnikprezime: 'Test',
            }
          })
        });
      } else if (url.includes('/api/organization/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: {
              name: 'Test Organization'
            }
          })
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
    global.fetch = mockFetch;

    const { getByText, getByAltText, queryByText } = render(<ProfileCard />);

    await waitFor(() => {
      expect(getByText('testuser', { exact: false })).toBeInTheDocument();
      expect(getByText('Test')).toBeInTheDocument();
      expect(getByText('testuser@example.com')).toBeInTheDocument();
      expect(getByText('Test Organization')).toBeInTheDocument();
    });

    expect(getByAltText('Profile')).toBeInTheDocument();
    expect(getByText('Log out')).toBeInTheDocument();
    expect(queryByText('Edit')).toBeInTheDocument();
  });

  test('handles logout button click', () => {
    const { getByText } = render(<ProfileCard />);
    fireEvent.click(getByText('Log out'));
    expect(localStorage.getItem('token')).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('toggles edit mode and updates user information', async () => {
    const mockFetch = jest.fn((url) => {
      if (url.includes('/api/user/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: {
              orgid: 'org123',
              korisnikemail: 'testuser@example.com',
              korisnikprezime: 'Test',
            }
          })
        });
      } else if (url.includes('/api/organization/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: {
              name: 'Test Organization'
            }
          })
        });
      } else if (url.includes('/api/edit')) {
        return Promise.resolve({ ok: true });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
    global.fetch = mockFetch;

    const { getByText, getByDisplayValue } = render(<ProfileCard />);

    await waitFor(() => {
      expect(getByText('testuser', { exact: false })).toBeInTheDocument();
    });

    fireEvent.click(getByText('Edit'));

    const organizationInput = getByDisplayValue('Test Organization');
    const surnameInput = getByDisplayValue('Test');
    const emailInput = getByDisplayValue('testuser@example.com');

    fireEvent.change(organizationInput, { target: { value: 'New Organization' } });
    fireEvent.change(surnameInput, { target: { value: 'NewSurname' } });
    fireEvent.change(emailInput, { target: { value: 'newemail@example.com' } });

    fireEvent.click(getByText('Finish Editing'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:5000/api/edit', expect.any(Object));
      expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });
  });

  test('handles API errors gracefully', async () => {
    const mockFetch = jest.fn(() => Promise.reject(new Error('API Error')));
    global.fetch = mockFetch;

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<ProfileCard />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching user data:', 'API Error');
    });

    consoleErrorSpy.mockRestore();
  });
});

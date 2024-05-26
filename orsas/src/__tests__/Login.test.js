import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { useNavigate } from 'react-router-dom';
import Login from '../components/Login';

// Mock the useNavigate hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('Login Component', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    useNavigate.mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form', () => {
    render(<Login />);
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByText('Log in')).toBeInTheDocument();
  });

  test('updates username and password on change', () => {
    render(<Login />);

    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(usernameInput.value).toBe('testuser');
    expect(passwordInput.value).toBe('password123');
  });

  test('handles successful login', async () => {
    const mockFetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ token: 'fake-token' }),
      })
    );
    global.fetch = mockFetch;

    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });

    fireEvent.click(screen.getByText('Log in'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:5000/api/login', expect.any(Object));
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'fake-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('user', 'testuser');
      expect(mockNavigate).toHaveBeenCalledWith('/homepage');
    });
  });

  test('handles login error', async () => {
    const mockFetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
      })
    );
    global.fetch = mockFetch;

    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'wronguser' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'wrongpassword' } });

    fireEvent.click(screen.getByText('Log in'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:5000/api/login', expect.any(Object));
      expect(screen.getByText('Invalid username or password')).toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('handles network error', async () => {
    const mockFetch = jest.fn(() => Promise.reject(new Error('Network Error')));
    global.fetch = mockFetch;

    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });

    fireEvent.click(screen.getByText('Log in'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:5000/api/login', expect.any(Object));
      expect(screen.getByText('Error during login. Please try again.')).toBeInTheDocument();
    });
  });
});

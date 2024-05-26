import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Login from '../components/Register';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
  }));
  
  jest.setTimeout(5000);

describe('Register component', () => {
  test('renders register form with inputs and submit button', () => {
    const { getByPlaceholderText, getByText } = render(
      <Router>
        <Login />
      </Router>
    );

    const usernameInput = getByPlaceholderText('Username');
    const surnameInput = getByPlaceholderText('Surname');
    const emailInput = getByPlaceholderText('Email');
    const organizationInput = getByPlaceholderText('Organization');
    const passwordInput = getByPlaceholderText('Password');
    const submitButton = getByText('Sign in');

    expect(usernameInput).toBeInTheDocument();
    expect(surnameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(organizationInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });

  test('submits form data when submit button is clicked', async () => {
    const { getByPlaceholderText, getByText } = render(
      <Router>
        <Login />
      </Router>
    );

    const usernameInput = getByPlaceholderText('Username');
    const surnameInput = getByPlaceholderText('Surname');
    const emailInput = getByPlaceholderText('Email');
    const organizationInput = getByPlaceholderText('Organization');
    const passwordInput = getByPlaceholderText('Password');
    const submitButton = getByText('Sign in');

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(surnameInput, { target: { value: 'testsurname' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(organizationInput, { target: { value: 'testorg' } });
    fireEvent.change(passwordInput, { target: { value: 'Testpassword1' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
    });
  });
});

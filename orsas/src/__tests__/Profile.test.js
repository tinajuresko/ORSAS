import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Profile from '../components/Profile';
// import Navbar from '../components/navbar';
// import ProfileCard from '../components/ProfileCard';

// Mock the imported components
jest.mock('./navbar', () => () => <div>Mocked Navbar</div>);
jest.mock('./ProfileCard', () => () => <div>Mocked ProfileCard</div>);

describe('Profile Component', () => {
  test('renders Navbar and ProfileCard', () => {
    const { getByText } = render(<Profile />);
    expect(getByText('Mocked Navbar')).toBeInTheDocument();
    expect(getByText('Mocked ProfileCard')).toBeInTheDocument();
  });
});


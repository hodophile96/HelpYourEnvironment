import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Feed from './Feed'; // Import your Feed component

test('Feed component renders correctly', () => {
  // Render the Feed component
  const { getByText, getByTestId } = render(<Feed />);

  // Test that the "Help Your Environment" text is present
  const headerText = getByText('Help Your Environment');
  expect(headerText).toBeTruthy();

  // Test that the "Create Event" button is present
  const createEventButton = getByText('Create Event');
  expect(createEventButton).toBeTruthy();

  // You can write more test cases to check other elements or interactions
});

test('Toggle sorting order', () => {
  // Render the Feed component
  const { getByText, getByTestId } = render(<Feed />);

  // Find the "Sort Ascending" button and click it
  const sortButton = getByText('Sort Ascending');
  fireEvent.press(sortButton);

  // Check if the sorting order has changed
  const descendingSortButton = getByText('Sort Descending');
  expect(descendingSortButton).toBeTruthy();
});

test('Navigate to profile screen', () => {
  // Mock the navigation object
  const mockNavigation = {
    navigate: jest.fn(),
  };

  // Render the Feed component with the mock navigation
  const { getByText } = render(<Feed navigation={mockNavigation} />);

  // Find the "User" icon and click it
  const userIcon = getByText('user');
  fireEvent.press(userIcon);

  // Check if the navigate function was called with the correct screen name
  expect(mockNavigation.navigate).toHaveBeenCalledWith('Profile');
});

test('Join an event', async () => {
  // Mock the Firebase auth object
  const mockAuth = {
    currentUser: {
      uid: 'cK9eZOsa7VamJLf0FosfeDOuXvq2',
    },
  };

  // Mock the Firebase updateDoc function
  const mockUpdateDoc = jest.fn();

  // Mock the navigation object
  const mockNavigation = {
    navigate: jest.fn(),
  };

  // Render the Feed component with mock objects
  const { getByText } = render(
    <Feed navigation={mockNavigation} />,
    {
      context: { auth: mockAuth, updateDoc: mockUpdateDoc },
    }
  );

  // Find an event card and click the "Join" button
  const joinButton = getByText('Join (0)'); // Replace with the appropriate text
  fireEvent.press(joinButton);

  // Check if the updateDoc function was called with the correct arguments
  expect(mockUpdateDoc).toHaveBeenCalledWith(
    '0IWfSbAJANhxF4UfHcTc', // Replace with the correct event ID
    {
      join: ['cK9eZOsa7VamJLf0FosfeDOuXvq2'],
    }
  );

  // Check if the events are refreshed
  expect(mockNavigation.navigate).toHaveBeenCalledWith('Feed');
});

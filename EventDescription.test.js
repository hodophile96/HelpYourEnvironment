import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import EventDescription from './EventDescription'; // Update the import path

describe('EventDescription Component', () => {
  it('renders correctly', () => {
    const { getByText } = render(<EventDescription />);
    
    // Replace the text below with the text that should be present in your rendered component
    expect(getByText('Create Event')).toBeTruthy();
    expect(getByText('Event Type:')).toBeTruthy();
  });

  it('handles event type selection', () => {
    const { getByText, getByTestId } = render(<EventDescription />);
    const eventTypePicker = getByTestId('event-type-picker');

    fireEvent(eventTypePicker, 'onValueChange', 'Litter Picking');

    // Verify that the selected event type is displayed
    expect(getByText('Litter Picking')).toBeTruthy();
  });

  it('handles date selection', () => {
    const { getByText, getByTestId } = render(<EventDescription />);
    const dateText = getByTestId('date-text');

    fireEvent.press(dateText);

    // You may simulate date selection here and verify that the selected date is displayed
  });

  it('handles time selection', () => {
    const { getByText, getByTestId } = render(<EventDescription />);
    const timeText = getByTestId('time-text');

    fireEvent.press(timeText);

    // You may simulate time selection here and verify that the selected time is displayed
  });

  it('handles event creation', () => {
    const { getByText } = render(<EventDescription />);
    const createEventButton = getByText('Create');

    fireEvent.press(createEventButton);

    // Verify that your component responds correctly to the create event action
  });

  // Add more test cases for other interactions and functionalities
});

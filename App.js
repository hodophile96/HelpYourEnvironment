import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SignIn from './SignIn';
import Feed from './Feed';
import EventDescription from './EventDescription';
import Profile from './Profile';
import SignUp from './SignUp';
import ContactListScreen from './ContactListScreen';
import ChatScreen from './ChatScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SignIn">
        <Stack.Screen
          name="SignIn"
          component={SignIn}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUp}
          options={{
            title: 'Sign Up',
          }}
        />
        <Stack.Screen
          name="Feed"
          component={Feed}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="EventDescription"
          component={EventDescription}
          options={{
            title: 'Create Event',
            headerLeft: null,
          }}
        />
        <Stack.Screen
          name="Profile"
          component={Profile}
          options={{
            title: 'Profile',
          }}
        />
        {/* Add the ContactListScreen and ChatScreen components to the navigator */}
        <Stack.Screen
          name="ContactListScreen"
          component={ContactListScreen}
          options={{
            title: 'Contacts',
          }}
        />
        <Stack.Screen
          name="ChatScreen"
          component={ChatScreen}
          options={({ route }) => ({
            title: route.params.selectedUser.displayName, // Set the chat user's name as the title
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

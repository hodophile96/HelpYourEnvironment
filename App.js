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
import JoinedEvents from './JoinedEvents';
import GroupScreen from './GroupScreen';
import GroupChat from './GroupChat';
import CreateGroupScreen from './CreateGroupScreen';
import LocationSearch from './LocationSearch'; // Import the LocationScreen component

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
            title: route.params.selectedUser.displayName,
          })}
        />
        <Stack.Screen
          name="JoinedEvents"
          component={JoinedEvents}
          options={{
            title: 'Joined Events',
          }}
        />
        <Stack.Screen
          name="Groups"
          component={GroupScreen}
          options={{
            title: 'Groups',
          }}
        />
        <Stack.Screen
          name="CreateGroup"
          component={CreateGroupScreen}
          options={{
            title: 'Create Group',
          }}
        />
        <Stack.Screen
          name="GroupChat"
          component={GroupChat}
          options={({ route }) => ({
            title: 'Group Chat',
          })}
        />
        {/* Add the LocationScreen to the navigator */}
        <Stack.Screen
          name="LocationSearch"
          component={LocationSearch}
          options={{
            title: 'Location Search',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

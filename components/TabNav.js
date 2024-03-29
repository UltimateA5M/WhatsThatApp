import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ChatsScreen from './ChatsScreen';
import ProfileScreen from './ProfileScreen';
import SearchScreen from './SearchScreen';
import ContactsScreen from './ContactsScreen';
import NewChatScreen from './NewChatScreen';
import ViewChatScreen from './ViewChatScreen';
import BlockedContactsScreen from './BlockedContactsScreen';
import CameraScreen from './CameraScreen';
import ChatOptions from './ChatOptions';
import MessageOptions from './MessageOptions';
import AddUserToChat from './AddUserToChat';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

export default function TabNav() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#f4511e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
      initialRouteName="Profile"
    >
      <Tab.Screen name="Chats" component={ChatScreenStack} options={{ title: 'Chats' }} />
      <Tab.Screen name="Profile" component={ProfileScreenStack} options={{ title: 'Profile' }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{ title: 'Search' }} />
      <Tab.Screen name="Contacts" component={ContactScreenStack} options={{ title: 'Contacts' }} />
    </Tab.Navigator>
  );
}

export function ChatScreenStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Home"
    >
      <Stack.Screen name="Chats" component={ChatsScreen} options={{ title: 'Chats' }} />
      <Stack.Screen name="NewChatScreen" component={NewChatScreen} options={{ title: 'NewChatScreen' }} />
      <Stack.Screen name="ViewChatScreen" component={ViewChatScreen} options={{ title: 'ViewChatScreen' }} />
      <Stack.Screen name="ChatOptions" component={ChatOptions} options={{ title: 'ChatOptions' }} />
      <Stack.Screen name="MessageOptions" component={MessageOptions} options={{ title: 'MessageOptions' }} />
      <Stack.Screen name="AddUserToChat" component={AddUserToChat} options={{ title: 'AddUserToChat' }} />
    </Stack.Navigator>
  );
}

export function ContactScreenStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Contacts"
    >
      <Stack.Screen name="Contacts" component={ContactsScreen} options={{ title: 'Contacts' }} />
      <Stack.Screen name="BlockedContacts" component={BlockedContactsScreen} options={{ title: 'BlockedContactsScreen' }} />
    </Stack.Navigator>
  );
}

export function ProfileScreenStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Profile"
    >
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
      <Stack.Screen name="CameraScreen" component={CameraScreen} options={{ title: 'CameraScreen' }} />
    </Stack.Navigator>
  );
}

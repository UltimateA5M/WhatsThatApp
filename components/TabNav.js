import * as React from 'react';
import { Button, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './HomeScreen'
import ProfileScreen from './ProfileScreen'
import SearchScreen from './SearchScreen'
import ContactsScreen from './ContactsScreen'

const Tab = createBottomTabNavigator();

export default function TabNav() {
  return (
  <Tab.Navigator screenOptions={{
    headerStyle: {
      backgroundColor: '#f4511e', 
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
  }}
  initialRouteName="Profile">
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "Home" }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "Profile" }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{ title: "Search" }} />
      <Tab.Screen name="Contacts" component={ContactsScreen} options={{ title: "Contacts" }} />
  </Tab.Navigator>
  );
}
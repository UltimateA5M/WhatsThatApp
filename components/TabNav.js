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
  <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Contacts" component={ContactsScreen} />
  </Tab.Navigator>
  );
}
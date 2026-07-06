import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { EventDetailScreen } from '../screens/community/EventDetailScreen';
import { EventsScreen } from '../screens/community/EventsScreen';
import { EditProfileScreen } from '../screens/community/EditProfileScreen';
import { FoundationsScreen } from '../screens/community/FoundationsScreen';
import { HomeScreen } from '../screens/community/HomeScreen';
import { ProfileScreen } from '../screens/community/ProfileScreen';
import { ReadingDetailScreen } from '../screens/community/ReadingDetailScreen';
import { colors } from '../theme';
import { CommunityStackParamList, CommunityTabParamList } from './types';

const CommunityStack = createNativeStackNavigator<CommunityStackParamList>();
const CommunityTabs = createBottomTabNavigator<CommunityTabParamList>();

function CommunityTabsNavigator() {
  return (
    <CommunityTabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.onPrimary,
        tabBarStyle: {
          backgroundColor: '#082717',
          borderTopWidth: 0,
          minHeight: 72,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 11,
        },
        tabBarIcon: ({ color, size }) => (
          <Ionicons color={color} name={iconForRoute(route.name)} size={size} />
        ),
      })}
    >
      <CommunityTabs.Screen component={HomeScreen} name="Home" />
      <CommunityTabs.Screen component={EventsScreen} name="Events" />
      <CommunityTabs.Screen component={FoundationsScreen} name="Foundations" />
      <CommunityTabs.Screen component={ProfileScreen} name="Profile" />
    </CommunityTabs.Navigator>
  );
}

export function CommunityNavigator() {
  return (
    <CommunityStack.Navigator screenOptions={{ headerShown: false }}>
      <CommunityStack.Screen component={CommunityTabsNavigator} name="CommunityTabs" />
      <CommunityStack.Screen component={EventDetailScreen} name="EventDetail" />
      <CommunityStack.Screen component={ReadingDetailScreen} name="ReadingDetail" />
      <CommunityStack.Screen component={EditProfileScreen} name="EditProfile" />
    </CommunityStack.Navigator>
  );
}

function iconForRoute(routeName: keyof CommunityTabParamList) {
  switch (routeName) {
    case 'Events':
      return 'calendar-outline';
    case 'Foundations':
      return 'book-outline';
    case 'Profile':
      return 'person-circle-outline';
    default:
      return 'home-outline';
  }
}

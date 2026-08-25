import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomNavigation from './BottomNavigation';
import Settings from '../screens/home/Settings';
import WeeklyStreakDetail from '../screens/home/WeeklyStreakDetail';

const Stack = createNativeStackNavigator();

export default function MainNavigation() {
    return (
        <Stack.Navigator
            initialRouteName="BottomNavigation"
            screenOptions={{
                headerShown: false,
                animation: 'fade',
            }}
        >
            <Stack.Screen name="BottomNavigation" component={BottomNavigation} />
            <Stack.Screen name="Settings" component={Settings} />
            <Stack.Screen name="WeeklyStreakDetail" component={WeeklyStreakDetail} />
        </Stack.Navigator>
    );
}

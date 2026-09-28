import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomNavigation from './BottomNavigation';
import Settings from '../screens/home/Settings';
import WeeklyStreakDetail from '../screens/home/WeeklyStreakDetail';
import WordJumbleDetail from '../screens/home/WordJumbleDetail';
import ColorMatchDetail from '../screens/home/ColorMatchDetail';
import MathQuizDetail from '../screens/home/MathQuizDetail';
import MemoryChallengeDetail from '../screens/home/MemoryChallengeDetail';
import SelectLevel from '../screens/home/SelectLevel';
import WordPuzzleScreen from '../screens/game/WordPuzzleScreen';
import ColorMatchScreen from '../screens/game/ColorMatchScreen';
import MathQuizScreen from '../screens/game/MathQuizScreen';
import MemoryChallengeScreen from '../screens/game/MemoryChallengeScreen';
import LevelCompleteScreen from '../screens/game/LevelCompleteScreen';

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
            <Stack.Screen name="WordJumbleDetail" component={WordJumbleDetail} />
            <Stack.Screen name="ColorMatchDetail" component={ColorMatchDetail} />
            <Stack.Screen name="MathQuizDetail" component={MathQuizDetail} />
            <Stack.Screen name="MemoryChallengeDetail" component={MemoryChallengeDetail} />
            <Stack.Screen name="SelectLevel" component={SelectLevel} />
            <Stack.Screen name="WordPuzzleScreen" component={WordPuzzleScreen} />
            <Stack.Screen name="ColorMatchScreen" component={ColorMatchScreen} />
            <Stack.Screen name="MathQuizScreen" component={MathQuizScreen} />
            <Stack.Screen name="MemoryChallengeScreen" component={MemoryChallengeScreen} />
            <Stack.Screen
                name="LevelCompleteScreen"
                component={LevelCompleteScreen}
                options={{ gestureEnabled: false }}
            />
        </Stack.Navigator>
    );
}

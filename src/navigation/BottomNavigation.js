import React from 'react';
import { View, Image, Text, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Home from '../screens/home/Home';
import Game from '../screens/home/Game';
import Achievements from '../screens/home/Achievements';
import Profile from '../screens/home/Profile';
import { images } from '../constants/images';
import colors from '../constants/colour';
import fonts from '../constants/fonts';

const Tab = createBottomTabNavigator();

export default function BottomNavigation() {
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            initialRouteName="Home"
            screenOptions={({ route }) => ({
                headerShown: false,
                animation: 'fade',
                tabBarShowLabel: false,
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    height: 50 + insets.bottom,
                    borderTopWidth: 0,
                    paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
                    paddingTop: 10,
                },
                tabBarIcon: ({ focused }) => {
                    let iconSource;
                    let label;

                    if (route.name === 'Home') {
                        iconSource = images.home;
                        label = 'Home';
                    } else if (route.name === 'Games') {
                        iconSource = images.game;
                        label = 'Games';
                    } else if (route.name === 'Achievements') {
                        iconSource = images.champions;
                        label = 'Achievements';
                    } else if (route.name === 'Profile') {
                        iconSource = images.person;
                        label = 'Profile';
                    }

                    return (
                        <View style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: focused ? colors.primary : 'transparent',
                            paddingVertical: 8,
                            paddingHorizontal: 1,
                            borderRadius: 16,
                            minWidth: 90,
                            height: 50,
                        }}>
                            <Image
                                source={iconSource}
                                style={{
                                    width: 24,
                                    height: 24,
                                    tintColor: focused ? colors.white : '#94A3B8',
                                    marginBottom: 4,
                                }}
                                resizeMode="contain"
                            />
                            <Text style={{
                                color: focused ? colors.white : '#94A3B8',
                                fontFamily: fonts.medium,
                                fontSize: 12,
                            }}>
                                {label}
                            </Text>
                        </View>
                    );
                },
            })}
        >
            <Tab.Screen name="Home" component={Home} />
            <Tab.Screen name="Games" component={Game} />
            <Tab.Screen name="Achievements" component={Achievements} />
            <Tab.Screen name="Profile" component={Profile} />
        </Tab.Navigator>
    );
}

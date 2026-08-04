import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import LoginScreen from "../screens/auth/Login";
import OtpScreen from "../screens/auth/OtpScreen";
import SignupScreen from "../screens/auth/Signup";
import Profile from "../screens/auth/Profile";

const Stack = createNativeStackNavigator();

export default function AuthNavigation() {
    return (
        <Stack.Navigator
            initialRouteName="Signup"
            screenOptions={{
                headerShown: false,
                animation: 'fade',
            }}
        >
            {/* <Stack.Screen name="Login" component={LoginScreen} /> */}
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="Otp" component={OtpScreen} />
            <Stack.Screen name="Profile" component={Profile} />
        </Stack.Navigator>
    );
}
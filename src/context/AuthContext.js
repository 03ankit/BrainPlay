import React, { createContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userToken, setUserToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Fetch the token from storage then navigate to our appropriate place
        const bootstrapAsync = async () => {
            let token;
            try {
                token = await AsyncStorage.getItem('userToken');
            } catch (e) {
                // Restoring token failed
                console.error("Failed to restore token", e);
            }

            // After restoring token, we may need to validate it in production apps
            setUserToken(token);
            setIsLoading(false);
        };

        bootstrapAsync();
    }, []);

    const authContext = useMemo(
        () => ({
            signIn: async (data) => {
                // In a production app, we need to send some data (usually username, password) to server and get a token
                // We will also need to handle errors if sign in failed
                // After getting token, we need to persist the token using `AsyncStorage`
                setIsLoading(true);
                try {
                    const token = 'dummy-auth-token'; // Replace with actual token from API
                    await AsyncStorage.setItem('userToken', token);
                    setUserToken(token);
                } catch (e) {
                     console.error("Failed to save token", e);
                } finally {
                    setIsLoading(false);
                }
            },
            signOut: async () => {
                setIsLoading(true);
                try {
                    await AsyncStorage.removeItem('userToken');
                    setUserToken(null);
                } catch (e) {
                     console.error("Failed to remove token", e);
                } finally {
                    setIsLoading(false);
                }
            },
            userToken,
            isLoading,
        }),
        [userToken, isLoading]
    );

    return (
        <AuthContext.Provider value={authContext}>
            {children}
        </AuthContext.Provider>
    );
};

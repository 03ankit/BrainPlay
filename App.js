import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import SplashOverlay from './src/components/SplashOverlay';
import AuthNavigation from './src/navigation/AuthNavigation';
import MainNavigation from './src/navigation/MainNavigation';
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import { initDatabase } from './src/database/database';
import { seedDatabase } from './src/database/seed';

function RootNavigator() {
  const { userToken, isLoading } = useContext(AuthContext);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const setupDb = async () => {
      try {
        await initDatabase();
        await seedDatabase();
      } catch (err) {
        console.error('Database setup error on App launch:', err);
      }
    };
    setupDb();
  }, []);

  return (
    <View style={styles.container}>
      {/* Wait for storage load before rendering the right navigator */}
      {!isLoading && (
        userToken ? <MainNavigation /> : <AuthNavigation />
      )}

      {/* Splash covers everything until BOTH storage loads AND its timer finishes */}
      {(showSplash || isLoading) && (
        <SplashOverlay onAnimationComplete={() => setShowSplash(false)} />
      )}
    </View>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;

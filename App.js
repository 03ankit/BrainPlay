import React, { useContext, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import SplashOverlay from './src/components/SplashOverlay';
import AuthNavigation from './src/navigation/AuthNavigation';
import MainNavigation from './src/navigation/MainNavigation';
import { AuthProvider, AuthContext } from './src/context/AuthContext';

function RootNavigator() {
  const { userToken, isLoading } = useContext(AuthContext);
  const [showSplash, setShowSplash] = useState(true);

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

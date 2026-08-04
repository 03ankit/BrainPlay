/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import SplashOverlay from './src/components/SplashOverlay';
import AuthNavigation from './src/navigation/AuthNavigation';



function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <View style={styles.container}>
          {showSplash && (
            <SplashOverlay onAnimationComplete={() => setShowSplash(false)} />
          )}
          <AuthNavigation />
        </View>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;

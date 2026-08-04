import React, { useEffect } from 'react';
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import BootSplash from 'react-native-bootsplash';
import colors from '../constants/colour';

export default function SplashOverlay({ onAnimationComplete, timeout = 1800 }) {
  useEffect(() => {
    // Hide the native boot splash screen immediately, as our JS-side overlay is now active
    BootSplash.hide({ fade: false }).catch((err) => {
      console.warn('Failed to hide native BootSplash:', err);
    });

    // Show the custom splash screen for the specified timeout duration, then transition out
    const timer = setTimeout(() => {
      onAnimationComplete();
    }, timeout);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeout]);

  return (
    <View style={styles.splashContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.secondary} />

      {/* Center content: App Icon, Name */}
      <View style={styles.centerContent}>
        <View style={styles.logoWrapper}>
          <Image
            source={require('../assets/image/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.appName}>BrainPlay</Text>
        </View>
      </View>

      {/* Footer copyright text */}
      <View style={styles.footer}>
        <Text style={styles.copyrightText}>© 2024 BrainPlay Studio</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.secondary, // Light-purple theme background
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999, // Render above all other components
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  content: {
    alignItems: 'center',
  },
  logoWrapper: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 15,
    elevation: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 10,
    marginBottom: 24,
  },
  logo: {
    width: 140,
    height: 140,
    borderRadius: 24,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary, // Indigo primary color
    letterSpacing: 0.5,
    marginBottom: 24,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  copyrightText: {
    fontSize: 13,
    color: '#94A3B8', // Slate gray color
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});

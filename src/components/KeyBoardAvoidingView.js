import React, { useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
} from 'react-native';

const KeyboardScrollWrapper = ({
  children,
  containerStyle,
  contentContainerStyle,
  statusBarColor = 'transparent',
  barStyle = 'dark-content',
  screensEnabled = true,
  ref,
}) => {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <KeyboardAvoidingView
      style={[styles.container, containerStyle]}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : isKeyboardVisible
          ? 'height'
          : undefined
      }
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ScrollView
        ref={ref}
        bounces={false}
        overScrollMode="never"
        contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        scrollEnabled={screensEnabled}
      >
        <StatusBar
          translucent={true}
          backgroundColor={statusBarColor}
          barStyle={barStyle}
          animated={true}
        />
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default KeyboardScrollWrapper;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});

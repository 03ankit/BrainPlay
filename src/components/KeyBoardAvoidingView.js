import React, { useEffect, useState, useRef, forwardRef } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
} from 'react-native';

const KeyboardScrollWrapper = forwardRef(function KeyboardScrollWrapper(
  {
    children,
    containerStyle,
    contentContainerStyle,
    statusBarColor = 'transparent',
    barStyle = 'dark-content',
    screensEnabled = true,
  },
  ref
) {
  const [keyboardPadding, setKeyboardPadding] = useState(0);
  const internalRef = useRef(null);
  const scrollRef = ref || internalRef;

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      const height = e?.endCoordinates?.height || 0;
      if (Platform.OS === 'android' && height > 0) {
        setKeyboardPadding(height + 24);
      }
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      if (Platform.OS === 'android') {
        setKeyboardPadding(0);
      }
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <KeyboardAvoidingView
      style={[styles.container, containerStyle]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ScrollView
        ref={scrollRef}
        bounces={false}
        overScrollMode="never"
        contentContainerStyle={[
          styles.scrollContent,
          contentContainerStyle,
          Platform.OS === 'android' && keyboardPadding > 0
            ? { paddingBottom: keyboardPadding }
            : null,
        ]}
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
});

export default KeyboardScrollWrapper;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});

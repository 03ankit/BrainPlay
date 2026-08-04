import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import colors from '../constants/colour';

export default function CustomInput({
  label,
  value,
  onChangeText,
  error,
  keyboardType = 'default',
  autoCapitalize = 'none',
  placeholder = '',
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);
  const labelPosition = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(labelPosition, {
      toValue: (isFocused || value) ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value, labelPosition]);

  const labelStyle = {
    position: 'absolute',
    left: 16,
    top: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [16, -10],
    }),
    fontSize: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: error
      ? '#EF4444'
      : isFocused
      ? colors.primary
      : colors.gray,
    backgroundColor: (isFocused || value) ? colors.white : 'transparent',
    paddingHorizontal: 4,
    zIndex: 1,
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputWrapper,
          {
            borderColor: error ? '#EF4444' : isFocused ? colors.primary : '#E2E8F0',
            borderWidth: isFocused ? 2 : 1,
            backgroundColor: isFocused ? colors.white : colors.lightGray,
          },
        ]}
      >
        <Animated.Text style={labelStyle}>{label}</Animated.Text>
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isFocused ? placeholder : ''}
          placeholderTextColor={colors.gray}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 20,
  },
  inputWrapper: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  textInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '500',
    color: colors.darkGray,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    marginRight: 4,
    textAlign: 'right',
  },
});

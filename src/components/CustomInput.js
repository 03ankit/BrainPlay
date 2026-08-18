import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Animated,
  Image,
} from 'react-native';
import colors from '../constants/colour';
import fonts from '../constants/fonts';

export default function CustomInput({
  label,
  value,
  onChangeText,
  error,
  keyboardType = 'default',
  autoCapitalize = 'none',
  placeholder = '',
  rightIcon,
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);
  const labelPosition = useRef(new Animated.Value(value ? 1 : 0)).current;

  const isEditable = props.editable !== false;

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
      ? colors.red
      : isFocused || (!isEditable && value)
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
            backgroundColor: !isEditable
              ? '#F1F5F9'
              : isFocused
                ? colors.white
                : colors.lightGray,
          },
        ]}
      >
        <Animated.Text style={labelStyle}>{label}</Animated.Text>
        <TextInput
          style={[styles.textInput, !isEditable && { color: colors.gray }]}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={(e) => {
            setIsFocused(true);
            if (props.onFocus) props.onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            if (props.onBlur) props.onBlur(e);
          }}
          placeholder={isFocused ? placeholder : ''}
          placeholderTextColor={colors.gray}
          {...props}
        />
        {rightIcon && (
          <View style={styles.rightIconContainer}>
            <Image source={rightIcon} style={styles.mail} />
          </View>
        )}
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
    fontFamily: fonts.regular,
    color: colors.darkGray,
  },
  mail: {
    height: 20,
    width: 20,
    resizeMode: 'contain',
    tintColor: colors.primary,
  },
  rightIconContainer: {
    paddingRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontFamily: fonts.medium,
    marginTop: 4,
    marginRight: 4,
    textAlign: 'right',
  },
});

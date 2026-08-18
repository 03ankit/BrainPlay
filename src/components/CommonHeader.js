import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../constants/colour';
import images from '../constants/images';
import Fonts from '../constants/fonts';

const Header = ({
    title = 'BrainPlay',
    onBack,
    showBack = true,
    rightComponent,
}) => {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.safeArea, { paddingTop: insets.top }]}>
            <View style={styles.container}>
                {/* Left */}
                <View style={styles.side}>
                    {showBack && (
                        <TouchableOpacity
                            onPress={onBack}
                            style={styles.backButton}
                            activeOpacity={0.7}
                        >
                            <Image source={images.back} style={styles.backIcon} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Center Title Container */}
                <View style={styles.titleContainer} pointerEvents="none">
                    <Text style={styles.title} numberOfLines={1}>{title}</Text>
                </View>

                {/* Right */}
                <View style={[styles.side, styles.rightSide]}>
                    {rightComponent || null}
                </View>
            </View>
        </View>
    );
};

export default Header;

const styles = StyleSheet.create({
    safeArea: {
        width: '100%',
        backgroundColor: colors.secondary,
    },
    container: {
        height: 64,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        position: 'relative',
    },

    side: {
        width: 40,
        alignItems: 'flex-start',
        justifyContent: 'center',
        zIndex: 2,
    },

    rightSide: {
        alignItems: 'flex-end',
        width: 'auto',
        minWidth: 40,
    },

    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },

    backIcon: {
        width: 36,
        height: 36,
        resizeMode: "contain",
        tintColor: colors.primary,
    },

    titleContainer: {
        position: 'absolute',
        left: 60,
        right: 60,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },

    title: {
        fontSize: 17,
        fontFamily: Fonts.semiBold,
        color: colors.primary,
        textAlign: 'center',
    },
});


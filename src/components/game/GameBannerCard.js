import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import images from '../../constants/images';
import fonts from '../../constants/fonts';
import colors from '../../constants/colour';

const GameBannerCard = ({
    category = 'PUZZLE CATEGORY',
    title = 'Word Jumble',
    imageSource = images.word_jumble_bg,
}) => {
    return (
        <View style={styles.cardContainer}>
            <ImageBackground
                source={imageSource}
                style={styles.bannerImage}
                imageStyle={styles.imageRadius}
                resizeMode="cover"
            >
                {/* Dark Gradient Overlay for text contrast */}
                <View style={styles.overlay}>
                    {/* Badge Overlay */}
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{category}</Text>
                    </View>

                    {/* Banner Title */}
                    <Text style={styles.titleText}>{title}</Text>
                </View>
            </ImageBackground>
        </View>
    );
};

export default GameBannerCard;

const styles = StyleSheet.create({
    cardContainer: {
        width: '100%',
        height: 210,
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: colors.darkPurple,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 6,
        marginVertical: 12,
    },
    bannerImage: {
        width: '100%',
        height: '100%',
    },
    imageRadius: {
        borderRadius: 24,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 10, 40, 0.45)',
        padding: 20,
        justifyContent: 'space-between',
    },
    badge: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255, 255, 255, 0.18)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 6,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontFamily: fonts.bold,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
    },
    titleText: {
        color: '#FFFFFF',
        fontSize: 32,
        fontFamily: fonts.bold,
        letterSpacing: 0.5,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 6,
    },
});

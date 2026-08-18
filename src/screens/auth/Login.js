// import React, { useMemo, useState } from 'react';
// import {
//   KeyboardAvoidingView,
//   Platform,
//   Pressable,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   View,
// } from 'react-native';
// import colors from '../../constants/colour';
// import CustomButton from '../../components/CustomButton';
// import CustomInput from '../../components/CustomInput';

// function isValidEmail(email) {
//   return /^\S+@\S+\.\S+$/.test(email);
// }

// export default function Login({ navigation }) {
//   const [email, setEmail] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const canContinue = useMemo(() => !!email.trim() && !loading, [email, loading]);

//   const handleContinue = async () => {
//     const trimmed = email.trim();
//     if (!trimmed) {
//       setError('Email is required');
//       return;
//     }
//     if (!isValidEmail(trimmed)) {
//       setError('Enter a valid email');
//       return;
//     }

//     setError('');
//     setLoading(true);
//     try {
//       navigation?.navigate?.('Otp', { email: trimmed });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.screen}>
//       <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

//       <ScrollView
//         contentContainerStyle={styles.scrollContent}
//         keyboardShouldPersistTaps="handled"
//       >
//         <Text style={styles.welcomeText}>Welcome to BrainPlay</Text>

//         <KeyboardAvoidingView
//           behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//           style={styles.card}
//         >
//           <Text style={styles.title}>Sign in</Text>
//           <Text style={styles.subtitle}>
//             Enter your email to receive a one-time code.
//           </Text>

//           <View style={styles.form}>
//             <CustomInput
//               label="Email Address"
//               value={email}
//               onChangeText={(t) => {
//                 setEmail(t);
//                 if (error) setError('');
//               }}
//               error={error || undefined}
//               keyboardType="email-address"
//               autoCapitalize="none"
//               placeholder="Enter email"
//             />

//             <CustomButton
//               title="Continue"
//               onPress={handleContinue}
//               disabled={!canContinue}
//               loading={loading}
//             />

//             <View style={styles.footerTextRow}>
//               <Text style={styles.footerText}>New to BrainPlay? </Text>
//               <Pressable onPress={() => navigation?.navigate?.('Signup')}>
//                 <Text style={[styles.footerText, styles.footerLink]}>
//                   Create account
//                 </Text>
//               </Pressable>
//             </View>
//           </View>
//         </KeyboardAvoidingView>
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   screen: {
//     flex: 1,
//     backgroundColor: colors.primary,
//   },
//   scrollContent: {
//     paddingHorizontal: 20,
//     paddingBottom: 28,
//     paddingTop: 110,
//     alignItems: 'center',
//   },
//   welcomeText: {
//     color: colors.white,
//     fontSize: 26,
//     fontWeight: '800',
//     marginBottom: 18,
//     textAlign: 'center',
//     letterSpacing: 0.2,
//   },
//   card: {
//     width: '100%',
//     backgroundColor: colors.white,
//     borderRadius: 28,
//     paddingHorizontal: 18,
//     paddingTop: 22,
//     paddingBottom: 18,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: '800',
//     color: colors.darkGray,
//     textAlign: 'center',
//     marginBottom: 4,
//   },
//   subtitle: {
//     fontSize: 14,
//     color: colors.gray,
//     textAlign: 'center',
//     marginBottom: 18,
//     fontWeight: '500',
//   },
//   form: {
//     width: '100%',
//   },
//   footerTextRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginTop: 14,
//   },
//   footerText: {
//     color: colors.gray,
//     fontWeight: '500',
//     fontSize: 12,
//   },
//   footerLink: {
//     color: colors.primary,
//     fontWeight: '700',
//   },
// });


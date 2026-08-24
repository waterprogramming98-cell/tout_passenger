import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../styles/theme';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';

interface UserLoginScreenProps {
  navigation: any;
  route: any;
}

const UserLoginScreen: React.FC<UserLoginScreenProps> = ({ navigation, route }) => {
  const { selectedLanguage = 'English' } = route.params || {};
  const [formData, setFormData] = useState({
    phoneNumber: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getText = (en: string, ar: string) =>
    selectedLanguage === 'Arabic' ? ar : en;

  const handleLogin = async () => {
    if (!formData.phoneNumber || !formData.password) {
      Alert.alert(
        getText('Error', 'خطأ'),
        getText('Please fill all fields', 'يرجى ملء جميع الحقول')
      );
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('https://toutsroutes.com/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: formData.phoneNumber,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const userInfo = data.data?.user || data.user;
        const userToken = data.data?.token || data.token;
        Alert.alert(getText('Success', 'نجاح'), getText('Login successful!', 'تم تسجيل الدخول بنجاح!'));
        navigation.replace('UserGovernorateSelection', {
          selectedLanguage,
          userData: userInfo,
          token: userToken,
        });
      } else {
        Alert.alert(getText('Login Failed', 'فشل تسجيل الدخول'), data.message || 'Invalid credentials');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert(getText('Error', 'خطأ'), getText('An unexpected error occurred. Please try again.', 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'));
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricAuth = async () => {
    const rnBiometrics = new ReactNativeBiometrics();

    try {
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();

      if (available && (biometryType === BiometryTypes.TouchID || biometryType === BiometryTypes.FaceID || biometryType === BiometryTypes.Biometrics)) {
        const { success } = await rnBiometrics.simplePrompt({
          promptMessage: getText('Authenticate to login', 'المصادقة لتسجيل الدخول'),
          cancelButtonText: getText('Cancel', 'إلغاء'),
        });

        if (success) {
          Alert.alert(getText('Success', 'نجاح'), getText('Biometric authentication successful!', 'تمت المصادقة البيومترية بنجاح!'));
          
          // FIXED: Navigate to next screen after successful biometric authentication
          // Using placeholder data - in production, you should retrieve actual user data from secure storage
          navigation.replace('UserGovernorateSelection', {
            selectedLanguage,
            userData: { isBiometric: true, authenticatedViaBiometric: true },
            token: 'biometric_auth_token', // In production, retrieve from secure storage (AsyncStorage or Keychain)
          });
        } else {
          Alert.alert(getText('Authentication Failed', 'فشل المصادقة'), getText('User cancelled biometric authentication.', 'تم إلغاء المصادقة البيومترية من قبل المستخدم.'));
        }
      } else {
        Alert.alert(
          getText('Biometric Not Available', 'المصادقة البيومترية غير متاحة'),
          getText('Your device does not support biometric authentication or it is not set up.', 'جهازك لا يدعم المصادقة البيومترية أو لم يتم إعدادها.')
        );
      }
    } catch (error) {
      console.error('Biometric error:', error);
      Alert.alert(getText('Error', 'خطأ'), getText('An error occurred during biometric authentication.', 'حدث خطأ أثناء المصادقة البيومترية.'));
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      getText('Forgot Password', 'هل نسيت كلمة المرور؟'),
      getText('Please contact support', 'يرجى التواصل مع الدعم')
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.logoContainer}>
        <Image source={require('../assets/images/tout-logo.png')} style={styles.logoImage} />
      </View>
      <Text style={styles.title}>
        {getText('Welcome Back', 'مرحباً بعودتك')}
      </Text>
      <Text style={styles.subtitle}>
        {getText('Login to continue your journey', 'سجل الدخول لمتابعة رحلتك')}
      </Text>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>{getText('Phone Number', 'رقم الهاتف')}</Text>
        <TextInput
          style={styles.input}
          placeholder={getText('Enter your phone number', 'أدخل رقم هاتفك')}
          placeholderTextColor={COLORS.NEUTRAL_LIGHT}
          keyboardType="phone-pad"
          value={formData.phoneNumber}
          onChangeText={(phoneNumber) => setFormData({ ...formData, phoneNumber })}
          editable={!loading}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>{getText('Password', 'كلمة المرور')}</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder={getText('Enter your password', 'أدخل كلمة المرور')}
            placeholderTextColor={COLORS.NEUTRAL_LIGHT}
            secureTextEntry={!showPassword}
            value={formData.password}
            onChangeText={(password) => setFormData({ ...formData, password })}
            editable={!loading}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={styles.eyeText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.rememberMeContainer}>
        <TouchableOpacity onPress={() => setRememberMe(!rememberMe)} style={styles.checkbox}>
          {rememberMe ? <Text style={styles.checkboxChecked}>✓</Text> : null}
        </TouchableOpacity>
        <Text style={styles.rememberMeText}>{getText("Remember Me", "تذكرني")}</Text>
      </View>
      <TouchableOpacity onPress={handleForgotPassword} disabled={loading}>
        <Text style={styles.forgotPassword}>
          {getText('Forgot Password?', 'هل نسيت كلمة المرور؟')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.loginButton, loading && styles.disabledButton]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.PRIMARY_DARK} size="large" />
        ) : (
          <Text style={styles.loginButtonText}>
            {getText('LOGIN', 'دخول')}
          </Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.biometricButton, loading && styles.disabledButton]}
        onPress={handleBiometricAuth}
        disabled={loading}
      >
        <Text style={styles.loginButtonText}>
          {getText('Biometric Login', 'تسجيل الدخول البيومتري')}
        </Text>
      </TouchableOpacity>
      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>
          {getText("Don't have an account? ", 'ليس لديك حساب؟ ')}
        </Text>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('UserRegister', { selectedLanguage })
          }
          disabled={loading}
        >
          <Text style={styles.registerLink}>
            {getText('Register', 'تسجيل')}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.footer}>
        <View style={styles.divider} />
        <Text style={styles.footerText}>✦</Text>
        <View style={styles.divider} />
      </View>
    </ScrollView>
  );
};

export default UserLoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY_DARK,
  },
  contentContainer: {
    paddingHorizontal: SPACING.LG,
    paddingTop: SPACING.XXL,
    paddingBottom: SPACING.XXL,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.XXL,
  },
  logoImage: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  title: {
    fontSize: TYPOGRAPHY.SIZE_H2,
    fontWeight: '700',
    color: COLORS.ACCENT_GOLD,
    textAlign: 'center',
    marginBottom: SPACING.SM,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.SIZE_BODY,
    color: COLORS.NEUTRAL_LIGHT,
    textAlign: 'center',
    marginBottom: SPACING.XL,
  },
  inputContainer: {
    marginBottom: SPACING.LG,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.SIZE_H5,
    fontWeight: '600',
    color: COLORS.ACCENT_GOLD,
    marginBottom: SPACING.SM,
  },
  input: {
    backgroundColor: COLORS.PRIMARY_MEDIUM,
    borderWidth: 1,
    borderColor: COLORS.ACCENT_GOLD,
    borderRadius: BORDER_RADIUS.LG,
    padding: SPACING.MD,
    color: COLORS.PRIMARY_LIGHT,
    fontSize: TYPOGRAPHY.SIZE_BODY,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY_MEDIUM,
    borderWidth: 1,
    borderColor: COLORS.ACCENT_GOLD,
    borderRadius: BORDER_RADIUS.LG,
  },
  passwordInput: {
    flex: 1,
    padding: SPACING.MD,
    color: COLORS.PRIMARY_LIGHT,
    fontSize: TYPOGRAPHY.SIZE_BODY,
  },
  eyeIcon: {
    paddingHorizontal: SPACING.MD,
  },
  eyeText: {
    fontSize: TYPOGRAPHY.SIZE_H4,
  },
  forgotPassword: {
    fontSize: TYPOGRAPHY.SIZE_SMALL,
    color: COLORS.ACCENT_GOLD,
    textAlign: 'right',
    marginBottom: SPACING.XL,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: COLORS.ACCENT_GOLD,
    borderRadius: BORDER_RADIUS.LG,
    paddingVertical: SPACING.MD,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.LG,
    shadowColor: COLORS.ACCENT_GOLD,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  biometricButton: {
    backgroundColor: COLORS.BIOMETRIC_BUTTON,
    borderRadius: BORDER_RADIUS.LG,
    paddingVertical: SPACING.MD,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.LG,
    shadowColor: COLORS.BIOMETRIC_BUTTON,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: TYPOGRAPHY.SIZE_H4,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: TYPOGRAPHY.SIZE_BODY,
    color: COLORS.PRIMARY_LIGHT,
  },
  registerLink: {
    fontSize: TYPOGRAPHY.SIZE_BODY,
    fontWeight: '700',
    color: COLORS.ACCENT_GOLD,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.XXL,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.ACCENT_GOLD,
    opacity: 0.3,
  },
    footerText: {
      color: COLORS.ACCENT_GOLD,
      fontSize: TYPOGRAPHY.SIZE_H5,
      marginHorizontal: SPACING.MD,
    },
  
    rememberMeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING.LG,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: BORDER_RADIUS.SM,
      borderWidth: 1,
      borderColor: COLORS.ACCENT_GOLD,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: SPACING.SM,
    },
    checkboxChecked: {
      color: COLORS.ACCENT_GOLD,
      fontSize: TYPOGRAPHY.SIZE_BODY,
      fontWeight: 'bold',
    },
    rememberMeText: {
      color: COLORS.NEUTRAL_LIGHT,
      fontSize: TYPOGRAPHY.SIZE_BODY,
    },
  });
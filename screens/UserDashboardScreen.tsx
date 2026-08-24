import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';

import styles from '../styles/UserDashboardScreen.styles';

interface UserDashboardScreenProps {
  navigation: any;
  route: any;
}

const UserDashboardScreen: React.FC<UserDashboardScreenProps> = ({
  navigation,
  route,
}) => {
  const {
    selectedLanguage = 'English',
    userData,
    token: routeToken,
  } = route.params || {};

  const token = routeToken || userData?.token || '';

  const getText = (en: string, ar: string) =>
    selectedLanguage === 'Arabic' ? ar : en;

  // Removed Scooter, Package Delivery, and Book a Captain from here
  const services = [
    {
      id: 'insideCity',
      title: getText('Inside City', 'داخل المدينة'),
      icon: require('../assets/images/car-icon-gold.png'),
    },
    {
      id: 'crossCity',
      title: getText('Cross City', 'عبر المدينة'),
      icon: require('../assets/images/cross-city-icon.png'),
    },
    {
      id: 'airportDropOff',
      title: getText('Airport Drop-off', 'توصيل المطار'),
      icon: require('../assets/images/airport-icon.png'),
    },
  ];

  const handleServicePress = (service: any) => {
    navigation.navigate('DestinationSelection', {
      selectedLanguage,
      token,
      userData,
      serviceType: service.id,
      category: route.params?.category,
    });
  };

  const handleStartBooking = () => {
    navigation.navigate('DestinationSelection', {
      selectedLanguage,
      token,
      userData,
      serviceType: 'startBooking',
      category: route.params?.category,
    });
  };

  const handleTripHistory = () => {
    navigation.navigate("TripHistoryScreen", {
      selectedLanguage,
      token,
      userData,
    });
  };

  const handleSupport = () => {
    const phoneNumber = '+201100650070';
    const whatsappUrl = `whatsapp://send?phone=${phoneNumber}`;
    Linking.canOpenURL(whatsappUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(whatsappUrl);
        } else {
          return Linking.openURL(`https://wa.me/${phoneNumber.replace('+', '')}`);
        }
      })
      .catch((err) => console.error('An error occurred', err));
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      getText('Delete Account', 'حذف الحساب'),
      getText(
        'Are you sure you want to delete your account? This action cannot be undone.',
        'هل أنت متأكد أنك تريد حذف حسابك؟ لا يمكن التراجع عن هذا الإجراء.',
      ),
      [
        { text: getText('Cancel', 'إلغاء'), style: 'cancel' },
        {
          text: getText('Delete', 'حذف'),
          style: 'destructive',
          onPress: async () => {
            Alert.alert(
              getText('Success', 'تم بنجاح'),
              getText(
                'Your account deletion request has been submitted.',
                'تم تقديم طلب حذف حسابك.',
              ),
              [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
            );
          },
        },
      ],
    );
  };

  return (
    <View style={styles.fullScreenContainer}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View style={{ width: '100%', paddingTop: 35, paddingBottom: 10 }}>
          <Image
            source={require('../assets/images/tout-logo.png')}
            style={{ width: '100%', height: 120 }}
            resizeMode="stretch"
          />
        </View>

        <View style={styles.welcomeSection}>
          <View style={styles.welcomeContent}>
            <View style={{ flex: 1 }}>
              <Text style={styles.welcomeText}>{getText('Welcome,', 'أهلاً بك،')}</Text>
              <Text style={styles.userName}>{userData?.name || 'User'}</Text>
              <Text style={styles.luxuryExperienceText}>
                {getText('Experience luxury. Anytime, anywhere.', 'استمتع بالرفاهية. في أي وقت، في أي مكان.')}
              </Text>
            </View>
            <Image
              source={require('../assets/images/pyramids.png')}
              style={{ width: 85, height: 85, resizeMode: 'contain', marginLeft: 10 }}
            />
          </View>
        </View>

        <TouchableOpacity activeOpacity={0.85} style={styles.startBookingButton} onPress={handleStartBooking}>
          <Image source={require('../assets/images/start_booking_bg.png')} style={styles.startBookingBackground} />
          <View style={styles.startBookingContent}>
            <Image source={require('../assets/images/car-white-icon.png')} style={styles.startBookingIcon} />
            <Text style={styles.startBookingText}>{getText('Start Booking', 'ابدأ الحجز')}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.85} style={[styles.startBookingButton, { marginTop: 14 }]} onPress={handleTripHistory}>
          <Image source={require('../assets/images/start_booking_bg.png')} style={styles.startBookingBackground} />
          <View style={styles.startBookingContent}>
            <Image source={require('../assets/images/history-icon.png')} style={styles.startBookingIcon} />
            <Text style={styles.startBookingText}>{getText('Trip History', 'سجل الرحلات')}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.85} style={[styles.startBookingButton, { marginTop: 14 }]} onPress={handleSupport}>
          <Image source={require('../assets/images/start_booking_bg.png')} style={styles.startBookingBackground} />
          <View style={styles.startBookingContent}>
            <Text style={{ fontSize: 24, marginRight: 10 }}>🎧</Text>
            <Text style={styles.startBookingText}>{getText('Support', 'الدعم')}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.servicesGrid}>
          {services.map((service) => (
            <TouchableOpacity
              key={service.id}
              activeOpacity={0.85}
              style={styles.serviceCard}
              onPress={() => handleServicePress(service)}
            >
              <Image source={service.icon} style={styles.serviceIcon} resizeMode="contain" />
              <Text style={styles.serviceText}>{service.title}</Text>
              <Image source={require('../assets/images/arrow-right-icon.png')} style={styles.arrowRightIcon} resizeMode="contain" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity activeOpacity={0.7} style={{ marginTop: 30, marginBottom: 10, alignSelf: 'center', padding: 10 }} onPress={handleDeleteAccount}>
          <Text style={{ color: '#FF4444', fontSize: 12, textDecorationLine: 'underline', opacity: 0.8 }}>
            {getText('Delete Account', 'حذف الحساب')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default UserDashboardScreen;
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import firestore from '@react-native-firebase/firestore';

const chariotIcon = require('../assets/lottie/images/captain-car-icon.png');

type LocationData = {
  latitude: number;
  longitude: number;
};

const UserTripMapScreen: React.FC<any> = ({ navigation, route }) => {
  const { bookingDetails, selectedLanguage, token } = route.params;
  const [captainLocation, setCaptainLocation] = useState<LocationData | null>(null);
  const mapRef = useRef<MapView>(null);

  const getText = (en: string, ar: string) =>
    selectedLanguage === 'Arabic' ? ar : en;

  // 1. Live Location Updates (Firestore)
  useEffect(() => {
    const subscriber = firestore()
      .collection('live_locations')
      .doc(String(bookingDetails.booking_id))
      .onSnapshot(documentSnapshot => {
        const data = documentSnapshot.data();

        if (
          data &&
          typeof data.latitude === 'number' &&
          typeof data.longitude === 'number'
        ) {
          const newLocation: LocationData = {
            latitude: data.latitude,
            longitude: data.longitude,
          };

          setCaptainLocation(newLocation);

          mapRef.current?.animateToRegion(
            {
              ...newLocation,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            },
            800
          );
        }
      });

    return () => subscriber();
  }, [bookingDetails.booking_id]);

  // 2. Status Polling (REST API)
  useEffect(() => {
    const pollStatus = async () => {
      try {
        const response = await fetch(`https://toutsroutes.com/api/bookings/${bookingDetails.booking_id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) return;
        
        const data = await response.json();
        
        if (data.status === 'Completed') {
          Alert.alert(
            getText('Trip Completed', 'اكتملت الرحلة'),
            getText('We hope you enjoyed your ride!', 'نأمل أن تكون قد استمتعت برحلتك!'),
            [
              {
                text: 'OK',
                onPress: () => {
                  navigation.replace('SubmitReviewScreen', {
                    bookingDetails: data,
                    token: token,
                    selectedLanguage: selectedLanguage,
                  });
                }
              }
            ]
          );
        } else if (data.status === 'Cancelled') {
          Alert.alert(
            getText('Trip Cancelled', 'تم إلغاء الرحلة'),
            getText('The trip has been cancelled.', 'تم إلغاء الرحلة.'),
            [
              {
                text: 'OK',
                onPress: () => navigation.replace('UserDashboardScreen', {
                  selectedLanguage,
                  token,
                  userData: route.params?.userData
                })
              }
            ]
          );
        }
      } catch (error) {
        console.error("Error polling booking status:", error);
      }
    };

    const intervalId = setInterval(pollStatus, 10000); // Poll every 10 seconds
    return () => clearInterval(intervalId);
  }, [bookingDetails.booking_id, token, navigation, selectedLanguage]);

  const fromLat = parseFloat(bookingDetails?.pickup_location_lat);
  const fromLon = parseFloat(bookingDetails?.pickup_location_lon);

  const hasValidUserCoordinates = !isNaN(fromLat) && !isNaN(fromLon);

  if (!hasValidUserCoordinates) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {getText('Could not load your location.', 'تعذر تحميل موقعك.')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: fromLat,
          longitude: fromLon,
          latitudeDelta: 0.06,
          longitudeDelta: 0.04,
        }}
      >
        {/* User */}
        <Marker
          coordinate={{ latitude: fromLat, longitude: fromLon }}
          title={getText('Your Location', 'موقعك')}
          pinColor="#FFD700"
        />

        {/* Captain */}
        {captainLocation && (
          <Marker
            coordinate={captainLocation}
            title={getText('Captain', 'الكابتن')}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <Image source={chariotIcon} style={styles.chariotIcon} />
          </Marker>
        )}
      </MapView>

      {/* TOP STATUS (UPGRADED) */}
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>
          {getText('Captain On The Way', 'الكابتن في الطريق')}
        </Text>
        <Text style={styles.statusSubtitle}>
          {getText(
            'Please be ready at pickup point',
            'يرجى التواجد في نقطة الاستلام'
          )}
        </Text>
      </View>

      {/* BOTTOM PANEL (NEW - MODERN UX) */}
      <View style={styles.bottomCard}>
        <Text style={styles.bottomTitle}>
          {getText('Trip in Progress', 'الرحلة جارية')}
        </Text>

        <Text style={styles.bottomSubtitle}>
          {getText(
            'Tracking your captain in real-time',
            'يتم تتبع الكابتن مباشرة'
          )}
        </Text>
      </View>
    </View>
  );
};

export default UserTripMapScreen;

/* ================= Styles ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F1A',
  },

  map: {
    flex: 1,
  },

  chariotIcon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },

  /* TOP CARD */
  statusCard: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(20,27,45,0.95)',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.4)',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },

  statusTitle: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },

  statusSubtitle: {
    color: '#ccc',
    fontSize: 13,
    textAlign: 'center',
  },

  /* BOTTOM CARD */
  bottomCard: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(11,15,26,0.95)',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.25)',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },

  bottomTitle: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },

  bottomSubtitle: {
    color: '#aaa',
    fontSize: 13,
  },

  /* ERROR */
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0B0F1A',
    padding: 20,
  },

  errorText: {
    color: '#FFD700',
    fontSize: 18,
    textAlign: 'center',
  },
});

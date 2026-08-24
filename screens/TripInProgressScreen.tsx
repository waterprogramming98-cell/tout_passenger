// screens/TripInProgressScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import firestore from '@react-native-firebase/firestore';

const TripInProgressScreen: React.FC<any> = ({ navigation, route }) => {
  const { selectedLanguage, token, bookingDetails, captain } = route.params;

  const [currentStatus, setCurrentStatus] = useState<'Accepted' | 'Arrived'>(
    'Accepted'
  );
  const [loading, setLoading] = useState(false);
  const watchId = useRef<number | null>(null);

  const getText = (en: string, ar: string) =>
    selectedLanguage === 'Arabic' ? ar : en;

  /* ================= Location Updates ================= */

  const startLocationUpdates = () => {
    if (watchId.current !== null) return;

    watchId.current = Geolocation.watchPosition(
      position => {
        const { latitude, longitude } = position.coords;

        firestore()
          .collection('live_locations')
          .doc(String(bookingDetails.booking_id))
          .set(
            {
              captainId: captain.captain_id,
              latitude,
              longitude,
              updatedAt: firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
      },
      error => {
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10,
        interval: 5000,
        fastestInterval: 2000,
      }
    );
  };

  const stopLocationUpdates = () => {
    if (watchId.current !== null) {
      Geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  };

  /* ================= Init ================= */

  useEffect(() => {
    const initializeTrip = async () => {
      if (Platform.OS === 'android') {
        const granted = await Geolocation.requestAuthorization('whenInUse');
        if (granted !== 'granted') {
          Alert.alert(
            getText('Permission Required', 'إذن مطلوب'),
            getText(
              'Location permission is required to proceed.',
              'يلزم إذن الموقع للمتابعة.'
            )
          );
          navigation.goBack();
          return;
        }
      }

      try {
        await fetch(
          `https://toutsroutes.com/api/bookings/${bookingDetails.booking_id}/status`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status: 'Accepted' } ),
          }
        );
        startLocationUpdates();
      } catch {
        Alert.alert(
          getText('Error', 'خطأ'),
          getText(
            'Could not confirm trip with server.',
            'تعذر تأكيد الرحلة مع الخادم.'
          )
        );
        navigation.goBack();
      }
    };

    initializeTrip();
    return () => stopLocationUpdates();
  }, []);

  /* ================= Status Update ================= */

  const updateStatus = async (newStatus: 'Arrived' | 'Completed') => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://toutsroutes.com/api/bookings/${bookingDetails.booking_id}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus } ),
        }
      );

      if (!response.ok) throw new Error('Failed to update status');

      if (newStatus === 'Completed') {
        stopLocationUpdates();

        // --- NEW: Send email notification --- START
        try {
          const emailPayload = {
            booking_id: bookingDetails.booking_id,
            user_email: bookingDetails.user_email, // Ensure this is in bookingDetails
            amount_paid: bookingDetails.estimated_fare,
            user_name: bookingDetails.user_name,
          };

          // Backend endpoint to trigger the email
          const emailRes = await fetch('https://toutsroutes.com/api/send-trip-completion-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(emailPayload ),
          });

          if (!emailRes.ok) {
            const errorText = await emailRes.text();
            console.error('Failed to send trip completion email:', errorText);
          } else {
            console.log('Trip completion email sent successfully.');
          }
        } catch (emailError) {
          console.error('Error sending trip completion email:', emailError);
        }
        // --- NEW: Send email notification --- END

        Alert.alert(
          getText('Trip Completed', 'اكتملت الرحلة'),
          getText('You earned', 'لقد ربحت') +
            ` ${bookingDetails.estimated_fare} EGP`,
          [
            {
              text: 'OK',
              onPress: () =>
                navigation.replace('CaptainDashboard', {
                  selectedLanguage,
                  token,
                  captain,
                }),
            },
          ]
        );
      } else {
        setCurrentStatus(newStatus);
      }
    } catch (error: any) {
      Alert.alert(getText('Error', 'خطأ'), error.message);
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI Helpers ================= */

  const renderActionButton = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#FFD700" />;
    }

    if (currentStatus === 'Accepted') {
      return (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => updateStatus('Arrived')}
        >
          <Text style={styles.primaryButtonText}>
            {getText('Arrived at Pickup', 'وصلت إلى نقطة الانطلاق')}
          </Text>
        </TouchableOpacity>
      );
    }

    if (currentStatus === 'Arrived') {
      return (
        <TouchableOpacity
          style={[styles.primaryButton, styles.completeButton]}
          onPress={() => updateStatus('Completed')}
        >
          <Text style={styles.primaryButtonText}>
            {getText('Complete Trip', 'إنهاء الرحلة')}
          </Text>
        </TouchableOpacity>
      );
    }

    return null;
  };

  /* ================= Map ================= */

  const fromLat = parseFloat(bookingDetails?.pickup_location_lat);
  const fromLon = parseFloat(bookingDetails?.pickup_location_lon);
  const toLat = parseFloat(bookingDetails?.dropoff_location_lat);
  const toLon = parseFloat(bookingDetails?.dropoff_location_lon);

  const hasValidCoordinates =
    !isNaN(fromLat) &&
    !isNaN(fromLon) &&
    !isNaN(toLat) &&
    !isNaN(toLon);

  return (
    <View style={styles.container}>
      {hasValidCoordinates ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: fromLat,
            longitude: fromLon,
            latitudeDelta: Math.abs(fromLat - toLat) * 1.4 + 0.02,
            longitudeDelta: Math.abs(fromLon - toLon) * 1.4 + 0.02,
          }}
        >
          <Marker
            coordinate={{ latitude: fromLat, longitude: fromLon }}
            title={getText('Pickup', 'الانطلاق')}
            pinColor="#FFD700"
          />
          <Marker
            coordinate={{ latitude: toLat, longitude: toLon }}
            title={getText('Dropoff', 'الوصول')}
            pinColor="#E74C3C"
          />
          <Polyline
            coordinates={[
              { latitude: fromLat, longitude: fromLon },
              { latitude: toLat, longitude: toLon },
            ]}
            strokeColor="#FFD700"
            strokeWidth={5}
          />
        </MapView>
      ) : (
        <View style={styles.mapError}>
          <Text style={styles.mapErrorText}>
            {getText(
              'Could not load map data.',
              'تعذر تحميل بيانات الخريطة.'
            )}
          </Text>
        </View>
      )}

      {/* Bottom Card */}
      <View style={styles.bottomCard}>
        <Text style={styles.tripTitle}>
          {getText('Trip with', 'رحلة مع')} {bookingDetails.user_name}
        </Text>

        <Text style={styles.tripStatus}>
          {getText('Status:', 'الحالة:')}{' '}
          <Text style={styles.statusHighlight}>{currentStatus}</Text>
        </Text>

        <View style={styles.buttonWrapper}>{renderActionButton()}</View>
      </View>
    </View>
  );
};

export default TripInProgressScreen;

/* ================= Styles ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  map: {
    flex: 1,
  },

  mapError: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F0F0F',
  },
  mapErrorText: {
    color: '#FFD700',
    fontSize: 18,
    textAlign: 'center',
  },

  bottomCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1C1C1C',
    padding: 22,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderTopWidth: 1,
    borderColor: '#FFD700',
  },

  tripTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 10,
  },
  tripStatus: {
    fontSize: 16,
    color: '#AAA',
    textAlign: 'center',
  },
  statusHighlight: {
    color: '#2ECC71',
    fontWeight: 'bold',
  },

  buttonWrapper: {
    marginTop: 20,
    alignItems: 'center',
  },

  primaryButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  completeButton: {
    backgroundColor: '#2ECC71',
  },
  primaryButtonText: {
    color: '#111',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

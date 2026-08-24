// screens/BookingStatusScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

const BookingStatusScreen: React.FC<any> = ({ navigation, route }) => {
    const { bookingDetails, token, selectedLanguage } = route.params;
    const isFocused = useIsFocused();

    // We no longer need the 'currentBooking' state, as we will navigate away.
    // const [currentBooking, setCurrentBooking] = useState(bookingDetails);

    const getText = (en: string, ar: string) => selectedLanguage === 'Arabic' ? ar : en;

    useEffect(() => {
        if (!isFocused) {
            return;
        }

        // Immediately check the status when the screen loads.
        fetchBookingStatus();

        // Set up an interval to poll for the booking status every 10 seconds.
        const intervalId = setInterval(() => {
            fetchBookingStatus();
        }, 10000); // 10 seconds

        // Clean up the interval when the screen is no longer focused.
        return () => clearInterval(intervalId);
    }, [isFocused]);

    const fetchBookingStatus = async () => {
        try {
            const response = await fetch(`https://toutsroutes.com/api/bookings/${bookingDetails.booking_id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            } );
            if (!response.ok) {
                console.error("Failed to fetch booking status.");
                return;
            }
            const data = await response.json();

            // ✅ THIS IS THE FIX:
            // If the captain has accepted the trip, immediately navigate the user
            // to the live map screen. We use .replace() so the user cannot go back.
            if (data.status === 'Accepted') {
                navigation.replace('UserTripMap', {
                    bookingDetails: data,
                    token: token,
                    selectedLanguage: selectedLanguage,
                });
            }
            // We don't need to handle other statuses here, as the user will stay on this screen
            // until the booking is accepted or they manually go back.

        } catch (error) {
            console.error("Error fetching booking status:", error);
        }
    };

    // The UI remains simple, as it's just a waiting screen.
    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>{getText('Booking Status', 'حالة الحجز')}</Text>
                <ActivityIndicator size="large" color="#8B4513" style={styles.spinner} />
                <Text style={styles.statusText}>{getText('Waiting for captain to accept...', 'في انتظار قبول الكابتن...')}</Text>
                <Text style={styles.infoText}>{getText('This screen will update automatically.', 'سيتم تحديث هذه الشاشة تلقائيًا.')}</Text>
                <TouchableOpacity 
                    style={styles.homeButton} 
                    onPress={() => navigation.popToTop()} // Go back to the main user dashboard
                >
                    <Text style={styles.homeButtonText}>{getText('Go to Dashboard', 'العودة إلى اللوحة الرئيسية')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

// Your styles are perfect and have not been changed.
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#8B4513',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    card: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#8B4513',
        marginBottom: 20,
    },
    spinner: {
        marginVertical: 20,
    },
    statusText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#000',
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 15,
    },
    infoText: {
        fontSize: 14,
        color: '#8B4513',
        opacity: 0.8,
        textAlign: 'center',
        marginBottom: 30,
    },
    homeButton: {
        backgroundColor: '#8B4513',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 10,
    },
    homeButtonText: {
        color: '#FFD700',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default BookingStatusScreen;

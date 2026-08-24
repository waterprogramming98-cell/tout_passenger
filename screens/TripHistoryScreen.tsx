// screens/TripHistoryScreen.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { API_ENDPOINTS } from '../services/api';

/* =========================================================
   TYPES & CONSTANTS
========================================================= */

interface ExtendedUserData {
  user_id?: number;
  captain_id?: number;
  name: string;
  email?: string;
  phone_number: string;
  status?: string;
  token?: string;
}

interface TripHistoryParams {
  selectedLanguage?: string;
  token?: string;
  userData?: ExtendedUserData;
}

const CANCELLATION_REASONS = [
  'Captain is not moving',
  'Captain is going the wrong way',
  'I booked by mistake',
  'I found a different ride',
  'My reason is not listed (Other)',
];

type Props = NativeStackScreenProps<RootStackParamList, 'TripHistory'>;

const TripHistoryScreen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const params = (route.params as TripHistoryParams) || {};
  
  const { 
    selectedLanguage = 'English', 
    token: routeToken,
    userData 
  } = params;

  /* =========================================================
     ROBUST TOKEN EXTRACTION & CLEANING
  ========================================================= */
  const getCleanToken = () => {
    // 1. Try to get token from multiple sources
    let rawToken = routeToken || userData?.token || '';

    // 2. If it's an object (common issue), extract the string
    if (typeof rawToken === 'object' && rawToken !== null) {
      console.log('DEBUG: Token was an object, extracting string...');
      rawToken = (rawToken as any).token || (rawToken as any).jwt || '';
    }

    // 3. Ensure it's a string and trim whitespace
    const finalToken = String(rawToken).trim();

    // 4. Validate JWT structure (must have 3 parts separated by dots)
    if (finalToken && finalToken.split('.').length !== 3) {
      console.log('DEBUG: Token format invalid (segments count mismatch)');
    }

    return finalToken;
  };

  const token = getCleanToken();

  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [selectedReason, setSelectedReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // Prevent infinite alert loops
  const hasAlertedRef = useRef(false);

  const getText = (en: string, ar: string) =>
    selectedLanguage === 'Arabic' ? ar : en;

  const getStatusDetails = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'completed') return { text: getText('Completed', 'مكتمل'), color: '#2ECC71', isCompleted: true, canCancel: false };
    if (s === 'cancelled') return { text: getText('Cancelled', 'ملغي'), color: '#E74C3C', isCompleted: false, canCancel: false };
    if (s === 'pending' || s === 'accepted' || s === 'in_progress') return { text: getText('In Progress', 'قيد التنفيذ'), color: '#FFD700', isCompleted: false, canCancel: true };
    return { text: status || getText('Unknown', 'غير معروف'), color: '#999', isCompleted: false, canCancel: false };
  };

  const fetchTripHistory = useCallback(async () => {
    if (!token || token.split('.').length !== 3) {
      console.log('TRIP HISTORY: Invalid or missing token segments');
      setLoading(false);
      return;
    }

    try {
      if (!refreshing) setLoading(true);

      const response = await fetch(API_ENDPOINTS.USER_BOOKING_HISTORY, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Handle Unauthorized
      if (response.status === 401) {
        if (!hasAlertedRef.current) {
          hasAlertedRef.current = true;
          Alert.alert(
            getText('Session Expired', 'انتهت الجلسة'),
            getText('Please login again.', 'يرجى تسجيل الدخول مرة أخرى.'),
            [{ text: 'OK' }]
          );
        }
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`Server Error (${response.status})`);
      }

      const data = await response.json();
      const tripsArray = Array.isArray(data) ? data : [];
      
      tripsArray.sort((a: any, b: any) => 
        new Date(b.booking_time).getTime() - new Date(a.booking_time).getTime()
      );

      setTrips(tripsArray);
      hasAlertedRef.current = false; // Reset on success
    } catch (error: any) {
      console.log('TRIP HISTORY ERROR:', error);
      if (!hasAlertedRef.current) {
        Alert.alert(getText('Error', 'خطأ'), error.message || 'Failed to load trips');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, getText, refreshing]);

  useEffect(() => {
    fetchTripHistory();
  }, []); // Run once on mount

  const onRefresh = () => {
    setRefreshing(true);
    fetchTripHistory();
  };

  const handleRateTrip = (booking: any) => {
    navigation.navigate('SubmitReview' as any, {
      selectedLanguage,
      token,
      bookingDetails: {
        booking_id: booking.booking_id,
        captain_name: booking.captain_name,
      },
    });
  };

  const handleCancelPress = (trip: any) => {
    setSelectedTrip(trip);
    setSelectedReason('');
    setOtherReason('');
    setIsModalVisible(true);
  };

  const handleConfirmCancellation = async () => {
    if (!selectedReason) {
      Alert.alert(getText('Validation Error', 'خطأ'), getText('Please select a reason.', 'يرجى اختيار سبب.'));
      return;
    }
    if (selectedReason === 'My reason is not listed (Other)' && !otherReason.trim()) {
      Alert.alert(getText('Validation Error', 'خطأ'), getText('Please specify your reason.', 'يرجى تحديد السبب.'));
      return;
    }

    try {
      setIsCancelling(true);
      const finalReason = selectedReason === 'My reason is not listed (Other)' ? otherReason : selectedReason;

      const response = await fetch(`https://toutsroutes.com/api/bookings/${selectedTrip.booking_id}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason: finalReason }),
      });

      if (!response.ok) throw new Error('Failed to cancel trip');

      Alert.alert(getText('Success', 'نجاح'), getText('Trip cancelled successfully.', 'تم إلغاء الرحلة بنجاح'));
      setIsModalVisible(false);
      fetchTripHistory();
    } catch (error: any) {
      Alert.alert(getText('Error', 'خطأ'), error.message);
    } finally {
      setIsCancelling(false);
    }
  };

  const renderTripItem = ({ item }: { item: any }) => {
    const status = getStatusDetails(item.status);
    return (
      <View style={styles.tripCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.captainName}>{item.captain_name || getText('Unknown Captain', 'كابتن غير معروف')}</Text>
          <View style={[styles.statusBadge, { borderColor: status.color }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.text}</Text>
          </View>
        </View>
        <Text style={styles.routeText}>{getText('From:', 'من:')} {item.pickup_address || '-'}</Text>
        <Text style={styles.routeText}>{getText('To:', 'إلى:')} {item.dropoff_address || '-'}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>{item.booking_time ? new Date(item.booking_time).toLocaleDateString(selectedLanguage === 'Arabic' ? 'ar-EG' : 'en-GB') : '-'}</Text>
          <Text style={styles.fareText}>{item.final_fare || item.estimated_fare || 0} EGP</Text>
        </View>
        <View style={styles.cardActions}>
          {status.canCancel && (
            <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancelPress(item)}>
              <Text style={styles.cancelButtonText}>{getText('Cancel Trip', 'إلغاء الرحلة')}</Text>
            </TouchableOpacity>
          )}
          {status.isCompleted && (
            <TouchableOpacity style={styles.rateButton} onPress={() => handleRateTrip(item)}>
              <Text style={styles.rateButtonText}>{getText('Rate Trip', 'تقييم الرحلة')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={trips}
        keyExtractor={(item) => item.booking_id.toString()}
        renderItem={renderTripItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#D4AF37']} />}
        ListEmptyComponent={!loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{getText('No trips found.', 'لا توجد رحلات.')}</Text>
          </View>
        ) : null}
      />
      {loading && !refreshing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#D4AF37" />
        </View>
      )}
      <Modal visible={isModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{getText('Cancel Trip', 'إلغاء الرحلة')}</Text>
            <Text style={styles.modalSubtitle}>{getText('Why are you cancelling?', 'لماذا تريد الإلغاء؟')}</Text>
            {CANCELLATION_REASONS.map((reason) => (
              <TouchableOpacity key={reason} style={styles.reasonOption} onPress={() => setSelectedReason(reason)}>
                <View style={styles.radioButton}>{selectedReason === reason && <View style={styles.radioButtonInner} />}</View>
                <Text style={styles.reasonText}>{reason}</Text>
              </TouchableOpacity>
            ))}
            {selectedReason === 'My reason is not listed (Other)' && (
              <TextInput style={styles.otherInput} placeholder={getText('Enter reason...', 'أدخل السبب...')} value={otherReason} onChangeText={setOtherReason} multiline />
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setIsModalVisible(false)}>
                <Text style={styles.closeButtonText}>{getText('Close', 'إغلاق')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.confirmButton, isCancelling && { opacity: 0.6 }]} onPress={handleConfirmCancellation} disabled={isCancelling}>
                {isCancelling ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.confirmButtonText}>{getText('Confirm', 'تأكيد')}</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  listContent: { padding: 16, paddingBottom: 40 },
  tripCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  captainName: { fontSize: 16, fontWeight: '700', color: '#333' },
  statusBadge: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: '600' },
  routeText: { fontSize: 14, color: '#666', marginBottom: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#EEE' },
  dateText: { fontSize: 14, color: '#999' },
  fareText: { fontSize: 16, fontWeight: '700', color: '#D4AF37' },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
  cancelButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#FDECEA' },
  cancelButtonText: { color: '#E74C3C', fontSize: 14, fontWeight: '600' },
  rateButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#EAF9F1' },
  rateButtonText: { color: '#2ECC71', fontSize: 14, fontWeight: '600' },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.7)', justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 16, color: '#999' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '100%' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#333', marginBottom: 8 },
  modalSubtitle: { fontSize: 14, color: '#666', marginBottom: 20 },
  reasonOption: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  radioButton: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#D4AF37', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  radioButtonInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#D4AF37' },
  reasonText: { fontSize: 15, color: '#444' },
  otherInput: { borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 12, height: 80, textAlignVertical: 'top', marginBottom: 20 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
  closeButton: { paddingVertical: 10, paddingHorizontal: 20, marginRight: 10 },
  closeButtonText: { color: '#999', fontSize: 16, fontWeight: '600' },
  confirmButton: { backgroundColor: '#D4AF37', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, minWidth: 100, alignItems: 'center' },
  confirmButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default TripHistoryScreen;